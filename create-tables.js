const pool = require('./src/db');

const createTables = async () => {
    try {
        // Crear tabla de empresas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS empresas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                ruc VARCHAR(20) UNIQUE,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla "empresas" creada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear tablas:', error.message);
        process.exit(1);
    }
};

createTables();