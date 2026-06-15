const pool = require('../db');

const crearEmpresa = async (req, res) => {
    const { nombre, ruc } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO empresas (nombre, ruc) VALUES ($1, $2) RETURNING *',
            [nombre, ruc]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Empresa creada exitosamente',
            empresa: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear empresa',
            error: error.message
        });
    }
};

const obtenerEmpresas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM empresas ORDER BY id DESC');
        res.json({ success: true, empresas: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { crearEmpresa, obtenerEmpresas };