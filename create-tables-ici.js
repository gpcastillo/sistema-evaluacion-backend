const pool = require('./src/db');

const createTables = async () => {
    try {
        // Tabla de evaluaciones ICI
        await pool.query(`
            CREATE TABLE IF NOT EXISTS evaluaciones_ici (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
                
                -- Innovación en Productos/Servicios
                ventas_nuevos_productos DECIMAL(5,2),
                num_mejoras_productos INTEGER,
                num_nuevos_servicios INTEGER,
                
                -- Innovación en Procesos
                porcentaje_digitalizacion DECIMAL(5,2),
                reduccion_tiempos_operativos DECIMAL(5,2),
                adopcion_tecnologias DECIMAL(5,2),
                
                -- Innovación Comercial
                nuevos_canales_venta INTEGER,
                marketing_digital DECIMAL(5,2),
                campanas_innovadoras INTEGER,
                
                -- Innovación Organizacional
                horas_capacitacion_innovacion INTEGER,
                alianzas_universidades INTEGER,
                cultura_innovadora DECIMAL(5,2),
                
                -- Resultados
                dim_productos DECIMAL(5,2),
                dim_procesos DECIMAL(5,2),
                dim_comercial DECIMAL(5,2),
                dim_organizacional DECIMAL(5,2),
                ici_total DECIMAL(5,2),
                
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabla "evaluaciones_ici" creada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear tabla:', error.message);
        process.exit(1);
    }
};

createTables();