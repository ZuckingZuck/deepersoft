const router = require("express").Router();
const { CreateProject, GetProjects, GetProjectDetail, DeleteProject, AddProjectLog, DeleteProjectLog, 
    AddProjectPoz, ChangeProjectStatus, DeleteProjectPoz, AddProjectDocument, DeleteProjectDocument,
    SearchProject } = require("../controller/project");
const requireAuth = require("../middleware/authControl"); 


router.use(requireAuth);
//Project
router.get("/", GetProjects);
router.get("/search", SearchProject);
router.get("/:id", GetProjectDetail);

router.post("/", CreateProject);
router.delete("/:id", DeleteProject);
router.put("/status/:id", ChangeProjectStatus);

//Log
router.post("/log/:id", AddProjectLog);
router.delete("/log/:id", DeleteProjectLog);

//Poz
router.post("/poz/:projectId", AddProjectPoz);
router.delete("/poz/:id", DeleteProjectPoz);

//Document
router.post("/document", AddProjectDocument);
router.delete("/document/:id", DeleteProjectDocument);

module.exports = router;