const router = require("express").Router();
const { AddLocalStock, TransferStock, GetMyStock, RefundStock, GetLocalStock, GetLocalStockLog, GetStockTransferLog } = require("../controller/stock");
const requireAuth = require("../middleware/authControl");

router.use(requireAuth);
router.post("/local", AddLocalStock);
router.post("/transfer", TransferStock);
router.get("/mystock", GetMyStock);
router.post("/refund", RefundStock);
router.get("/local", GetLocalStock);
router.get("/local/log", GetLocalStockLog);
router.get("/transfer/log", GetStockTransferLog);
module.exports = router;