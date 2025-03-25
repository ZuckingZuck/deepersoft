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
        const projectLogs = await ProjectLogDB.find({ project: id }).populate("user", "fullName");
        const projectPozes = await ProjectPozDB.find({ project: id }).populate("poz").populate("user", "fullName");
        if (!project) {
            return res.status(404).json({ message: "Proje bulunamadı." });
        }
        res.status(200).json({ project: project,pozes: projectPozes, logs: projectLogs});
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
    AddProjectLog, DeleteProjectLog, AddProjectPoz, ChangeProjectStatus
 };
