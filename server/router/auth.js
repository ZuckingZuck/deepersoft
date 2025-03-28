const router = require("express").Router();
const { CreateUser, LoginUser, GetUsers } = require("../controller/auth");
const requireAuth = require("../middleware/authControl");

router.post("/createuser", CreateUser);
router.post("/login", LoginUser);
router.get("/users", requireAuth, GetUsers);

module.exports = router;
