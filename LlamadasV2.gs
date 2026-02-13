// ============================================================================
// ARCHIVO: LlamadasV2.gs (ARCHIVO INDEPENDIENTE)
// ============================================================================
// Sistema 40 Caldas - U Caldas
// Módulo de Llamadas v2 - Gestión de Encuestas
// Fecha: 2026-02-08
// ============================================================================
// INSTRUCCIONES:
// 1. En Apps Script: "+" → "Script" → Nombrar: LlamadasV2
// 2. Pegar TODO este contenido
// 3. Guardar y redesplegar
// ============================================================================

// ============================================
// CONFIGURACIÓN DEL MÓDULO
// ============================================
var CFG_LLAMADAS_V2_ = {
  SPREADSHEET_ID: '1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s',
  HOJA_DATOS: 'Registros',
  HOJA_ENCUESTA_LOG: 'Encuesta-Llamadas',
  TOTAL_OPERADORES_ASIGNADOS: 8
};

// ============================================
// COLUMNAS DE LA HOJA "Simpatizantes"
// ============================================
// A(1):  Nombre Completo
// B(2):  Tipo Documento
// C(3):  Número Documento
// D(4):  Número Celular
// E(5):  Dirección
// F(6):  Barrio
// G(7):  Departamento
// H(8):  Municipio
// I(9):  Ha sido
// J(10): ID Líder
// K(11): Nombre Líder
// L(12): Fecha Registro
// M(13): PUESTO VOTACIÓN
// N(14): MESA
// O(15): CONTESTO
// P(16): CONOCE REFERENTE
// Q(17): CONOCE CANDIDATO
// R(18): VOTARIA POR CANDIDATO
// S(19): SABE VOTAR U/1
// T(20): CONOCE MESA/PUESTO
// U(21): INFO WHATSAPP
// V(22): LISTADO 14 MAYO

var COL_ENCUESTA_ = {
  PUESTO_VOTACION: 13,  // M
  MESA: 14,             // N
  CONTESTO: 15,         // O
  CONOCE_REFERENTE: 16, // P
  CONOCE_CANDIDATO: 17, // Q
  VOTARIA: 18,          // R
  SABE_VOTAR: 19,       // S
  CONOCE_MESA_PUESTO: 20, // T
  INFO_WHATSAPP: 21,    // U
  LISTADO_14_MAYO: 22   // V
};


// ============================================
// TABLA DE USUARIOS Y CONTRASEÑAS
// ============================================
var USUARIOS_LLAMADAS_ = {
  // === 20 OPERADORES ===
  'operador1':  { clave: 'Op2026*01', nombre: 'OPERADOR 1',  rol: 'operador', numero: 1 },
  'operador2':  { clave: 'Op2026*02', nombre: 'OPERADOR 2',  rol: 'operador', numero: 2 },
  'operador3':  { clave: 'Op2026*03', nombre: 'OPERADOR 3',  rol: 'operador', numero: 3 },
  'operador4':  { clave: 'Op2026*04', nombre: 'OPERADOR 4',  rol: 'operador', numero: 4 },
  'operador5':  { clave: 'Op2026*05', nombre: 'OPERADOR 5',  rol: 'operador', numero: 5 },
  'operador6':  { clave: 'Op2026*06', nombre: 'OPERADOR 6',  rol: 'operador', numero: 6 },
  'operador7':  { clave: 'Op2026*07', nombre: 'OPERADOR 7',  rol: 'operador', numero: 7 },
  'operador8':  { clave: 'Op2026*08', nombre: 'OPERADOR 8',  rol: 'operador', numero: 8 },
  'operador9':  { clave: 'Op2026*09', nombre: 'OPERADOR 9',  rol: 'operador', numero: 9 },
  'operador10': { clave: 'Op2026*10', nombre: 'OPERADOR 10', rol: 'operador', numero: 10 },
  'operador11': { clave: 'Op2026*11', nombre: 'OPERADOR 11', rol: 'operador', numero: 11 },
  'operador12': { clave: 'Op2026*12', nombre: 'OPERADOR 12', rol: 'operador', numero: 12 },
  'operador13': { clave: 'Op2026*13', nombre: 'OPERADOR 13', rol: 'operador', numero: 13 },
  'operador14': { clave: 'Op2026*14', nombre: 'OPERADOR 14', rol: 'operador', numero: 14 },
  'operador15': { clave: 'Op2026*15', nombre: 'OPERADOR 15', rol: 'operador', numero: 15 },
  'operador16': { clave: 'Op2026*16', nombre: 'OPERADOR 16', rol: 'operador', numero: 16 },
  'operador17': { clave: 'Op2026*17', nombre: 'OPERADOR 17', rol: 'operador', numero: 17 },
  'operador18': { clave: 'Op2026*18', nombre: 'OPERADOR 18', rol: 'operador', numero: 18 },
  'operador19': { clave: 'Op2026*19', nombre: 'OPERADOR 19', rol: 'operador', numero: 19 },
  'operador20': { clave: 'Op2026*20', nombre: 'OPERADOR 20', rol: 'operador', numero: 20 },
  // === COORDINADORES ===
  'coordinador1': { clave: 'Coord2026*01', nombre: 'COORDINADOR 1', rol: 'coordinador', numero: 0 },
  'coordinador2': { clave: 'Coord2026*02', nombre: 'COORDINADOR 2', rol: 'coordinador', numero: 0 }
};


