const router = require("express").Router();
const { AddPozType, GetPozTypes, DeletePozType, GetPozUnits, AddPozUnit, DeletePozUnit, GetClusters, AddCluster, DeleteCluster, GetFieldTypes, AddFieldType, DeleteFieldType } = require("../controller/definitions");

router.get("/poztype", GetPozTypes);
router.post("/poztype", AddPozType);
router.delete("/poztype/:id", DeletePozType);

router.get("/pozunit", GetPozUnits);
router.post("/pozunit", AddPozUnit);
router.delete("/pozunit/:id", DeletePozUnit);

router.get("/cluster", GetClusters);
router.post("/cluster", AddCluster);
router.delete("/cluster/:id", DeleteCluster);

router.get("/field", GetFieldTypes);
router.post("/field", AddFieldType);
router.delete("/field/:id", DeleteFieldType)
module.exports = router;