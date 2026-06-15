const pool = require('../db');

// Función para normalizar valores a escala 0-100
const normalizar = (valor, min, max) => {
    if (valor === null || valor === undefined) return 0;
    let normalizado = ((valor - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, normalizado));
};

// Función para calcular crecimiento porcentual
const calcularCrecimiento = (actual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
};

// Motor de cálculo IRO
const calcularIRO = (data) => {
    const {
        ingresos, ingresos_anterior,
        utilidad, utilidad_anterior,
        csat, nps, retencion_clientes,
        cumplimiento_plazos, eficiencia, indice_calidad,
        rotacion_personal, horas_capacitacion, compromiso
    } = data;

    // ====================
    // 1. DIMENSIÓN FINANCIERA
    // ====================
    const crecimientoIngresos = calcularCrecimiento(ingresos, ingresos_anterior);
    const crecimientoUtilidad = calcularCrecimiento(utilidad, utilidad_anterior);
    
    // Normalizar (rangos ajustables según tu tesis)
    const normIngresos = normalizar(ingresos, 0, 1000000);
    const normUtilidad = normalizar(utilidad, 0, 100000);
    const normCrecIngresos = normalizar(crecimientoIngresos, -100, 100);
    const normCrecUtilidad = normalizar(crecimientoUtilidad, -100, 100);
    
    const dimFinanciera = (normIngresos + normUtilidad + normCrecIngresos + normCrecUtilidad) / 4;

    // ====================
    // 2. DIMENSIÓN CLIENTES
    // ====================
    const normCSAT = normalizar(csat, 1, 5);
    const normNPS = normalizar(nps, -100, 100);
    const normRetencion = normalizar(retencion_clientes, 0, 100);
    
    const dimClientes = (normCSAT + normNPS + normRetencion) / 3;

    // ====================
    // 3. DIMENSIÓN PROCESOS INTERNOS
    // ====================
    const normCumplimiento = normalizar(cumplimiento_plazos, 0, 100);
    const normEficiencia = normalizar(eficiencia, 0, 100);
    const normCalidad = normalizar(indice_calidad, 0, 100);
    
    const dimProcesos = (normCumplimiento + normEficiencia + normCalidad) / 3;

    // ====================
    // 4. DIMENSIÓN APRENDIZAJE Y PERSONAS
    // ====================
    const normRotacion = normalizar(100 - rotacion_personal, 0, 100);
    const normHoras = normalizar(horas_capacitacion, 0, 100);
    const normCompromiso = normalizar(compromiso, 0, 100);
    
    const dimAprendizaje = (normRotacion + normHoras + normCompromiso) / 3;

    // ====================
    // IRO TOTAL
    // ====================
    const iroTotal = (dimFinanciera + dimClientes + dimProcesos + dimAprendizaje) / 4;

    return {
        dim_financiera: Math.round(dimFinanciera * 100) / 100,
        dim_clientes: Math.round(dimClientes * 100) / 100,
        dim_procesos: Math.round(dimProcesos * 100) / 100,
        dim_aprendizaje: Math.round(dimAprendizaje * 100) / 100,
        iro_total: Math.round(iroTotal * 100) / 100
    };
};

// Guardar evaluación IRO
const guardarEvaluacionIRO = async (req, res) => {
    console.log('📥 Datos recibidos:', req.body);
    
    const { empresa_id, ...datosEvaluacion } = req.body;
    
    try {
        // Calcular índices
        const resultados = calcularIRO(datosEvaluacion);
        
        // Verificar si la tabla existe, si no, solo devolvemos el cálculo
        try {
            const result = await pool.query(`
                INSERT INTO evaluaciones_iro (
                    empresa_id, ingresos, ingresos_anterior, utilidad, utilidad_anterior,
                    csat, nps, retencion_clientes, cumplimiento_plazos, eficiencia,
                    indice_calidad, rotacion_personal, horas_capacitacion, compromiso,
                    dim_financiera, dim_clientes, dim_procesos, dim_aprendizaje, iro_total
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                RETURNING *
            `, [
                empresa_id,
                datosEvaluacion.ingresos, datosEvaluacion.ingresos_anterior,
                datosEvaluacion.utilidad, datosEvaluacion.utilidad_anterior,
                datosEvaluacion.csat, datosEvaluacion.nps, datosEvaluacion.retencion_clientes,
                datosEvaluacion.cumplimiento_plazos, datosEvaluacion.eficiencia,
                datosEvaluacion.indice_calidad, datosEvaluacion.rotacion_personal,
                datosEvaluacion.horas_capacitacion, datosEvaluacion.compromiso,
                resultados.dim_financiera, resultados.dim_clientes,
                resultados.dim_procesos, resultados.dim_aprendizaje,
                resultados.iro_total
            ]);
            
            res.json({
                success: true,
                message: 'Evaluación IRO guardada exitosamente',
                resultados: resultados,
                evaluacion: result.rows[0]
            });
        } catch (dbError) {
            // Si la tabla no existe, solo devolvemos el cálculo
            res.json({
                success: true,
                message: 'Cálculo IRO realizado (tabla no creada aún)',
                resultados: resultados
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular IRO',
            error: error.message
        });
    }
};

const getEvaluacionesIRO = async (req, res) => {
    const { empresa_id } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT * FROM evaluaciones_iro 
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
    calcularIRO,
    guardarEvaluacionIRO,
    getEvaluacionesIRO
};