const express = require('express');
const { crearEmpresa, obtenerEmpresas } = require('../controllers/empresas.controller');
const router = express.Router();

router.post('/', crearEmpresa);
router.get('/', obtenerEmpresas);

module.exports = router;