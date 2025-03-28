const router = require("express").Router();
const { GetSysRequirements, GetUser } = require("../controller/requirements");

router.get("/sys", GetSysRequirements);
router.get("/user/:id", GetUser);

module.exports = router;