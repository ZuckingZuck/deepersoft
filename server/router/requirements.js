const router = require("express").Router();
const { GetSysRequirements, GetUser } = require("../controller/requirements");
const requireAuth = require("../middleware/authControl");

router.use(requireAuth);

router.get("/sys", GetSysRequirements);
router.get("/user/:id", GetUser);

module.exports = router;