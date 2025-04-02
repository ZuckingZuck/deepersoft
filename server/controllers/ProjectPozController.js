const ProjectPoz = require("../model/ProjectPoz");
const Project = require("../model/Project");
const Poz = require("../model/Poz");

// Projeye poz ekle
exports.addPozToProject = async (req, res) => {
    try {
        const { projectId, pozId, quantity, notes } = req.body;

        // Poz bilgilerini getir
        const poz = await Poz.findById(pozId);
        if (!poz) {
            return res.status(404).json({ message: "Poz bulunamadı" });
        }

        // Proje kontrolü
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı" });
        }

        // Toplam fiyat hesapla
        const totalPrice = poz.price * quantity;

        // Yeni proje poz'u oluştur
        const projectPoz = new ProjectPoz({
            projectId,
            pozId,
            name: poz.name,
            description: poz.description,
            unit: poz.unit,
            price: poz.price,
            quantity,
            totalPrice,
            notes,
            status: "Beklemede"
        });

        await projectPoz.save();

        // Projenin toplam fiyatını güncelle
        project.totalPrice += totalPrice;
        await project.save();

        res.status(201).json({
            message: "Poz projeye başarıyla eklendi",
            projectPoz
        });
    } catch (error) {
        console.error("Poz ekleme hatası:", error);
        res.status(500).json({ message: "Poz eklenirken bir hata oluştu" });
    }
};

// Proje poz'unu güncelle
exports.updateProjectPoz = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, status, notes } = req.body;

        const projectPoz = await ProjectPoz.findById(id);
        if (!projectPoz) {
            return res.status(404).json({ message: "Proje poz'u bulunamadı" });
        }

        // Eski toplam fiyatı projeden çıkar
        const project = await Project.findById(projectPoz.projectId);
        project.totalPrice -= projectPoz.totalPrice;

        // Yeni toplam fiyatı hesapla
        projectPoz.quantity = quantity;
        projectPoz.totalPrice = projectPoz.price * quantity;
        projectPoz.status = status;
        projectPoz.notes = notes;

        await projectPoz.save();

        // Yeni toplam fiyatı projeye ekle
        project.totalPrice += projectPoz.totalPrice;
        await project.save();

        res.json({
            message: "Proje poz'u başarıyla güncellendi",
            projectPoz
        });
    } catch (error) {
        console.error("Poz güncelleme hatası:", error);
        res.status(500).json({ message: "Poz güncellenirken bir hata oluştu" });
    }
};

// Proje poz'unu sil
exports.deleteProjectPoz = async (req, res) => {
    try {
        const { id } = req.params;

        const projectPoz = await ProjectPoz.findById(id);
        if (!projectPoz) {
            return res.status(404).json({ message: "Proje poz'u bulunamadı" });
        }

        // Toplam fiyatı projeden çıkar
        const project = await Project.findById(projectPoz.projectId);
        project.totalPrice -= projectPoz.totalPrice;
        await project.save();

        // Proje poz'unu sil
        await projectPoz.deleteOne();

        res.json({ message: "Proje poz'u başarıyla silindi" });
    } catch (error) {
        console.error("Poz silme hatası:", error);
        res.status(500).json({ message: "Poz silinirken bir hata oluştu" });
    }
};

// Proje poz'larını getir
exports.getProjectPozlar = async (req, res) => {
    try {
        const { projectId } = req.params;
        const projectPozlar = await ProjectPoz.find({ projectId });
        res.json(projectPozlar);
    } catch (error) {
        console.error("Poz listesi getirme hatası:", error);
        res.status(500).json({ message: "Poz listesi alınırken bir hata oluştu" });
    }
}; 