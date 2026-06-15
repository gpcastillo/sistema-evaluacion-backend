const express = require('express');
const { guardarEvaluacionICI, getEvaluacionesICI } = require('../controllers/ici.controller');
const router = express.Router();

router.post('/', guardarEvaluacionICI);
router.get('/empresa/:empresa_id', getEvaluacionesICI);

module.exports = router;