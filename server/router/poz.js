const router = require("express").Router();
const { AddorUpdatePoz, BulkAddorUpdatePoz, DeletePoz, GetPozes } = require("../controller/poz");

router.get("/", GetPozes);
router.post("/", AddorUpdatePoz);
router.post("/bulk", BulkAddorUpdatePoz);
router.delete("/:id", DeletePoz);

module.exports = router;