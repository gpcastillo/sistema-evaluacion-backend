const pool = require('./src/db');

const createTables = async () => {
    try {
        // Tabla de evaluaciones IRO
        await pool.query(`
            CREATE TABLE IF NOT EXISTS evaluaciones_iro (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
                
                -- Datos financieros
                ingresos DECIMAL(12,2),
                ingresos_anterior DECIMAL(12,2),
                utilidad DECIMAL(12,2),
                utilidad_anterior DECIMAL(12,2),
                crecimiento_ingresos DECIMAL(5,2),
                crecimiento_utilidad DECIMAL(5,2),
                
                -- Datos de clientes
                csat DECIMAL(3,2),
                nps DECIMAL(3,2),
                retencion_clientes DECIMAL(5,2),
                
                -- Datos de procesos
                cumplimiento_plazos DECIMAL(5,2),
                eficiencia DECIMAL(5,2),
                indice_calidad DECIMAL(5,2),
                
                -- Datos de aprendizaje (DAC)
                rotacion_personal DECIMAL(5,2),
                horas_capacitacion INTEGER,
                compromiso DECIMAL(5,2),
                
                -- Resultados
                dim_financiera DECIMAL(5,2),
                dim_clientes DECIMAL(5,2),
                dim_procesos DECIMAL(5,2),
                dim_aprendizaje DECIMAL(5,2),
                iro_total DECIMAL(5,2),
                
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabla "evaluaciones_iro" creada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear tabla:', error.message);
        process.exit(1);
    }
};

createTables();