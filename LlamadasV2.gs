// ============================================================================
// ARCHIVO: LlamadasV2.gs (ARCHIVO INDEPENDIENTE)
// Sistema 40 Caldas - Modulo de Llamadas/Encuestas
// ============================================================================

// ========== CONFIGURACION ==========
function getConfigLlamadasV2_() {
  try {
    if (typeof ID_SEGUIMIENTO_GT !== 'undefined' && ID_SEGUIMIENTO_GT) {
      return { SPREADSHEET_ID: ID_SEGUIMIENTO_GT, HOJA_DATOS: 'BD-lideres' };
    }
  } catch(e) {}
  try {
    if (typeof ID_ARCHIVO_GT !== 'undefined' && ID_ARCHIVO_GT) {
      return { SPREADSHEET_ID: ID_ARCHIVO_GT, HOJA_DATOS: 'BD-lideres' };
    }
  } catch(e) {}
  return {
    SPREADSHEET_ID: '1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo',
    HOJA_DATOS: 'BD-lideres'
  };
}

// Configuracion de encuestas
var CFG_REGISTRO_V2_ = {
  ID_LIDERES: '1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo',
  ID_SIMPATIZANTES: '1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s',
  HOJA_ENCUESTA: 'Encuesta-Llamadas'
};

// ========== CREDENCIALES DE OPERADORES ==========
var CREDENCIALES_LLAMADAS_V2_ = {
  'operador1': { clave: 'op2026a1', nombre: 'Operador 1' },
  'operador2': { clave: 'op2026a2', nombre: 'Operador 2' },
  'operador3': { clave: 'op2026a3', nombre: 'Operador 3' },
  'operador4': { clave: 'op2026a4', nombre: 'Operador 4' },
  'operador5': { clave: 'op2026a5', nombre: 'Operador 5' },
  'operador6': { clave: 'op2026a6', nombre: 'Operador 6' },
  'operador7': { clave: 'op2026a7', nombre: 'Operador 7' },
  'operador8': { clave: 'op2026a8', nombre: 'Operador 8' },
  'operador9': { clave: 'op2026a9', nombre: 'Operador 9' },
  'operador10': { clave: 'op2026a10', nombre: 'Operador 10' },
  'operador11': { clave: 'op2026a11', nombre: 'Operador 11' },
  'operador12': { clave: 'op2026a12', nombre: 'Operador 12' },
  'operador13': { clave: 'op2026a13', nombre: 'Operador 13' },
  'operador14': { clave: 'op2026a14', nombre: 'Operador 14' },
  'operador15': { clave: 'op2026a15', nombre: 'Operador 15' },
  'operador16': { clave: 'op2026a16', nombre: 'Operador 16' },
  'operador17': { clave: 'op2026a17', nombre: 'Operador 17' },
  'operador18': { clave: 'op2026a18', nombre: 'Operador 18' },
  'operador19': { clave: 'op2026a19', nombre: 'Operador 19' },
  'operador20': { clave: 'op2026a20', nombre: 'Operador 20' },
  'coordinador': { clave: 'coord2026*', nombre: 'Coordinador', rol: 'coordinador' }
};

