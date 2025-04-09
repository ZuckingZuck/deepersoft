const router = require("express").Router();
const { CreateUser, LoginUser, GetUsers, DeleteUser } = require("../controller/auth");
const requireAuth = require("../middleware/authControl");

router.post("/createuser",requireAuth, CreateUser);
router.post("/login", LoginUser);
router.get("/users", requireAuth, GetUsers);
router.delete("/users/:id", requireAuth, DeleteUser);

module.exports = router;
