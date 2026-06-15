const express = require('express');
const { guardarEvaluacionIRO, getEvaluacionesIRO } = require('../controllers/iro.controller');
const router = express.Router();

router.post('/', guardarEvaluacionIRO);
router.get('/empresa/:empresa_id', getEvaluacionesIRO);

module.exports = router;