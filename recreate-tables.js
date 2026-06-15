const pool = require('./src/db');

const recreateTables = async () => {
    console.log('🔧 Recreando tablas...');
    
    try {
        // Eliminar tablas si existen
        await pool.query('DROP TABLE IF EXISTS evaluaciones_iro');
        await pool.query('DROP TABLE IF EXISTS evaluaciones_ici');
        console.log('✅ Tablas eliminadas');
        
        // Crear tabla IRO
        await pool.query(`
            CREATE TABLE evaluaciones_iro (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER,
                ingresos DECIMAL(15,2),
                ingresos_anterior DECIMAL(15,2),
                utilidad DECIMAL(15,2),
                utilidad_anterior DECIMAL(15,2),
                csat DECIMAL(5,2),
                nps DECIMAL(6,2),
                retencion_clientes DECIMAL(5,2),
                cumplimiento_plazos DECIMAL(5,2),
                eficiencia DECIMAL(5,2),
                indice_calidad DECIMAL(5,2),
                rotacion_personal DECIMAL(5,2),
                horas_capacitacion DECIMAL(10,2),
                compromiso DECIMAL(5,2),
                dim_financiera DECIMAL(5,2),
                dim_clientes DECIMAL(5,2),
                dim_procesos DECIMAL(5,2),
                dim_aprendizaje DECIMAL(5,2),
                iro_total DECIMAL(5,2),
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla evaluaciones_iro creada');
        
        // Crear tabla ICI
        await pool.query(`
            CREATE TABLE evaluaciones_ici (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER,
                ventas_nuevos_productos DECIMAL(5,2),
                num_mejoras_productos INTEGER,
                num_nuevos_servicios INTEGER,
                porcentaje_digitalizacion DECIMAL(5,2),
                reduccion_tiempos_operativos DECIMAL(5,2),
                adopcion_tecnologias DECIMAL(5,2),
                nuevos_canales_venta INTEGER,
                marketing_digital DECIMAL(5,2),
                campanas_innovadoras INTEGER,
                horas_capacitacion_innovacion INTEGER,
                alianzas_universidades INTEGER,
                cultura_innovadora DECIMAL(5,2),
                dim_productos DECIMAL(5,2),
                dim_procesos DECIMAL(5,2),
                dim_comercial DECIMAL(5,2),
                dim_organizacional DECIMAL(5,2),
                ici_total DECIMAL(5,2),
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla evaluaciones_ici creada');
        
        console.log('🔧 Tablas recreadas exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

recreateTables();