// ========== AUTENTICACION LLAMADAS V2 ==========
function verificarCredencialesLlamadasV2(usuario, clave) {
  try {
    var cred = CREDENCIALES_LLAMADAS_V2_[usuario];
    if (cred && cred.clave === clave) {
      return {
        success: true,
        usuario: usuario,
        nombre: cred.nombre,
        rol: cred.rol || 'operador'
      };
    }
    return { success: false, message: 'Credenciales incorrectas' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// ========== OBTENER DATOS PARA ENCUESTA (con distribucion) ==========
function obtenerDatosEncuestaV2(usuario, pagina, porPagina) {
  try {
    var cfg = getConfigLlamadasV2_();
    pagina = pagina || 1;
    porPagina = porPagina || 50;

    // Obtener datos de simpatizantes
    var ss = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hoja = ss.getSheetByName('Simpatizantes');
    if (!hoja) hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja de simpatizantes no encontrada' };

    var ultimaFila = hoja.getLastRow();
    if (ultimaFila < 2) return { success: true, datos: [], total: 0 };

    var ultimaCol = hoja.getLastColumn();
    var datos = hoja.getRange(2, 1, ultimaFila - 1, ultimaCol).getValues();

    // Determinar indice del operador para distribucion
    var cred = CREDENCIALES_LLAMADAS_V2_[usuario];
    var esCoordinador = cred && cred.rol === 'coordinador';

    var resultado = [];

    if (esCoordinador) {
      // Coordinador ve todos los registros
      for (var i = 0; i < datos.length; i++) {
        resultado.push(crearRegistroEncuesta_(datos[i], i + 2));
      }
    } else {
      // Distribucion equitativa: extraer numero del operador
      var numOp = parseInt(usuario.replace('operador', ''), 10);
      var totalOperadores = 8; // primeros 8 operadores activos
      if (isNaN(numOp) || numOp < 1) numOp = 1;
      if (numOp > totalOperadores) numOp = numOp % totalOperadores || totalOperadores;

      for (var j = 0; j < datos.length; j++) {
        // Asignar por modulo: registro j va al operador (j % totalOperadores) + 1
        if ((j % totalOperadores) + 1 === numOp) {
          resultado.push(crearRegistroEncuesta_(datos[j], j + 2));
        }
      }
    }

    // Paginacion
    var total = resultado.length;
    var inicio = (pagina - 1) * porPagina;
    var fin = Math.min(inicio + porPagina, total);
    var paginaDatos = resultado.slice(inicio, fin);

    return {
      success: true,
      datos: paginaDatos,
      total: total,
      pagina: pagina,
      totalPaginas: Math.ceil(total / porPagina)
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function crearRegistroEncuesta_(fila, rowIdx) {
  return {
    idx: rowIdx,
    nombre: fila[0] ? String(fila[0]).trim() : '',
    tipoDocumento: fila[1] ? String(fila[1]).trim() : '',
    documento: fila[2] ? String(fila[2]).trim() : '',
    celular: fila[3] ? String(fila[3]).trim() : '',
    direccion: fila[4] ? String(fila[4]).trim() : '',
    barrio: fila[5] ? String(fila[5]).trim() : '',
    departamento: fila[6] ? String(fila[6]).trim() : '',
    municipio: fila[7] ? String(fila[7]).trim() : '',
    haSido: fila[8] ? String(fila[8]).trim() : '',
    liderDocumento: fila[9] ? String(fila[9]).trim() : '',
    liderNombre: fila[10] ? String(fila[10]).trim() : '',
    puestoVotacion: fila[12] ? String(fila[12]).trim() : '',
    mesa: fila[13] ? String(fila[13]).trim() : '',
    contesto: fila[14] ? String(fila[14]).trim() : '',
    conoceReferente: fila[15] ? String(fila[15]).trim() : '',
    conoceCandidato: fila[16] ? String(fila[16]).trim() : '',
    votariaCandidato: fila[17] ? String(fila[17]).trim() : '',
    sabeVotar: fila[18] ? String(fila[18]).trim() : '',
    conoceMesaPuesto: fila[19] ? String(fila[19]).trim() : '',
    infoWhatsapp: fila[20] ? String(fila[20]).trim() : '',
    listado14Mayo: fila[21] ? String(fila[21]).trim() : ''
  };
}

// ========== GUARDAR RESPUESTAS DE ENCUESTA ==========
function guardarRespuestaEncuestaV2(datos) {
  try {
    if (!datos || !datos.idx) return { success: false, message: 'Datos incompletos' };

    var ss = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hoja = ss.getSheetByName('Simpatizantes');
    if (!hoja) hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja no encontrada' };

    var fila = datos.idx;

    // Guardar en columnas M-V (indices 13-22 en base 1)
    if (datos.puestoVotacion !== undefined) hoja.getRange(fila, 13).setValue(datos.puestoVotacion);
    if (datos.mesa !== undefined) hoja.getRange(fila, 14).setValue(datos.mesa);
    if (datos.contesto !== undefined) hoja.getRange(fila, 15).setValue(datos.contesto);
    if (datos.conoceReferente !== undefined) hoja.getRange(fila, 16).setValue(datos.conoceReferente);
    if (datos.conoceCandidato !== undefined) hoja.getRange(fila, 17).setValue(datos.conoceCandidato);
    if (datos.votariaCandidato !== undefined) hoja.getRange(fila, 18).setValue(datos.votariaCandidato);
    if (datos.sabeVotar !== undefined) hoja.getRange(fila, 19).setValue(datos.sabeVotar);
    if (datos.conoceMesaPuesto !== undefined) hoja.getRange(fila, 20).setValue(datos.conoceMesaPuesto);
    if (datos.infoWhatsapp !== undefined) hoja.getRange(fila, 21).setValue(datos.infoWhatsapp);
    if (datos.listado14Mayo !== undefined) hoja.getRange(fila, 22).setValue(datos.listado14Mayo);

    return { success: true, message: 'Respuestas guardadas correctamente' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// ========== ESTADISTICAS PARA COORDINADOR ==========
function obtenerEstadisticasLlamadasV2() {
  try {
    var ss = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hoja = ss.getSheetByName('Simpatizantes');
    if (!hoja) hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja no encontrada' };

    var datos = hoja.getDataRange().getValues();
    var total = datos.length - 1;
    var contestados = 0, noContesta = 0, sinLlamar = 0;
    var porOperador = {};

    for (var i = 1; i < datos.length; i++) {
      var contesto = datos[i][14] ? String(datos[i][14]).toLowerCase().trim() : '';
      if (contesto === 'si' || contesto === 'sí') contestados++;
      else if (contesto === 'no') noContesta++;
      else sinLlamar++;

      // Distribucion por operador
      var opNum = ((i - 1) % 8) + 1;
      var opKey = 'operador' + opNum;
      if (!porOperador[opKey]) porOperador[opKey] = { total: 0, contestados: 0, pendientes: 0 };
      porOperador[opKey].total++;
      if (contesto === 'si' || contesto === 'sí') porOperador[opKey].contestados++;
      else porOperador[opKey].pendientes++;
    }

    return {
      success: true,
      estadisticas: {
        total: total,
        contestados: contestados,
        noContesta: noContesta,
        sinLlamar: sinLlamar,
        porcentajeAvance: total > 0 ? Math.round((contestados / total) * 100) : 0,
        porOperador: porOperador
      }
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// ========== HELPER ==========
function docToString_(val) {
  if (!val) return '';
  if (typeof val === 'number') return String(Math.round(val));
  return String(val).trim().replace(/\.0+$/, '');
}

// ============================================================================
// WRAPPERS PARA llamadas.html
// ============================================================================

function autenticarUsuarioLlamadasWrapper(usuario, clave) {
  var result = verificarCredencialesLlamadasV2(usuario, clave);
  if (result && result.success) {
    var numOp = parseInt(usuario.replace('operador', ''), 10);
    result.numeroOperador = isNaN(numOp) ? 0 : numOp;
  }
  return result;
}

function obtenerRegistrosOperadorWrapper(numeroOperador) {
  try {
    var ss = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hoja = ss.getSheetByName('Simpatizantes');
    if (!hoja) hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja de simpatizantes no encontrada' };

    var ultimaFila = hoja.getLastRow();
    if (ultimaFila < 2) return { success: true, datos: [] };

    var datos = hoja.getRange(2, 1, ultimaFila - 1, hoja.getLastColumn()).getValues();
    var totalOperadores = 8;
    var resultado = [];

    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      if (numeroOperador > 0) {
        var opAsignado = (i % totalOperadores) + 1;
        if (opAsignado !== numeroOperador) continue;
      }

      var contesto = fila[14] ? String(fila[14]).trim() : '';

      resultado.push({
        idx: i + 2,
        nombre: fila[0] ? String(fila[0]).trim() : '',
        tipoDocumento: fila[1] ? String(fila[1]).trim() : '',
        documento: fila[2] ? String(fila[2]).trim() : '',
        celular: fila[3] ? String(fila[3]).trim() : '',
        direccion: fila[4] ? String(fila[4]).trim() : '',
        barrio: fila[5] ? String(fila[5]).trim() : '',
        departamento: fila[6] ? String(fila[6]).trim() : '',
        municipio: fila[7] ? String(fila[7]).trim() : '',
        haSido: fila[8] ? String(fila[8]).trim() : '',
        liderDocumento: fila[9] ? String(fila[9]).trim() : '',
        nombreLider: fila[10] ? String(fila[10]).trim() : '',
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
        encuestado: contesto !== ''
      });
    }

    return { success: true, datos: resultado };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function guardarEncuestaLlamadaWrapper(datos) {
  try {
    if (!datos || !datos.filaBDSimpatizantes) return { success: false, message: 'Datos incompletos' };

    var ss = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hoja = ss.getSheetByName('Simpatizantes');
    if (!hoja) hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja no encontrada' };

    var fila = datos.filaBDSimpatizantes;

    if (datos.puestoVotacion !== undefined) hoja.getRange(fila, 13).setValue(datos.puestoVotacion);
    if (datos.mesa !== undefined) hoja.getRange(fila, 14).setValue(datos.mesa);
    if (datos.contesto !== undefined) hoja.getRange(fila, 15).setValue(datos.contesto);
    if (datos.conoceReferente !== undefined) hoja.getRange(fila, 16).setValue(datos.conoceReferente);
    if (datos.conoceCandidato !== undefined) hoja.getRange(fila, 17).setValue(datos.conoceCandidato);
    if (datos.votaria !== undefined) hoja.getRange(fila, 18).setValue(datos.votaria);
    if (datos.sabeVotar !== undefined) hoja.getRange(fila, 19).setValue(datos.sabeVotar);
    if (datos.conoceMesaPuesto !== undefined) hoja.getRange(fila, 20).setValue(datos.conoceMesaPuesto);
    if (datos.infoWhatsApp !== undefined) hoja.getRange(fila, 21).setValue(datos.infoWhatsApp);
    if (datos.listado14Mayo !== undefined) hoja.getRange(fila, 22).setValue(datos.listado14Mayo);

    return { success: true, message: 'Encuesta guardada correctamente' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function obtenerEstadisticasCoordinadorWrapper() {
  try {
    var ss = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hoja = ss.getSheetByName('Simpatizantes');
    if (!hoja) hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja no encontrada' };

    var datos = hoja.getDataRange().getValues();
    var total = datos.length - 1;
    var encuestados = 0, sinEncuestar = 0;
    var totalOperadores = 8;

    var respuestas = {
      contesto: {si: 0, no: 0},
      conoceReferente: {si: 0, no: 0},
      conoceCandidato: {si: 0, no: 0},
      votaria: {si: 0, no: 0},
      sabeVotar: {si: 0, no: 0},
      conoceMesaPuesto: {si: 0, no: 0},
      infoWhatsApp: {si: 0, no: 0},
      listado14Mayo: {si: 0, no: 0}
    };

    var porOperador = {};
    for (var op = 1; op <= totalOperadores; op++) {
      porOperador[op] = { nombre: 'Operador ' + op, totalAsignados: 0, encuestados: 0, sinEncuestar: 0, siVotaria: 0 };
    }

    var encuestasRecientes = [];

    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      var contesto = fila[14] ? String(fila[14]).trim().toLowerCase() : '';
      var esEncuestado = contesto !== '';

      if (esEncuestado) encuestados++;
      else sinEncuestar++;

      var campos = [
        {col: 14, key: 'contesto'},
        {col: 15, key: 'conoceReferente'},
        {col: 16, key: 'conoceCandidato'},
        {col: 17, key: 'votaria'},
        {col: 18, key: 'sabeVotar'},
        {col: 19, key: 'conoceMesaPuesto'},
        {col: 20, key: 'infoWhatsApp'},
        {col: 21, key: 'listado14Mayo'}
      ];

      for (var c = 0; c < campos.length; c++) {
        var val = fila[campos[c].col] ? String(fila[campos[c].col]).trim().toLowerCase() : '';
        if (val === 'sí' || val === 'si') respuestas[campos[c].key].si++;
        else if (val === 'no') respuestas[campos[c].key].no++;
      }

      var opNum = ((i - 1) % totalOperadores) + 1;
      if (porOperador[opNum]) {
        porOperador[opNum].totalAsignados++;
        if (esEncuestado) porOperador[opNum].encuestados++;
        else porOperador[opNum].sinEncuestar++;
        var votVal = fila[17] ? String(fila[17]).trim().toLowerCase() : '';
        if (votVal === 'sí' || votVal === 'si') porOperador[opNum].siVotaria++;
      }

      if (esEncuestado && encuestasRecientes.length < 20) {
        encuestasRecientes.push({
          nombre: fila[0] ? String(fila[0]).trim() : '',
          celular: fila[3] ? String(fila[3]).trim() : '',
          municipio: fila[7] ? String(fila[7]).trim() : '',
          contesto: fila[14] ? String(fila[14]).trim() : '',
          votaria: fila[17] ? String(fila[17]).trim() : '',
          operador: opNum
        });
      }
    }

    var opsArray = [];
    for (var k = 1; k <= totalOperadores; k++) {
      opsArray.push(porOperador[k]);
    }
    opsArray.sort(function(a, b) { return b.encuestados - a.encuestados; });

    return {
      success: true,
      totalRegistros: total,
      encuestados: encuestados,
      sinEncuestar: sinEncuestar,
      respuestas: respuestas,
      porOperador: opsArray,
      encuestasRecientes: encuestasRecientes.reverse()
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// ============================================================================
// NUEVO: AUTO-RESETEO DE CICLO CUANDO TODOS LOS REGISTROS ESTAN COMPLETADOS
// Limpia columnas M-V (13-22) del operador para reiniciar ciclo de llamadas
// Se ejecuta por unica vez cuando el 100% de registros estan en "Hecho"
// ============================================================================
function resetearCicloOperadorWrapper(numeroOperador) {
  try {
    var ss = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hoja = ss.getSheetByName('Simpatizantes');
    if (!hoja) hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja no encontrada' };

    var ultimaFila = hoja.getLastRow();
    if (ultimaFila < 2) return { success: true, message: 'Sin registros', reseteados: 0 };

    // Lectura batch de columnas M-V (13-22) = 10 columnas
    var rango = hoja.getRange(2, 13, ultimaFila - 1, 10);
    var valores = rango.getValues();
    var totalOperadores = 8;
    var reseteados = 0;

    // Verificar primero que TODOS los del operador esten completados
    var totalOp = 0, completadosOp = 0;
    for (var v = 0; v < valores.length; v++) {
      if (numeroOperador > 0) {
        var opCheck = (v % totalOperadores) + 1;
        if (opCheck !== numeroOperador) continue;
      }
      totalOp++;
      var contestoVal = valores[v][2] ? String(valores[v][2]).trim() : ''; // col 15 = indice 2 en rango
      if (contestoVal !== '') completadosOp++;
    }

    // Solo resetear si realmente TODOS estan completados
    if (totalOp === 0 || completadosOp < totalOp) {
      return { success: false, message: 'No todos los registros estan completados', reseteados: 0 };
    }

    // Limpiar columnas de encuesta para los registros del operador
    for (var i = 0; i < valores.length; i++) {
      if (numeroOperador > 0) {
        var opAsignado = (i % totalOperadores) + 1;
        if (opAsignado !== numeroOperador) continue;
      }
      for (var c = 0; c < 10; c++) {
        valores[i][c] = '';
      }
      reseteados++;
    }

    // Escritura batch (una sola operacion)
    rango.setValues(valores);
    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Ciclo reiniciado: ' + reseteados + ' registros vuelven a pendiente',
      reseteados: reseteados
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}