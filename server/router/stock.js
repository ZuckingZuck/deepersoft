const router = require("express").Router();
const { AddLocalStock, TransferStock, GetMyStock, RefundStock } = require("../controller/stock");
const requireAuth = require("../middleware/authControl");

router.use(requireAuth);
router.post("/local", AddLocalStock);
router.post("/transfer", TransferStock);
router.get("/mystock", GetMyStock);
router.post("/refund", RefundStock);


module.exports = router;