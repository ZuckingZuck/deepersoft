const ProjectDB = require("../model/Project");
const ProjectLogDB = require("../model/ProjectLog");
const ProjectPozDB = require("../model/ProjectPoz");
const ProjectDocumentDB = require("../model/ProjectDocument");
const StockDB = require("../model/Stock");
const PozDB = require("../model/Poz");
const fetch = require('node-fetch');

//Project
const CreateProject = async (req, res) => {
    try {
        const user = req.user;
        
        // Taşeron kullanıcılar proje oluşturamaz
        if (user.userType === 'Taşeron') {
            return res.status(403).json({ message: "Proje oluşturma yetkiniz yok" });
        }

        const projectData = req.body;
        const newProject = new ProjectDB(projectData);
        await newProject.save();
        const newProjectLog = new ProjectLogDB({ user: req.user._id, project: newProject._id, note: "Proje oluşturuldu." });
        await newProjectLog.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const GetProjects = async (req, res) => {
    try {
        const user = req.user;
        const { projectStatus } = req.query;
        console.log("İstek geldi");
        
        // Temel filtreyi oluştur
        let filter = {};
        
        // Status filtresi varsa ekle
        if (projectStatus) {
            filter.status = projectStatus;
        }
        
        // Taşeron kullanıcılar için sadece kendi projelerini göster
        if (user && user.userType === 'Taşeron') {
            filter.contractor = user._id;
        }
        
        console.log("Filtre:", filter);
        
        const projects = await ProjectDB.find(filter)
            .populate({
                path: 'supervisor',
                select: 'fullName email phone userType',
                model: 'users'
            })
            .populate({
                path: 'contractor',
                select: 'fullName email phone userType',
                model: 'users'
            });
        
        console.log("Bulunan projeler:", projects.length);
        
        if (projects.length > 0) {
            console.log("İlk proje supervisor:", projects[0].supervisor ? "Var" : "Yok");
            console.log("İlk proje contractor:", projects[0].contractor ? "Var" : "Yok");
        }
        
        res.status(200).json(projects);
    } catch (error) {
        console.log("Hata:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const GetProjectDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        
        // Mongoose'un kendi populate yöntemini kullanalım - daha güvenilir
        const project = await ProjectDB.findById(id)
            .populate("supervisor", "fullName email phone userType")
            .populate("contractor", "fullName email phone userType");
        
        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı." });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && project.contractor._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu projeye erişim yetkiniz yok" });
        }

        console.log(project);
        // Populate durumunu kontrol edip logla
        console.log("Supervisor populate durumu:", project.supervisor ? "Başarılı" : "Başarısız");
        console.log("Contractor populate durumu:", project.contractor ? "Başarılı" : "Başarısız");
        
        const projectLogs = await ProjectLogDB.find({ project: id }).populate("user", "fullName");
        const projectPozes = await ProjectPozDB.find({ project: id }).populate("poz").populate("user", "fullName");
        const projectDocuments = await ProjectDocumentDB.find({ project: id }).populate("user", "fullName");
        res.status(200).json({ 
            project: project, 
            logs: projectLogs, 
            pozes: projectPozes,
            documents: projectDocuments
        });
    } catch (error) {
        console.log("Hata:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const DeleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProject = await ProjectDB.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(404).json({ message: "Proje bulunamadı." });
        }
        res.status(200).json({ message: "Proje başarıyla silindi." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

//Logs
const AddProjectLog = async (req, res) => {
    try {
        const user = req.user;
        const project = await ProjectDB.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && project.contractor.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu projeye not ekleme yetkiniz yok" });
        }

        const newProjectLog = new ProjectLogDB({
            user: user._id,
            project: project._id,
            note: req.body.note
        });
        await newProjectLog.save();
        res.status(200).json(newProjectLog);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const DeleteProjectLog = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProject = await ProjectLogDB.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(404).json({ message: "Log bulunamadı." });
        }
        res.status(200).json({ message: "Log başarıyla silindi." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

//Project Poz
const AddProjectPoz = async (req, res) => {
    try {
        const user = req.user;
        const project = await ProjectDB.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && project.contractor.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu projeye poz ekleme yetkiniz yok" });
        }

        const selectedPoz = await PozDB.findById(req.body.poz);
        const userStock = await StockDB.findOne({ user: user._id, poz: selectedPoz._id });

        const newProjectPoz = new ProjectPozDB({ 
            project: project._id, 
            user: user._id, 
            poz: req.body.poz, 
            amount: req.body.amount 
        });

        if (selectedPoz.priceType.includes("M")) {
            if (!userStock) {
                await new StockDB({ user: user, poz: req.body.poz, amount: req.body.amount * -1 }).save();
            } else {
                userStock.amount -= req.body.amount;
                await userStock.save();
            }
        }
        
        await newProjectPoz.save();
        return res.status(200).json(newProjectPoz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const DeleteProjectPoz = async (req, res) => {
    try {
        const user = req.user;
        const projectPoz = await ProjectPozDB.findById(req.params.id)
            .populate('project');

        if (!projectPoz) {
            return res.status(404).json({ message: "Poz bulunamadı" });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && projectPoz.project.contractor.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu pozu silme yetkiniz yok" });
        }

        // Eğer malzeme ise ve miktar varsa, stok işlemi yap
        if (projectPoz.poz.priceType.includes("M") && projectPoz.amount) {
            // Kullanıcının stoğunu bul
            const userStock = await StockDB.findOne({
                user: projectPoz.user,
                poz: projectPoz.poz._id
            });

            if (userStock) {
                // Stok varsa miktarı geri ekle
                userStock.amount += projectPoz.amount;
                await userStock.save();
                console.log("Stok güncellendi:", userStock);
            } else {
                // Stok yoksa yeni stok oluştur
                await StockDB.create({
                    user: projectPoz.project.contractor,
                    poz: projectPoz.poz._id,
                    amount: projectPoz.amount
                });
                console.log("Yeni stok oluşturuldu");
            }
        }

        // Pozu sil
        await ProjectPozDB.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Poz başarıyla silindi" });
    } catch (error) {
        console.error("Poz silme hatası:", error);
        res.status(500).json({ message: "Poz silinirken bir hata oluştu" });
    }
};

const ChangeProjectStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const project = await ProjectDB.findById(id);
        project.status = status;
        await project.save();
        res.status(200).json({ message: "Proje durumu başarıyla değiştirildi." });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

// Project Documents
const AddProjectDocument = async (req, res) => {
    try {
        const user = req.user;
        const project = await ProjectDB.findById(req.body.project);

        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && project.contractor.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu projeye belge ekleme yetkiniz yok" });
        }

        const newDocument = new ProjectDocumentDB({
            project: project._id,
            documentType: req.body.documentType,
            documentUrl: req.body.documentUrl,
            user: user._id
        });
        await newDocument.save();
        res.status(200).json(newDocument);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Proje belgesi eklenirken bir hata oluştu." });
    }
};

const GetProjectDocuments = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Proje var mı kontrol et
        const existingProject = await ProjectDB.findById(projectId);
        if (!existingProject) {
            return res.status(404).json({ message: "Proje bulunamadı." });
        }
        
        const documents = await ProjectDocumentDB.find({ project: projectId })
            .populate("user", "fullName email")
            .sort({ createdAt: -1 });
        
        res.status(200).json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Proje belgeleri alınırken bir hata oluştu." });
    }
};

const DeleteProjectDocument = async (req, res) => {
    try {
        const user = req.user;
        const document = await ProjectDocumentDB.findById(req.params.id)
            .populate('project');

        if (!document) {
            return res.status(404).json({ message: "Belge bulunamadı" });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && document.project.contractor.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu belgeyi silme yetkiniz yok" });
        }

        // CDN'den dosyayı silme işlemi
        try {
            // Belgenin URL'inden dosya adını çıkar
            const documentUrl = document.documentUrl;
            const fileNameWithParams = documentUrl.split('/').pop();
            // URL'de query parametreleri varsa onları temizle (? işaretinden sonraki kısmı at)
            const fileName = fileNameWithParams.split('?')[0];
            
            console.log("Silinecek dosya adı:", fileName);
            
            // CDN sunucusundan dosyayı sil
            const cdnUrl = process.env.CDN_URL || 'http://localhost:5000';
            const deleteResponse = await fetch(`${cdnUrl}/api/files/${fileName}`, {
                method: 'DELETE'
            });
            
            if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json();
                console.error(`CDN'den dosya silinirken hata: ${JSON.stringify(errorData)}`);
            } else {
                console.log(`CDN'den dosya başarıyla silindi: ${fileName}`);
            }
        } catch (cdnError) {
            console.error('CDN dosya silme hatası:', cdnError);
            // CDN hatası olsa bile veritabanından silme işlemine devam et
        }
        
        // Veritabanından belge kaydını sil
        await ProjectDocumentDB.findByIdAndDelete(req.params.id);
        
        // Proje logu ekle
        const documentLogNote = `"${document.documentType}" belge tipindeki doküman silindi.`;
        await new ProjectLogDB({ 
            user: user._id, 
            project: document.project._id, 
            note: documentLogNote 
        }).save();
        
        res.status(200).json({ message: "Proje belgesi başarıyla silindi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Proje belgesi silinirken bir hata oluştu." });
    }
};

// Proje detaylarını getir
const GetProject = async (req, res) => {
    try {
        const user = req.user;
        const project = await ProjectDB.findById(req.params.id)
            .populate('contractor', 'fullName email phone userType')
            .populate('supervisor', 'fullName email phone userType')
            .lean();

        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && project.contractor._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu projeye erişim yetkiniz yok" });
        }

        // Proje loglarını getir
        const logs = await ProjectLogDB.find({ project: project._id })
            .populate('user', 'fullName')
            .sort({ createdAt: -1 })
            .lean();

        // Proje pozlarını getir
        const pozes = await ProjectPozDB.find({ project: project._id })
            .populate('poz')
            .populate('user', 'fullName')
            .lean();

        // Proje belgelerini getir
        const documents = await ProjectDocumentDB.find({ project: project._id })
            .populate('user', 'fullName')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            project,
            logs,
            pozes,
            documents
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// Tüm projeleri getir
const GetAllProjects = async (req, res) => {
    try {
        const user = req.user;
        let query = {};

        // Taşeron kullanıcılar sadece kendi projelerini görebilir
        if (user.userType === 'Taşeron') {
            query.contractor = user._id;
        }

        const projects = await ProjectDB.find(query)
            .populate('contractor', 'fullName')
            .populate('supervisor', 'fullName')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(projects);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = { 
    CreateProject, GetProjects, GetProjectDetail, DeleteProject,
    AddProjectLog, DeleteProjectLog, AddProjectPoz, ChangeProjectStatus, DeleteProjectPoz,
    AddProjectDocument, GetProjectDocuments, DeleteProjectDocument, GetProject, GetAllProjects
};