// ============================================
// AUTENTICACIÓN
// ============================================
function autenticarUsuarioLlamadasWrapper(usuario, clave) {
  try {
    var user = (usuario || '').toLowerCase().trim();
    
    if (!USUARIOS_LLAMADAS_[user]) {
      return { success: false, message: 'Usuario no encontrado' };
    }
    
    if (USUARIOS_LLAMADAS_[user].clave !== clave) {
      return { success: false, message: 'Contraseña incorrecta' };
    }
    
    return { 
      success: true, 
      nombre: USUARIOS_LLAMADAS_[user].nombre,
      rol: USUARIOS_LLAMADAS_[user].rol,
      usuario: user,
      numeroOperador: USUARIOS_LLAMADAS_[user].numero
    };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}


// ============================================
// DISTRIBUCIÓN EQUITATIVA DE REGISTROS
// ============================================
// Fórmula: (filaReal - 2) % 8 → operador (0-7) → +1 = número operador
// Fila 2 → operador1, Fila 3 → operador2, ... Fila 9 → operador8,
// Fila 10 → operador1, Fila 11 → operador2, etc.
// ============================================
function calcularOperadorAsignado_(filaReal) {
  var totalOp = CFG_LLAMADAS_V2_.TOTAL_OPERADORES_ASIGNADOS;
  return ((filaReal - 2) % totalOp) + 1;
}


// ============================================
// OBTENER REGISTROS ASIGNADOS AL OPERADOR
// ============================================
function obtenerRegistrosOperadorWrapper(numeroOperador) {
  try {
    var ss = SpreadsheetApp.openById(CFG_LLAMADAS_V2_.SPREADSHEET_ID);
    var hoja = ss.getSheetByName(CFG_LLAMADAS_V2_.HOJA_DATOS);
    
    if (!hoja) {
      return { success: false, message: 'Hoja "' + CFG_LLAMADAS_V2_.HOJA_DATOS + '" no encontrada' };
    }
    
    var ultimaFila = hoja.getLastRow();
    var ultimaColumna = hoja.getLastColumn();
    
    if (ultimaFila < 2) {
      return { success: true, datos: [], totalGeneral: 0, totalAsignados: 0 };
    }
    
    // Leer todas las filas
    var datos = hoja.getRange(2, 1, ultimaFila - 1, ultimaColumna).getValues();
    var totalGeneral = datos.length;
    var resultado = [];
    var numOp = parseInt(numeroOperador);
    
    for (var f = 0; f < datos.length; f++) {
      var filaReal = f + 2; // Fila en la hoja (base 1 + encabezado)
      var operadorAsignado = calcularOperadorAsignado_(filaReal);
      
      // Si numOp es 0 → coordinador, ver todos. Si no, solo los asignados
      if (numOp > 0 && operadorAsignado !== numOp) continue;
      
      var fila = datos[f];
      var nombre = fila[0] ? String(fila[0]).trim() : '';
      var celular = fila[3] ? String(fila[3]).trim() : '';
      
      if (!nombre && !celular) continue;
      
      // Determinar si ya fue encuestado (columna O = CONTESTO tiene valor)
      var contesto = fila[14] ? String(fila[14]).trim() : ''; // Columna O (índice 14)
      var encuestado = contesto !== '';
      
      resultado.push({
        idx: filaReal,
        nombre: nombre,
        tipoDoc: fila[1] ? String(fila[1]).trim() : '',
        documento: fila[2] ? String(fila[2]).trim() : '',
        celular: celular,
        direccion: fila[4] ? String(fila[4]).trim() : '',
        barrio: fila[5] ? String(fila[5]).trim() : '',
        departamento: fila[6] ? String(fila[6]).trim() : '',
        municipio: fila[7] ? String(fila[7]).trim() : '',
        haSido: fila[8] ? String(fila[8]).trim() : '',
        idLider: fila[9] ? String(fila[9]).trim() : '',
        nombreLider: fila[10] ? String(fila[10]).trim() : '',
        fechaRegistro: fila[11] ? (fila[11] instanceof Date ? Utilities.formatDate(fila[11], 'America/Bogota', 'dd/MM/yyyy') : String(fila[11])) : '',
        // Datos de encuesta (si ya existen)
        puestoVotacion: fila[12] ? String(fila[12]).trim() : '',
        mesa: fila[13] ? String(fila[13]).trim() : '',
        contesto: contesto,
        conoceReferente: fila[15] ? String(fila[15]).trim() : '',
        conoceCandidato: fila[16] ? String(fila[16]).trim() : '',
        votaria: fila[17] ? String(fila[17]).trim() : '',
        sabeVotar: fila[18] ? String(fila[18]).trim() : '',
        conoceMesaPuesto: fila[19] ? String(fila[19]).trim() : '',
        infoWhatsApp: fila[20] ? String(fila[20]).trim() : '',
        listado14Mayo: fila[21] ? String(fila[21]).trim() : '',
        encuestado: encuestado,
        operadorAsignado: operadorAsignado
      });
    }
    
    return { 
      success: true, 
      datos: resultado, 
      totalGeneral: totalGeneral, 
      totalAsignados: resultado.length 
    };
  } catch (error) {
    Logger.log('Error obtenerRegistrosOperador: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


// ============================================
// GUARDAR ENCUESTA (escribe en columnas M-V)
// ============================================
function guardarEncuestaLlamadaWrapper(datos) {
  try {
    var ss = SpreadsheetApp.openById(CFG_LLAMADAS_V2_.SPREADSHEET_ID);
    var hoja = ss.getSheetByName(CFG_LLAMADAS_V2_.HOJA_DATOS);
    
    if (!hoja) {
      return { success: false, message: 'Hoja no encontrada' };
    }
    
    var filaReal = parseInt(datos.filaBDSimpatizantes);
    if (!filaReal || filaReal < 2) {
      return { success: false, message: 'Fila inválida: ' + filaReal };
    }
    
    // Escribir directamente en las columnas M-V de la fila
    hoja.getRange(filaReal, COL_ENCUESTA_.PUESTO_VOTACION).setValue(datos.puestoVotacion || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.MESA).setValue(datos.mesa || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.CONTESTO).setValue(datos.contesto || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.CONOCE_REFERENTE).setValue(datos.conoceReferente || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.CONOCE_CANDIDATO).setValue(datos.conoceCandidato || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.VOTARIA).setValue(datos.votaria || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.SABE_VOTAR).setValue(datos.sabeVotar || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.CONOCE_MESA_PUESTO).setValue(datos.conoceMesaPuesto || '');
    hoja.getRange(filaReal, COL_ENCUESTA_.INFO_WHATSAPP).setValue(datos.infoWhatsApp || '');
    // Columna V: LISTADO 14 MAYO - si se envía dato
    if (datos.listado14Mayo) {
      hoja.getRange(filaReal, COL_ENCUESTA_.LISTADO_14_MAYO).setValue(datos.listado14Mayo);
    }
    
    // ── También guardar en hoja de log (Encuesta-Llamadas) ──
    try {
      guardarLogEncuesta_(datos);
    } catch(e) {
      Logger.log('Aviso log: ' + e.toString());
    }
    
    return { success: true, message: 'Encuesta guardada correctamente' };
  } catch (error) {
    Logger.log('Error guardarEncuesta: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


// ============================================
// LOG DE ENCUESTAS (hoja separada)
// ============================================
function guardarLogEncuesta_(datos) {
  var ss = SpreadsheetApp.openById(CFG_LLAMADAS_V2_.SPREADSHEET_ID);
  var hoja = ss.getSheetByName(CFG_LLAMADAS_V2_.HOJA_ENCUESTA_LOG);
  
  // Crear hoja si no existe
  if (!hoja) {
    hoja = ss.insertSheet(CFG_LLAMADAS_V2_.HOJA_ENCUESTA_LOG);
    var enc = ['ID','Fecha','Hora','Usuario','Operador','Nombre Contacto','Celular','Documento',
               'Municipio','Barrio','Puesto Votación','Mesa','Contestó','Conoce Referente',
               'Conoce Candidato','Votaría','Sabe Votar','Conoce Mesa/Puesto','Info WhatsApp',
               'Fila Origen'];
    hoja.getRange(1, 1, 1, enc.length).setValues([enc]);
    var rango = hoja.getRange(1, 1, 1, enc.length);
    rango.setBackground('#1a3353').setFontColor('white').setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  
  var ultimaFila = hoja.getLastRow();
  var ahora = new Date();
  
  var fila = [
    ultimaFila,
    Utilities.formatDate(ahora, 'America/Bogota', 'dd/MM/yyyy'),
    Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss'),
    datos.usuarioOperador || '',
    datos.nombreOperador || '',
    datos.nombreContacto || '',
    datos.celular || '',
    datos.documento || '',
    datos.municipio || '',
    datos.barrio || '',
    datos.puestoVotacion || '',
    datos.mesa || '',
    datos.contesto || '',
    datos.conoceReferente || '',
    datos.conoceCandidato || '',
    datos.votaria || '',
    datos.sabeVotar || '',
    datos.conoceMesaPuesto || '',
    datos.infoWhatsApp || '',
    datos.filaBDSimpatizantes || ''
  ];
  
  hoja.getRange(ultimaFila + 1, 1, 1, fila.length).setValues([fila]);
}


// ============================================
// ESTADÍSTICAS PARA COORDINADOR
// ============================================
function obtenerEstadisticasCoordinadorWrapper() {
  try {
    var ss = SpreadsheetApp.openById(CFG_LLAMADAS_V2_.SPREADSHEET_ID);
    var hoja = ss.getSheetByName(CFG_LLAMADAS_V2_.HOJA_DATOS);
    
    if (!hoja || hoja.getLastRow() < 2) {
      return { 
        success: true, totalRegistros: 0, encuestados: 0, sinEncuestar: 0,
        porOperador: [], respuestas: crearRespuestasVacias_(), encuestasRecientes: []
      };
    }
    
    var ultimaFila = hoja.getLastRow();
    var ultimaCol = hoja.getLastColumn();
    var datos = hoja.getRange(2, 1, ultimaFila - 1, ultimaCol).getValues();
    
    var totalRegistros = datos.length;
    var encuestados = 0;
    var sinEncuestar = 0;
    var operadores = {};
    var respuestas = crearRespuestasVacias_();
    var encuestasRecientes = [];
    
    // Inicializar 8 operadores
    for (var op = 1; op <= CFG_LLAMADAS_V2_.TOTAL_OPERADORES_ASIGNADOS; op++) {
      var userKey = 'operador' + op;
      operadores[op] = {
        numero: op,
        usuario: userKey,
        nombre: USUARIOS_LLAMADAS_[userKey] ? USUARIOS_LLAMADAS_[userKey].nombre : 'OPERADOR ' + op,
        totalAsignados: 0,
        encuestados: 0,
        sinEncuestar: 0,
        siVotaria: 0
      };
    }
    
    for (var f = 0; f < datos.length; f++) {
      var fila = datos[f];
      var filaReal = f + 2;
      var opAsignado = calcularOperadorAsignado_(filaReal);
      
      // Solo contar operadores 1-8
      if (opAsignado >= 1 && opAsignado <= CFG_LLAMADAS_V2_.TOTAL_OPERADORES_ASIGNADOS) {
        operadores[opAsignado].totalAsignados++;
      }
      
      var contesto = fila[14] ? String(fila[14]).trim() : ''; // Col O
      var fueEncuestado = contesto !== '';
      
      if (fueEncuestado) {
        encuestados++;
        if (opAsignado >= 1 && opAsignado <= CFG_LLAMADAS_V2_.TOTAL_OPERADORES_ASIGNADOS) {
          operadores[opAsignado].encuestados++;
        }
        
        // Contar respuestas Sí/No
        contarSiNo_(contesto, respuestas, 'contesto');
        contarSiNo_(fila[15], respuestas, 'conoceReferente');
        contarSiNo_(fila[16], respuestas, 'conoceCandidato');
        contarSiNo_(fila[17], respuestas, 'votaria');
        contarSiNo_(fila[18], respuestas, 'sabeVotar');
        contarSiNo_(fila[19], respuestas, 'conoceMesaPuesto');
        contarSiNo_(fila[20], respuestas, 'infoWhatsApp');
        
        // Contar si votaría por operador
        var votariaVal = fila[17] ? String(fila[17]).toLowerCase().trim() : '';
        if ((votariaVal === 'sí' || votariaVal === 'si') && opAsignado >= 1 && opAsignado <= CFG_LLAMADAS_V2_.TOTAL_OPERADORES_ASIGNADOS) {
          operadores[opAsignado].siVotaria++;
        }
        
        // Encuestas recientes (últimas 50)
        if (f >= datos.length - 50) {
          encuestasRecientes.push({
            nombre: String(fila[0] || ''),
            celular: String(fila[3] || ''),
            municipio: String(fila[7] || ''),
            contesto: contesto,
            votaria: String(fila[17] || ''),
            operador: opAsignado
          });
        }
      } else {
        sinEncuestar++;
        if (opAsignado >= 1 && opAsignado <= CFG_LLAMADAS_V2_.TOTAL_OPERADORES_ASIGNADOS) {
          operadores[opAsignado].sinEncuestar++;
        }
      }
    }
    
    // Convertir operadores a array
    var porOperador = [];
    for (var key in operadores) {
      var op = operadores[key];
      op.sinEncuestar = op.totalAsignados - op.encuestados;
      porOperador.push(op);
    }
    porOperador.sort(function(a, b) { return b.encuestados - a.encuestados; });
    
    encuestasRecientes.reverse();
    
    return {
      success: true,
      totalRegistros: totalRegistros,
      encuestados: encuestados,
      sinEncuestar: sinEncuestar,
      porOperador: porOperador,
      respuestas: respuestas,
      encuestasRecientes: encuestasRecientes
    };
    
  } catch (error) {
    Logger.log('Error estadísticas: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function crearRespuestasVacias_() {
  return {
    contesto: { si: 0, no: 0 },
    conoceReferente: { si: 0, no: 0 },
    conoceCandidato: { si: 0, no: 0 },
    votaria: { si: 0, no: 0 },
    sabeVotar: { si: 0, no: 0 },
    conoceMesaPuesto: { si: 0, no: 0 },
    infoWhatsApp: { si: 0, no: 0 }
  };
}

function contarSiNo_(valor, respuestas, campo) {
  var v = String(valor || '').toLowerCase().trim();
  if (v === 'sí' || v === 'si' || v === 'yes' || v === 's') respuestas[campo].si++;
  else if (v === 'no' || v === 'n') respuestas[campo].no++;
}