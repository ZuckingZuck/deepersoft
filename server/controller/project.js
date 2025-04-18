const ProjectDB = require("../model/Project");
const ProjectLogDB = require("../model/ProjectLog");
const ProjectPozDB = require("../model/ProjectPoz");
const ProjectDocumentDB = require("../model/ProjectDocument");
const StockDB = require("../model/Stock");
const PozDB = require("../model/Poz");
const ContractorPozPriceDB = require("../model/ContractorPozPrice");
const FieldTypeDB = require("../model/FieldType");
const UserDB = require("../model/User");
const fetch = require('node-fetch');
const ContractorPozPrice = require("../model/ContractorPozPrice");


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

const UpdateProject = async (req, res) => {
    try {
        const user = req.user;

        // Taşeron kullanıcılar proje güncelleyemez
        if (user.userType === 'Taşeron') {
            return res.status(403).json({ message: "Proje güncelleme yetkiniz yok" });
        }

        const { id } = req.params;
        const updatedData = req.body;

        const existingProject = await ProjectDB.findById(id);
        if (!existingProject) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        // Proje verilerini güncelle
        Object.assign(existingProject, updatedData);
        await existingProject.save();

        // Güncelleme log'u kaydet
        const updateLog = new ProjectLogDB({
            user: req.user._id,
            project: existingProject._id,
            note: "Proje güncellendi."
        });
        await updateLog.save();

        res.status(200).json(existingProject);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};


const CreateProjectFromExcel = async (req, res) => {
    try {
        const projects = req.body.projects;

        if (!Array.isArray(projects)) {
            return res.status(400).json({ message: "Invalid data format" });
        }

        const operations = projects.map(async (pj) => {
            // contractor ve supervisor sorgularını aynı anda başlat
            console.log(pj);
            const [contractorUser, supervisorUser, fieldType] = await Promise.all([
                UserDB.findOne({ userName: pj.contractor }),
                UserDB.findOne({ userType: "Supervisor" }),
                FieldTypeDB.findOne({ code: pj.fieldType.toString() })
            ]);

            if (!contractorUser) {
                throw { status: 404, message: `Contractor not found: ${pj.contractor}` };
            }

            if (!supervisorUser) {
                throw { status: 404, message: `Supervisor not found: İstanbulsupervizör` };
            }

            if (!fieldType) {
                throw { status: 404, message: `fieldType not found` };
            }

            const newProject = new ProjectDB({
                name: "ASYA TCELL",
                fieldType: fieldType.name,
                clusterName: "ISTAD-UMRANIYE_GPON_2023-1",
                fieldName: pj.fieldName,
                ddo: pj.ddo,
                tellcordiaNo: pj.tellcordiaNo,
                loc: pj.loc,
                sir: pj.sir,
                homePass: pj.homePass,
                date: Date.now(),
                contractor: contractorUser._id,
                supervisor: supervisorUser._id
            });

            return await newProject.save();
        });

        const updatedProjects = await Promise.all(operations);
        res.status(200).json(updatedProjects);

    } catch (error) {
        console.error(error);

        if (error.status === 404) {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Internal server error", error });
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

        // Projeyi bul
        const project = await ProjectDB.findById(id)
            .populate('supervisor')
            .populate('contractor');

        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        // Pozları getir
        const pozes = await ProjectPozDB.find({ projectId: id }).populate('pozId');

        // Logları getir
        const logs = await ProjectLogDB.find({ project: id })
            .populate('user')
            .sort({ createdAt: -1 });

        // Belgeleri getir
        const documents = await ProjectDocumentDB.find({ project: id })
            .populate('user')
            .sort({ createdAt: -1 });

        // Kullanıcı tipine göre poz fiyatlarını filtrele
        let filteredPozes = pozes;
        if (user.userType === 'Taşeron') {
            filteredPozes = pozes.map(poz => ({
                ...poz.toObject(),
                price: poz.contractorPrice || poz.price,
                totalPrice: poz.contractorTotalPrice || poz.totalPrice
            }));
        }

        res.json({
            project,
            pozes: filteredPozes,
            logs,
            documents
        });
    } catch (error) {
        console.error('Proje detayları alınırken hata:', error);
        res.status(500).json({ message: "Proje detayları alınırken bir hata oluştu" });
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
        const { projectId } = req.params;
        const { pozId, amount } = req.body;
        const user = req.user;

        // Poz'un var olup olmadığını kontrol et
        const poz = await PozDB.findById(pozId);
        if (!poz) {
            return res.status(404).json({ message: "Poz bulunamadı" });
        }

        const project = await ProjectDB.findById(projectId);

        const constractorPozPrice = await ContractorPozPriceDB.findOne({
            contractorId: project.contractor,
            pozId: poz._id
        });

        // Projenin var olup olmadığını kontrol et

        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        //Projede kayıtlı total price üzerine ekleme yap.
        project.totalPrice += poz.price * amount;
        project.totalContractorPrice += constractorPozPrice.price * amount;

        // Yeni ProjectPoz oluştur
        const projectPoz = new ProjectPozDB({
            projectId,
            pozId,
            name: poz.name,
            unit: poz.unit,
            price: poz.price,
            quantity: amount,
            contractorPrice: constractorPozPrice.price
        });

        await project.save();
        await projectPoz.save();

        // Stok işlemleri

        // Mevcut stok kontrolü
        let stock = await StockDB.findOne({
            user: project.contractor,
            poz: pozId
        });

        if (stock) {
            // Stok varsa güncelle
            stock.amount -= amount;
            await stock.save();
        } else {
            // Stok yoksa yeni oluştur
            stock = new StockDB({
                user: project.contractor,
                poz: pozId,
                amount: -amount // Negatif değer olarak kaydet
            });
            await stock.save();
        }


        res.status(201).json(projectPoz);
    } catch (error) {
        console.error('Poz eklenirken hata:', error);
        res.status(500).json({ message: "Poz eklenirken bir hata oluştu" });
    }
};

const DeleteProjectPoz = async (req, res) => {
    try {
        const user = req.user;
        const projectPoz = await ProjectPozDB.findById(req.params.id)
            .populate("pozId", "priceType");

        const currentProject = await ProjectDB.findById(projectPoz.projectId)
        currentProject.totalPrice -= projectPoz.price * projectPoz.quantity;
        currentProject.totalContractorPrice -= projectPoz.contractorPrice * projectPoz.quantity;
        console.log("projectpoz", projectPoz);
        if (!projectPoz) {
            return res.status(404).json({ message: "Poz bulunamadı" });
        }

        // Yetki kontrolü
        if (user.userType === 'Taşeron' && currentProject.contractor.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu pozu silme yetkiniz yok" });
        }

        // Eğer malzeme ise ve miktar varsa, stok işlemi yap
        if (projectPoz.pozId.priceType.includes("M") && projectPoz.quantity) {
            console.log(projectPoz, "bu porject poz *********")
            // Kullanıcının stoğunu bul
            const userStock = await StockDB.findOne({
                user: currentProject.contractor,
                poz: projectPoz.pozId._id
            });

            if (userStock) {
                // Stok varsa miktarı geri ekle
                userStock.amount += projectPoz.quantity;
                await userStock.save();
                console.log("Stok güncellendi:", userStock);
            } else {
                // Stok yoksa yeni stok oluştur
                await StockDB.create({
                    user: currentProject.contractor,
                    poz: projectPoz.poz._id,
                    amount: projectPoz.quantity
                });
                console.log("Yeni stok oluşturuldu");
            }
        }

        // Pozu sil
        await currentProject.save();
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
        const pozes = await ProjectPozDB.find({ projectId: project._id })
            .sort({ createdAt: -1 })
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

const SearchProject = async (req, res) => {
    try {
        const user = req.user;
        const {
            name,
            status,
            fieldType,
            city,
            clusterName,
            fieldName,
            ddo,
            tellcordiaNo,
            homePass,
            contractor,
            supervisor,
            startDate,
            endDate
        } = req.query;

        // Temel filtreyi oluştur
        let filter = {};

        // Taşeron kullanıcılar için sadece kendi projelerini göster
        if (user.userType === 'Taşeron') {
            filter.contractor = user._id;
        }

        // Diğer filtreleri ekle
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (status) filter.status = status;
        if (fieldType) filter.fieldType = fieldType;
        if (city) filter.city = { $regex: city, $options: 'i' };
        if (clusterName) filter.clusterName = { $regex: clusterName, $options: 'i' };
        if (fieldName) filter.fieldName = { $regex: fieldName, $options: 'i' };
        if (ddo) filter.ddo = { $regex: ddo, $options: 'i' };
        if (tellcordiaNo) filter.tellcordiaNo = { $regex: tellcordiaNo, $options: 'i' };
        if (homePass) filter.homePass = { $regex: homePass, $options: 'i' };
        if (contractor) filter.contractor = contractor;
        if (supervisor) filter.supervisor = supervisor;

        // Tarih filtresi
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

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
            })
            .sort({ createdAt: -1 });

        res.status(200).json(projects);
    } catch (error) {
        console.error("Arama hatası:", error);
        res.status(500).json({ message: "Arama sırasında bir hata oluştu." });
    }
};

// Poz güncelleme fonksiyonu
const UpdateProjectPoz = async (req, res) => {
    try {
        const { pozId } = req.params;
        const { quantity, status, notes, contractorPrice } = req.body;

        const projectPoz = await ProjectPozDB.findById(pozId);
        if (!projectPoz) {
            return res.status(404).json({ message: "Poz bulunamadı" });
        }

        // Güncelleme yap
        projectPoz.quantity = quantity || projectPoz.quantity;
        projectPoz.status = status || projectPoz.status;
        projectPoz.notes = notes || projectPoz.notes;
        projectPoz.contractorPrice = contractorPrice !== undefined ? contractorPrice : projectPoz.contractorPrice;

        await projectPoz.save();

        res.json(projectPoz);
    } catch (error) {
        console.error('Poz güncellenirken hata:', error);
        res.status(500).json({ message: "Poz güncellenirken bir hata oluştu" });
    }
};

module.exports = {
    CreateProject, UpdateProject, GetProjects, GetProjectDetail, DeleteProject,
    AddProjectLog, DeleteProjectLog, AddProjectPoz, ChangeProjectStatus, DeleteProjectPoz,
    AddProjectDocument, GetProjectDocuments, DeleteProjectDocument, GetProject, GetAllProjects,
    SearchProject, UpdateProjectPoz, CreateProjectFromExcel
};
