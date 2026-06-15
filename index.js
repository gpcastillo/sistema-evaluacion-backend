const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./src/db');
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================
// RUTAS DE PRUEBA (funcionan en local y producción)
// ====================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '🚀 Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({ 
            success: true, 
            message: '✅ Conexión a PostgreSQL exitosa',
            time: result.rows[0].current_time
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: '❌ Error al conectar a PostgreSQL',
            error: error.message
        });
    }
});

// ====================
// RUTAS DE EMPRESAS
// ====================

app.post('/api/empresas', async (req, res) => {
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
});

app.get('/api/empresas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM empresas ORDER BY id DESC');
        res.json({ success: true, empresas: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================
// FUNCIONES DE UTILIDAD (normalizar y calcular crecimiento)
// ====================

const normalizar = (valor, min, max) => {
    if (valor === null || valor === undefined) return 0;
    let normalizado = ((valor - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, normalizado));
};

const calcularCrecimiento = (actual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
};

// ====================
// RUTAS DE IRO (Rendimiento Organizacional)
// ====================

app.post('/api/iro', async (req, res) => {
    const { 
        empresa_id, 
        ingresos, ingresos_anterior, 
        utilidad, utilidad_anterior,
        csat, nps, retencion_clientes,
        cumplimiento_plazos, eficiencia, indice_calidad,
        rotacion_personal, horas_capacitacion, compromiso 
    } = req.body;
    
    try {
        // Calcular dimensiones
        const crecimientoIngresos = calcularCrecimiento(ingresos, ingresos_anterior);
        const crecimientoUtilidad = calcularCrecimiento(utilidad, utilidad_anterior);
        
        const dimFinanciera = (normalizar(ingresos, 0, 1000000) + normalizar(utilidad, 0, 100000) + normalizar(crecimientoIngresos, -100, 100) + normalizar(crecimientoUtilidad, -100, 100)) / 4;
        const dimClientes = (normalizar(csat, 1, 5) + normalizar(nps, -100, 100) + normalizar(retencion_clientes, 0, 100)) / 3;
        const dimProcesos = (normalizar(cumplimiento_plazos, 0, 100) + normalizar(eficiencia, 0, 100) + normalizar(indice_calidad, 0, 100)) / 3;
        const dimAprendizaje = (normalizar(100 - rotacion_personal, 0, 100) + normalizar(horas_capacitacion, 0, 100) + normalizar(compromiso, 0, 100)) / 3;
        const iroTotal = (dimFinanciera + dimClientes + dimProcesos + dimAprendizaje) / 4;
        
        const resultados = {
            dim_financiera: Math.round(dimFinanciera * 100) / 100,
            dim_clientes: Math.round(dimClientes * 100) / 100,
            dim_procesos: Math.round(dimProcesos * 100) / 100,
            dim_aprendizaje: Math.round(dimAprendizaje * 100) / 100,
            iro_total: Math.round(iroTotal * 100) / 100
        };
        
        res.json({ success: true, message: 'Cálculo IRO realizado', resultados });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Guardar evaluación IRO
app.post('/api/iro/guardar', async (req, res) => {
    const { empresa_id, ingresos, ingresos_anterior, utilidad, utilidad_anterior, csat, nps, retencion_clientes, cumplimiento_plazos, eficiencia, indice_calidad, rotacion_personal, horas_capacitacion, compromiso, resultados } = req.body;
    
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS evaluaciones_iro (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER,
                ingresos DECIMAL(15,2), ingresos_anterior DECIMAL(15,2),
                utilidad DECIMAL(15,2), utilidad_anterior DECIMAL(15,2),
                csat DECIMAL(5,2), nps DECIMAL(6,2), retencion_clientes DECIMAL(5,2),
                cumplimiento_plazos DECIMAL(5,2), eficiencia DECIMAL(5,2), indice_calidad DECIMAL(5,2),
                rotacion_personal DECIMAL(5,2), horas_capacitacion DECIMAL(10,2), compromiso DECIMAL(5,2),
                dim_financiera DECIMAL(5,2), dim_clientes DECIMAL(5,2),
                dim_procesos DECIMAL(5,2), dim_aprendizaje DECIMAL(5,2), iro_total DECIMAL(5,2),
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const result = await pool.query(`
            INSERT INTO evaluaciones_iro (
                empresa_id, ingresos, ingresos_anterior, utilidad, utilidad_anterior,
                csat, nps, retencion_clientes, cumplimiento_plazos, eficiencia, indice_calidad,
                rotacion_personal, horas_capacitacion, compromiso,
                dim_financiera, dim_clientes, dim_procesos, dim_aprendizaje, iro_total
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id
        `, [
            empresa_id, ingresos, ingresos_anterior, utilidad, utilidad_anterior,
            csat, nps, retencion_clientes, cumplimiento_plazos, eficiencia, indice_calidad,
            rotacion_personal, horas_capacitacion, compromiso,
            resultados.dim_financiera, resultados.dim_clientes,
            resultados.dim_procesos, resultados.dim_aprendizaje,
            resultados.iro_total
        ]);
        
        res.json({ success: true, message: 'Evaluación IRO guardada', id: result.rows[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/iro/empresa/:empresa_id', async (req, res) => {
    const { empresa_id } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM evaluaciones_iro WHERE empresa_id = $1 ORDER BY fecha_evaluacion DESC`, [empresa_id]);
        res.json({ success: true, evaluaciones: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================
// RUTAS DE ICI (Capacidad de Innovación)
// ====================

app.post('/api/ici', async (req, res) => {
    const { 
        ventas_nuevos_productos, num_mejoras_productos, num_nuevos_servicios,
        porcentaje_digitalizacion, reduccion_tiempos_operativos, adopcion_tecnologias,
        nuevos_canales_venta, marketing_digital, campanas_innovadoras,
        horas_capacitacion_innovacion, alianzas_universidades, cultura_innovadora 
    } = req.body;
    
    try {
        const dimProductos = (normalizar(ventas_nuevos_productos, 0, 100) + normalizar(num_mejoras_productos, 0, 20) + normalizar(num_nuevos_servicios, 0, 10)) / 3;
        const dimProcesosInnovacion = (normalizar(porcentaje_digitalizacion, 0, 100) + normalizar(reduccion_tiempos_operativos, 0, 100) + normalizar(adopcion_tecnologias, 0, 100)) / 3;
        const dimComercial = (normalizar(nuevos_canales_venta, 0, 10) + normalizar(marketing_digital, 0, 100) + normalizar(campanas_innovadoras, 0, 20)) / 3;
        const dimOrganizacional = (normalizar(horas_capacitacion_innovacion, 0, 100) + normalizar(alianzas_universidades, 0, 10) + normalizar(cultura_innovadora, 0, 100)) / 3;
        const iciTotal = (dimProductos + dimProcesosInnovacion + dimComercial + dimOrganizacional) / 4;
        
        const resultados = {
            dim_productos: Math.round(dimProductos * 100) / 100,
            dim_procesos: Math.round(dimProcesosInnovacion * 100) / 100,
            dim_comercial: Math.round(dimComercial * 100) / 100,
            dim_organizacional: Math.round(dimOrganizacional * 100) / 100,
            ici_total: Math.round(iciTotal * 100) / 100
        };
        
        res.json({ success: true, message: 'Cálculo ICI realizado', resultados });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Guardar evaluación ICI
app.post('/api/ici/guardar', async (req, res) => {
    const { empresa_id, ventas_nuevos_productos, num_mejoras_productos, num_nuevos_servicios, porcentaje_digitalizacion, reduccion_tiempos_operativos, adopcion_tecnologias, nuevos_canales_venta, marketing_digital, campanas_innovadoras, horas_capacitacion_innovacion, alianzas_universidades, cultura_innovadora, resultados } = req.body;
    
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS evaluaciones_ici (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER,
                ventas_nuevos_productos DECIMAL(5,2), num_mejoras_productos INTEGER, num_nuevos_servicios INTEGER,
                porcentaje_digitalizacion DECIMAL(5,2), reduccion_tiempos_operativos DECIMAL(5,2), adopcion_tecnologias DECIMAL(5,2),
                nuevos_canales_venta INTEGER, marketing_digital DECIMAL(5,2), campanas_innovadoras INTEGER,
                horas_capacitacion_innovacion INTEGER, alianzas_universidades INTEGER, cultura_innovadora DECIMAL(5,2),
                dim_productos DECIMAL(5,2), dim_procesos DECIMAL(5,2), dim_comercial DECIMAL(5,2), dim_organizacional DECIMAL(5,2), ici_total DECIMAL(5,2),
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const result = await pool.query(`
            INSERT INTO evaluaciones_ici (
                empresa_id, ventas_nuevos_productos, num_mejoras_productos, num_nuevos_servicios,
                porcentaje_digitalizacion, reduccion_tiempos_operativos, adopcion_tecnologias,
                nuevos_canales_venta, marketing_digital, campanas_innovadoras,
                horas_capacitacion_innovacion, alianzas_universidades, cultura_innovadora,
                dim_productos, dim_procesos, dim_comercial, dim_organizacional, ici_total
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING id
        `, [
            empresa_id, ventas_nuevos_productos, num_mejoras_productos, num_nuevos_servicios,
            porcentaje_digitalizacion, reduccion_tiempos_operativos, adopcion_tecnologias,
            nuevos_canales_venta, marketing_digital, campanas_innovadoras,
            horas_capacitacion_innovacion, alianzas_universidades, cultura_innovadora,
            resultados.dim_productos, resultados.dim_procesos, resultados.dim_comercial,
            resultados.dim_organizacional, resultados.ici_total
        ]);
        
        res.json({ success: true, message: 'Evaluación ICI guardada', id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/ici/empresa/:empresa_id', async (req, res) => {
    const { empresa_id } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM evaluaciones_ici WHERE empresa_id = $1 ORDER BY fecha_evaluacion DESC`, [empresa_id]);
        res.json({ success: true, evaluaciones: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================
// MANEJO DE RUTAS NO ENCONTRADAS
// ====================

app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` 
    });
});

// ====================
// INICIAR EL SERVIDOR
// ====================

app.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 Servidor iniciado exitosamente
    📡 Puerto: ${PORT}
    🔗 API disponible en: http://localhost:${PORT}
    🧪 Prueba: http://localhost:${PORT}/api/health
    🌐 Producción: https://sistema-evaluacion-backend.onrender.com
    ========================================
    `);
});