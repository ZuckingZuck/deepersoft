const ProjectDB = require("../model/Project");

const CreateProject = async (req, res) => {
    try {
        const projectData = req.body;
        const newProject = new ProjectDB(projectData);
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const GetProjects = async (req, res) => {
    try {
        const projects = await ProjectDB.find()
            .populate('contractor', 'fullName userType')
            .populate('supervisor', 'fullName userType');
        
        res.status(200).json(projects);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};


const GetProjectDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await ProjectDB.findById(id);
        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı." });
        }
        res.status(200).json(project);
    } catch (error) {
        console.log(error);
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

module.exports = { CreateProject, GetProjects, GetProjectDetail, DeleteProject };
