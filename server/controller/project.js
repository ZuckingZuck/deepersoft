const ProjectDB = require("../model/Project");
const ProjectLogDB = require("../model/ProjectLog");
const ProjectPozDB = require("../model/ProjectPoz");
const StockDB = require("../model/Stock");
const PozDB = require("../model/Poz");

//Project
const CreateProject = async (req, res) => {
    try {
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
        const { projectStatus } = req.query; // Query parametresinden status al
        console.log("İstek geldi")
        const filter = projectStatus ? { status: projectStatus } : {}; // Eğer varsa filtre uygula
        console.log("Filtre:", filter);
        
        // Mongoose'un kendi populate yöntemini kullanalım - daha güvenilir
        const projects = await ProjectDB.find(filter)
            .populate({
                path: 'supervisor',
                select: 'fullName email phone userType', // Gereken alanları seçelim
                model: 'users' // Model adını belirtelim
            })
            .populate({
                path: 'contractor',
                select: 'fullName email phone userType', // Gereken alanları seçelim
                model: 'users' // Model adını belirtelim
            });
        
        console.log("Bulunan projeler:", projects.length);
        
        // İlk projenin supervisor ve contractor bilgilerini kontrol edelim
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
        
        // Mongoose'un kendi populate yöntemini kullanalım - daha güvenilir
        const project = await ProjectDB.findById(id)
            .populate("supervisor", "fullName email phone userType")
            .populate("contractor", "fullName email phone userType");
        
        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı." });
        }
        console.log(project);
        // Populate durumunu kontrol edip logla
        console.log("Supervisor populate durumu:", project.supervisor ? "Başarılı" : "Başarısız");
        console.log("Contractor populate durumu:", project.contractor ? "Başarılı" : "Başarısız");
        
        const projectLogs = await ProjectLogDB.find({ project: id }).populate("user", "fullName");
        const projectPozes = await ProjectPozDB.find({ project: id }).populate("poz").populate("user", "fullName");
        
        res.status(200).json({ 
            project: project, 
            logs: projectLogs, 
            pozes: projectPozes 
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
        const { note } = req.body;
        const id = req.params.id;

        const newProjectLog = new ProjectLogDB({ user: user._id, project: id, note: note });
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
        const projectId = req.params.id;
        const user = req.user;
        const { poz, amount } = req.body;

        const selectedPoz = await PozDB.findById(poz);
        const userStock = await StockDB.findOne({ user: user._id, poz: selectedPoz._id });

        const newProjectPoz = new ProjectPozDB({ project: projectId, user: user._id, poz, amount });

        if (selectedPoz.priceType.includes("M")) {
            if (!userStock) {
                await new StockDB({ user: user, poz, amount: amount * -1 }).save();
            } else {
                userStock.amount -= amount;
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
        const { id } = req.params;
        console.log("Silinecek poz ID:", id);

        // Önce pozu bul
        const projectPoz = await ProjectPozDB.findById(id).populate('poz');
        if (!projectPoz) {
            return res.status(404).json({ message: "Poz bulunamadı" });
        }

        // Eğer malzeme ise ve miktar varsa, stok işlemi yap
        if (projectPoz.poz.priceType.includes("M") && projectPoz.amount) {
            // Projeyi bul
            const project = await ProjectDB.findById(projectPoz.project);
            if (!project) {
                return res.status(404).json({ message: "Proje bulunamadı" });
            }

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
                    user: project.contractor,
                    poz: projectPoz.poz._id,
                    amount: projectPoz.amount
                });
                console.log("Yeni stok oluşturuldu");
            }
        }

        // Pozu sil
        const deletedPoz = await ProjectPozDB.findByIdAndDelete(id);
        if (!deletedPoz) {
            return res.status(404).json({ message: "Poz silinemedi" });
        }

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

module.exports = { 
    CreateProject, GetProjects, GetProjectDetail, DeleteProject,
    AddProjectLog, DeleteProjectLog, AddProjectPoz, ChangeProjectStatus, DeleteProjectPoz
 };
