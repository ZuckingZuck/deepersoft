const router = require("express").Router();
const { AddLocalStock, TransferStock, GetMyStock } = require("../controller/stock");
const requireAuth = require("../middleware/authControl");

router.use(requireAuth);
router.post("/local", AddLocalStock);
router.post("/transfer", TransferStock);
router.get("/mystock", GetMyStock);



module.exports = router;