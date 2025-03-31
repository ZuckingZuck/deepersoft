const router = require('express').Router();
const { GetProjectReport, GetProjectPozReport } = require('../controller/report');

router.get('/project', GetProjectReport);
router.get('/project-poz', GetProjectPozReport);

module.exports = router;

