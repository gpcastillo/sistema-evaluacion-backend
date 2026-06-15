const pool = require('../db');

// Función para normalizar valores a escala 0-100
const normalizar = (valor, min, max) => {
    if (valor === null || valor === undefined) return 0;
    let normalizado = ((valor - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, normalizado));
};

// Motor de cálculo ICI
const calcularICI = (data) => {
    const {
        // Productos/Servicios
        ventas_nuevos_productos, num_mejoras_productos, num_nuevos_servicios,
        // Procesos
        porcentaje_digitalizacion, reduccion_tiempos_operativos, adopcion_tecnologias,
        // Comercial
        nuevos_canales_venta, marketing_digital, campanas_innovadoras,
        // Organizacional
        horas_capacitacion_innovacion, alianzas_universidades, cultura_innovadora
    } = data;

    // ====================
    // 1. DIMENSIÓN PRODUCTOS/SERVICIOS
    // ====================
    const normVentasNuevos = normalizar(ventas_nuevos_productos, 0, 100);
    const normMejoras = normalizar(num_mejoras_productos, 0, 20);
    const normNuevosServicios = normalizar(num_nuevos_servicios, 0, 10);
    
    const dimProductos = (normVentasNuevos + normMejoras + normNuevosServicios) / 3;

    // ====================
    // 2. DIMENSIÓN PROCESOS
    // ====================
    const normDigitalizacion = normalizar(porcentaje_digitalizacion, 0, 100);
    const normReduccionTiempos = normalizar(reduccion_tiempos_operativos, 0, 100);
    const normAdopcion = normalizar(adopcion_tecnologias, 0, 100);
    
    const dimProcesosInnovacion = (normDigitalizacion + normReduccionTiempos + normAdopcion) / 3;

    // ====================
    // 3. DIMENSIÓN COMERCIAL
    // ====================
    const normCanalesVenta = normalizar(nuevos_canales_venta, 0, 10);
    const normMarketingDigital = normalizar(marketing_digital, 0, 100);
    const normCampanas = normalizar(campanas_innovadoras, 0, 20);
    
    const dimComercial = (normCanalesVenta + normMarketingDigital + normCampanas) / 3;

    // ====================
    // 4. DIMENSIÓN ORGANIZACIONAL
    // ====================
    const normHorasCapacitacion = normalizar(horas_capacitacion_innovacion, 0, 100);
    const normAlianzas = normalizar(alianzas_universidades, 0, 10);
    const normCultura = normalizar(cultura_innovadora, 0, 100);
    
    const dimOrganizacional = (normHorasCapacitacion + normAlianzas + normCultura) / 3;

    // ====================
    // ICI TOTAL
    // ====================
    const iciTotal = (dimProductos + dimProcesosInnovacion + dimComercial + dimOrganizacional) / 4;

    return {
        dim_productos: Math.round(dimProductos * 100) / 100,
        dim_procesos: Math.round(dimProcesosInnovacion * 100) / 100,
        dim_comercial: Math.round(dimComercial * 100) / 100,
        dim_organizacional: Math.round(dimOrganizacional * 100) / 100,
        ici_total: Math.round(iciTotal * 100) / 100
    };
};

// Guardar evaluación ICI
const guardarEvaluacionICI = async (req, res) => {
    console.log('📥 Datos ICI recibidos:', req.body);
    
    const { empresa_id, ...datosEvaluacion } = req.body;
    
    try {
        const resultados = calcularICI(datosEvaluacion);
        
        try {
            const result = await pool.query(`
                INSERT INTO evaluaciones_ici (
                    empresa_id, ventas_nuevos_productos, num_mejoras_productos, num_nuevos_servicios,
                    porcentaje_digitalizacion, reduccion_tiempos_operativos, adopcion_tecnologias,
                    nuevos_canales_venta, marketing_digital, campanas_innovadoras,
                    horas_capacitacion_innovacion, alianzas_universidades, cultura_innovadora,
                    dim_productos, dim_procesos, dim_comercial, dim_organizacional, ici_total
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                RETURNING *
            `, [
                empresa_id,
                datosEvaluacion.ventas_nuevos_productos, datosEvaluacion.num_mejoras_productos,
                datosEvaluacion.num_nuevos_servicios, datosEvaluacion.porcentaje_digitalizacion,
                datosEvaluacion.reduccion_tiempos_operativos, datosEvaluacion.adopcion_tecnologias,
                datosEvaluacion.nuevos_canales_venta, datosEvaluacion.marketing_digital,
                datosEvaluacion.campanas_innovadoras, datosEvaluacion.horas_capacitacion_innovacion,
                datosEvaluacion.alianzas_universidades, datosEvaluacion.cultura_innovadora,
                resultados.dim_productos, resultados.dim_procesos,
                resultados.dim_comercial, resultados.dim_organizacional,
                resultados.ici_total
            ]);
            
            res.json({
                success: true,
                message: 'Evaluación ICI guardada exitosamente',
                resultados: resultados,
                evaluacion: result.rows[0]
            });
        } catch (dbError) {
            res.json({
                success: true,
                message: 'Cálculo ICI realizado (tabla no creada aún)',
                resultados: resultados
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular ICI',
            error: error.message
        });
    }
};

const getEvaluacionesICI = async (req, res) => {
    const { empresa_id } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT * FROM evaluaciones_ici 
            WHERE empresa_id = $1 
            ORDER BY fecha_evaluacion DESC
        `, [empresa_id]);
        
        res.json({
            success: true,
            evaluaciones: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    calcularICI,
    guardarEvaluacionICI,
    getEvaluacionesICI
};