const pool = require('./src/db');

const fixTables = async () => {
    console.log('🔧 Iniciando modificación de tablas...');
    
    try {
        // Modificar tabla IRO
        console.log('📝 Modificando tabla evaluaciones_iro...');
        await pool.query(`
            ALTER TABLE evaluaciones_iro 
            ALTER COLUMN rotacion_personal TYPE DECIMAL(10,2),
            ALTER COLUMN horas_capacitacion TYPE DECIMAL(10,2),
            ALTER COLUMN ingresos TYPE DECIMAL(15,2),
            ALTER COLUMN ingresos_anterior TYPE DECIMAL(15,2),
            ALTER COLUMN utilidad TYPE DECIMAL(15,2),
            ALTER COLUMN utilidad_anterior TYPE DECIMAL(15,2)
        `);
        console.log('✅ Tabla evaluaciones_iro modificada');
    } catch (error) {
        console.log('⚠️ Error al modificar IRO (puede que la tabla no exista):', error.message);
    }
    
    try {
        // Modificar tabla ICI
        console.log('📝 Modificando tabla evaluaciones_ici...');
        await pool.query(`
            ALTER TABLE evaluaciones_ici 
            ALTER COLUMN horas_capacitacion_innovacion TYPE DECIMAL(10,2),
            ALTER COLUMN num_mejoras_productos TYPE DECIMAL(10,2),
            ALTER COLUMN num_nuevos_servicios TYPE DECIMAL(10,2),
            ALTER COLUMN nuevos_canales_venta TYPE DECIMAL(10,2),
            ALTER COLUMN campanas_innovadoras TYPE DECIMAL(10,2),
            ALTER COLUMN alianzas_universidades TYPE DECIMAL(10,2)
        `);
        console.log('✅ Tabla evaluaciones_ici modificada');
    } catch (error) {
        console.log('⚠️ Error al modificar ICI (puede que la tabla no exista):', error.message);
    }
    
    console.log('🔧 Modificación completada');
    process.exit(0);
};

fixTables();