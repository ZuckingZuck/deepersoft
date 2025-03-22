const router = require("express").Router();
const { CreateProject, GetProjects } = require("../controller/project");

router.get("/", GetProjects);
router.post("/", CreateProject);

module.exports = router;