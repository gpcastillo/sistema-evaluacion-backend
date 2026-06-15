const { Pool } = require('pg');
require('dotenv').config();

// Configuración con SSL para AWS RDS
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false  // Permite conexión SSL sin verificar certificado (para desarrollo)
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL:', err.message);
    } else {
        console.log('✅ Conectado a PostgreSQL exitosamente');
        release();
    }
});

module.exports = pool;