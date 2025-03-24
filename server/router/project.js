const router = require("express").Router();
const { CreateProject, GetProjects, GetProjectDetail, DeleteProject, AddProjectLog, DeleteProjectLog, AddProjectPoz } = require("../controller/project");
const requireAuth = require("../middleware/authControl"); 

router.use(requireAuth);

//Project
router.get("/", GetProjects);
router.get("/:id", GetProjectDetail);
router.post("/", CreateProject);
router.delete("/:id", DeleteProject);

//Log
router.post("/log/:id", AddProjectLog);
router.delete("/log/:id", DeleteProjectLog);

//Poz
router.post("/poz/:id", AddProjectPoz);

module.exports = router;