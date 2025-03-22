const router = require("express").Router();
const { CreateUser, LoginUser } = require("../controller/auth");

router.post("/createuser", CreateUser);
router.post("/login", LoginUser);

module.exports = router;
