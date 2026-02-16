// ============================================================================
// SIGEM: INTELIGENCIA ELECTORAL 360 — Backend v2
// Sistema 40 Caldas — Partido de la U
// Archivo: SIGEM.gs
// ============================================================================

// ======================== CONFIGURACION ========================

var SIGEM_ID_REGISTROS = '1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s';
var SIGEM_ID_LIDERES = '1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo';

var SIGEM_HOJA_REGISTROS = 'Registros';
var SIGEM_HOJA_LIDERES = 'BD-Lideres';
var SIGEM_HOJA_PUESTOS = 'Puestos-Comunas';
var SIGEM_HOJA_ENCUESTA = 'Encuesta-Llamadas';

var SIGEM_FECHA_ELECCIONES = new Date(2026, 2, 8); // Domingo 8 de Marzo 2026
var SIGEM_META_GLOBAL = 15000;

// Columnas hoja Registros (0-indexed)
var SIGEM_COL_REG = {
  NOMBRE: 0, TIPO_DOC: 1, NUM_DOC: 2, CELULAR: 3, DIRECCION: 4,
  BARRIO: 5, DEPARTAMENTO: 6, MUNICIPIO: 7, HA_SIDO: 8, ID_LIDER: 9,
  NOMBRE_LIDER: 10, FECHA_REGISTRO: 11, PUESTO_VOTACION: 12, MESA: 13, CONTESTO: 14
};

// Columnas hoja Encuesta-Llamadas (0-indexed)
// ID|Fecha|Hora|Usuario|Operador|NombreContacto|Celular|Documento|Municipio|Barrio|PuestoVotacion|Mesa|Contesto|ConoceReferente|ConoceCandidato|VotariaPorCandidato|SabeComoVotar|ConoceMesaVotacion|InfoWhatsApp|Listado
var SIGEM_COL_ENC = {
  ID: 0, FECHA: 1, HORA: 2, USUARIO: 3, OPERADOR: 4,
  NOMBRE: 5, CELULAR: 6, DOCUMENTO: 7, MUNICIPIO: 8, BARRIO: 9,
  PUESTO: 10, MESA: 11, CONTESTO: 12, CONOCE_REF: 13, CONOCE_CAND: 14,
  VOTARIA: 15, SABE_VOTAR: 16, CONOCE_MESA: 17, INFO_WA: 18, LISTADO: 19
};

// Comunas
var SIGEM_COMUNAS = [
  'COMUNA ATARDECERES', 'COMUNA CIUDADELA DEL NORTE', 'COMUNA CUMANDAY',
  'COMUNA CERRO DE ORO', 'COMUNA ECOTURISTICO', 'COMUNA LA FUENTE',
  'COMUNA LA MACARENA', 'COMUNA PALOGRANDE', 'COMUNA SAN JOSE',
  'COMUNA TESORITO', 'COMUNA UNIVERSITARIA'
];


// ================================================================
// WRAPPERS
// ================================================================

function obtenerDatosSIGEMWrapper() {
  return obtenerDatosSIGEM();
}

function obtenerDetalleComunaSIGEMWrapper(comuna) {
  return obtenerDetalleComunaSIGEM(comuna);
}

function generarInformeSIGEMWrapper() {
  return generarInformeSIGEM();
}


// ================================================================
// DIAGNOSTICO
// ================================================================

function diagnosticoSIGEM() {
  var log = [];
  log.push('=== DIAGNOSTICO SIGEM v4 ===');
  log.push('Fecha: ' + new Date().toString());
  log.push('Fecha Elecciones: ' + SIGEM_FECHA_ELECCIONES.toString());

  try {
    var ssReg = SpreadsheetApp.openById(SIGEM_ID_REGISTROS);
    log.push('');
    log.push('--- SS REGISTROS ---');
    var hojasReg = ssReg.getSheets();
    log.push('Hojas: ' + hojasReg.length);
    for (var i = 0; i < hojasReg.length; i++) {
      var h = hojasReg[i];
      var n = h.getName();
      var marca = '';
      if (n === SIGEM_HOJA_REGISTROS) marca = ' <<< OK';
      if (n === SIGEM_HOJA_PUESTOS) marca = ' <<< OK';
      if (n === SIGEM_HOJA_ENCUESTA) marca = ' <<< OK (ENCUESTA)';
      log.push('  [' + (i+1) + '] "' + n + '" (' + h.getLastRow() + ' filas, ' + h.getLastColumn() + ' cols)' + marca);
      if (n === SIGEM_HOJA_ENCUESTA && h.getLastRow() > 0) {
        var enc = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
        log.push('    Enc: ' + enc.join(' | '));
      }
    }
  } catch(e) {
    log.push('ERROR SS Registros: ' + e.message);
  }

  try {
    var ssLid = SpreadsheetApp.openById(SIGEM_ID_LIDERES);
    log.push('');
    log.push('--- SS LIDERES ---');
    var hojasLid = ssLid.getSheets();
    for (var j = 0; j < hojasLid.length; j++) {
      var h2 = hojasLid[j];
      var marca2 = (h2.getName() === SIGEM_HOJA_LIDERES) ? ' <<< OK' : '';
      log.push('  [' + (j+1) + '] "' + h2.getName() + '" (' + h2.getLastRow() + ' filas)' + marca2);
    }
  } catch(e) {
    log.push('ERROR SS Lideres: ' + e.message);
  }

  try {
    log.push('');
    log.push('--- TEST obtenerDatosSIGEM ---');
    var r = obtenerDatosSIGEM();
    log.push('Success: ' + r.success);
    if (r.success) {
      log.push('Registros: ' + r.totalRegistros);
      log.push('Lideres: ' + r.totalLideres);
      log.push('KPI simpatizantes: ' + r.kpis.totalSimp);
      log.push('KPI cobertura: ' + r.kpis.cobertura + '%');
      log.push('KPI velocidad: ' + r.kpis.velocidad + '/dia');
      log.push('Comunas: ' + r.comunas.tabla.length);
      log.push('Ranking lideres: ' + r.lideres.ranking.length);
      log.push('Prediccion base: ' + r.prediccion.escenarios.base);
      log.push('--- ENCUESTA ---');
      log.push('Total llamadas: ' + (r.encuesta ? r.encuesta.totalLlamadas : 'N/A'));
      log.push('Contestaron: ' + (r.encuesta ? r.encuesta.contestaron : 'N/A'));
      log.push('Votarian: ' + (r.encuesta ? r.encuesta.votarian : 'N/A'));
      log.push('Tiempo: ' + r.tiempoProceso + 'ms');
    } else {
      log.push('ERROR: ' + r.message);
    }
  } catch(e) {
    log.push('ERROR Test: ' + e.message + ' | ' + e.stack);
  }

  log.push('');
  log.push('=== FIN ===');
  var texto = log.join('\n');
  Logger.log(texto);
  return texto;
}


// ================================================================
// FUNCION PRINCIPAL
// ================================================================

function obtenerDatosSIGEM() {
  try {
    var inicio = new Date().getTime();

    var ssReg = SpreadsheetApp.openById(SIGEM_ID_REGISTROS);
    var ssLid = SpreadsheetApp.openById(SIGEM_ID_LIDERES);

    var hojaReg = ssReg.getSheetByName(SIGEM_HOJA_REGISTROS);
    var hojaPuestos = ssReg.getSheetByName(SIGEM_HOJA_PUESTOS);
    var hojaLid = ssLid.getSheetByName(SIGEM_HOJA_LIDERES);
    var hojaEnc = ssReg.getSheetByName(SIGEM_HOJA_ENCUESTA);

    if (!hojaReg) return { success: false, message: 'Hoja "' + SIGEM_HOJA_REGISTROS + '" no encontrada.' };
    if (!hojaLid) return { success: false, message: 'Hoja "' + SIGEM_HOJA_LIDERES + '" no encontrada.' };

    var filasReg = hojaReg.getLastRow();
    var filasLid = hojaLid.getLastRow();

    var datosReg = filasReg > 1 ? hojaReg.getRange(2, 1, filasReg - 1, hojaReg.getLastColumn()).getValues() : [];
    var datosLid = filasLid > 1 ? hojaLid.getRange(2, 1, filasLid - 1, hojaLid.getLastColumn()).getValues() : [];
    var datosPuestos = [];
    if (hojaPuestos && hojaPuestos.getLastRow() > 1) {
      datosPuestos = hojaPuestos.getRange(2, 1, hojaPuestos.getLastRow() - 1, 2).getValues();
    }

    // Encuesta-Llamadas (opcional, no falla si no existe)
    var datosEnc = [];
    if (hojaEnc && hojaEnc.getLastRow() > 1) {
      datosEnc = hojaEnc.getRange(2, 1, hojaEnc.getLastRow() - 1, hojaEnc.getLastColumn()).getValues();
    }

    var mapaPuestos = {};
    for (var p = 0; p < datosPuestos.length; p++) {
      var np = String(datosPuestos[p][0] || '').trim().toUpperCase();
      var co = String(datosPuestos[p][1] || '').trim().toUpperCase();
      if (np && co) mapaPuestos[np] = co;
    }

    var kpis = sigemCalcularKPIs(datosReg, datosLid);
    var comunas = sigemAnalizarComunas(datosReg, mapaPuestos);
    var lideres = sigemRankingLideres(datosReg);
    var tendencia = sigemCalcularTendencia(datosReg);
    var prediccion = sigemCalcularPrediccion(datosReg);
    var encuesta = sigemAnalizarEncuesta(datosEnc, mapaPuestos);

    return {
      success: true,
      kpis: kpis,
      comunas: comunas,
      lideres: lideres,
      tendencia: tendencia,
      prediccion: prediccion,
      encuesta: encuesta,
      meta: SIGEM_META_GLOBAL,
      fechaElecciones: Utilities.formatDate(SIGEM_FECHA_ELECCIONES, 'America/Bogota', 'yyyy-MM-dd'),
      tiempoProceso: new Date().getTime() - inicio,
      totalRegistros: datosReg.length,
      totalLideres: datosLid.length,
      totalEncuestas: datosEnc.length
    };
  } catch (e) {
    Logger.log('ERROR obtenerDatosSIGEM: ' + e.message);
    return { success: false, message: 'Error: ' + e.message };
  }
}


// ================================================================
// KPIs
// ================================================================

function sigemCalcularKPIs(datosReg, datosLid) {
  var totalSimp = datosReg ? datosReg.length : 0;
  var totalLideres = datosLid ? datosLid.length : 0;
  var conPuesto = 0, conCelular = 0, registros30d = 0, conMesa = 0;

  var hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  hace30.setHours(0,0,0,0);

  for (var i = 0; i < totalSimp; i++) {
    var fila = datosReg[i];
    var puesto = String(fila[SIGEM_COL_REG.PUESTO_VOTACION] || '').trim().toUpperCase();
    if (puesto !== '' && puesto !== 'UNDEFINED' && puesto !== 'NULL' && puesto !== 'SIN ASIGNAR' && puesto !== 'NO REGISTRA') conPuesto++;

    var mesa = String(fila[SIGEM_COL_REG.MESA] || '').trim();
    if (mesa !== '' && mesa !== 'undefined' && mesa !== 'null') conMesa++;

    var cel = String(fila[SIGEM_COL_REG.CELULAR] || '').replace(/\D/g, '');
    if (cel.length >= 7) conCelular++;

    var fr = fila[SIGEM_COL_REG.FECHA_REGISTRO];
    if (fr) {
      var fecha = (fr instanceof Date) ? fr : new Date(fr);
      if (!isNaN(fecha.getTime()) && fecha >= hace30) registros30d++;
    }
  }

  return {
    totalSimp: totalSimp, totalLideres: totalLideres, conPuesto: conPuesto, conMesa: conMesa,
    cobertura: totalSimp > 0 ? Math.round((conPuesto / totalSimp) * 1000) / 10 : 0,
    velocidad: Math.round((registros30d / 30) * 10) / 10,
    registros30d: registros30d,
    contactabilidad: totalSimp > 0 ? Math.round((conCelular / totalSimp) * 1000) / 10 : 0,
    conCelular: conCelular,
    promedioXLider: totalLideres > 0 ? Math.round((totalSimp / totalLideres) * 10) / 10 : 0
  };
}


// ================================================================
// ENCUESTA - INTENCION DE VOTO
// ================================================================

function sigemAnalizarEncuesta(datosEnc, mapaPuestos) {
  var resultado = {
    totalLlamadas: 0, contestaron: 0, noContestaron: 0,
    conoceReferente: 0, conoceCandidato: 0,
    votarian: 0, sabenVotar: 0, conocenMesa: 0, infoWA: 0,
    tasaContacto: 0, tasaVoto: 0, tasaConoceCandidato: 0,
    porOperador: [], porComuna: [], porDia: []
  };

  if (!datosEnc || datosEnc.length === 0) return resultado;

  resultado.totalLlamadas = datosEnc.length;

  var operadores = {};
  var comunas = {};
  var dias = {};

  for (var i = 0; i < datosEnc.length; i++) {
    var f = datosEnc[i];
    var contesto = String(f[SIGEM_COL_ENC.CONTESTO] || '').trim().toUpperCase();
    var cRef = String(f[SIGEM_COL_ENC.CONOCE_REF] || '').trim().toUpperCase();
    var cCand = String(f[SIGEM_COL_ENC.CONOCE_CAND] || '').trim().toUpperCase();
    var votaria = String(f[SIGEM_COL_ENC.VOTARIA] || '').trim().toUpperCase();
    var sabeVotar = String(f[SIGEM_COL_ENC.SABE_VOTAR] || '').trim().toUpperCase();
    var conoceMesa = String(f[SIGEM_COL_ENC.CONOCE_MESA] || '').trim().toUpperCase();
    var infoWA = String(f[SIGEM_COL_ENC.INFO_WA] || '').trim().toUpperCase();
    var operador = String(f[SIGEM_COL_ENC.OPERADOR] || '').trim();
    var puesto = String(f[SIGEM_COL_ENC.PUESTO] || '').trim().toUpperCase();
    var fechaEnc = f[SIGEM_COL_ENC.FECHA];

    var esSi = function(v) { return v === 'SI' || v === 'SÍ' || v === 'S' || v === '1' || v === 'TRUE' || v === 'VERDADERO'; };

    if (esSi(contesto)) resultado.contestaron++;
    else resultado.noContestaron++;

    if (esSi(cRef)) resultado.conoceReferente++;
    if (esSi(cCand)) resultado.conoceCandidato++;
    if (esSi(votaria)) resultado.votarian++;
    if (esSi(sabeVotar)) resultado.sabenVotar++;
    if (esSi(conoceMesa)) resultado.conocenMesa++;
    if (esSi(infoWA)) resultado.infoWA++;

    // Por operador
    if (operador) {
      if (!operadores[operador]) operadores[operador] = { llamadas: 0, contactados: 0, votos: 0 };
      operadores[operador].llamadas++;
      if (esSi(contesto)) operadores[operador].contactados++;
      if (esSi(votaria)) operadores[operador].votos++;
    }

    // Por comuna
    if (puesto && mapaPuestos) {
      var comKey = mapaPuestos[puesto] || 'SIN COMUNA';
      if (!comunas[comKey]) comunas[comKey] = { llamadas: 0, contactados: 0, votos: 0 };
      comunas[comKey].llamadas++;
      if (esSi(contesto)) comunas[comKey].contactados++;
      if (esSi(votaria)) comunas[comKey].votos++;
    }

    // Por dia
    if (fechaEnc) {
      var fd = (fechaEnc instanceof Date) ? fechaEnc : new Date(fechaEnc);
      if (!isNaN(fd.getTime())) {
        var kd = Utilities.formatDate(fd, 'America/Bogota', 'dd/MM');
        if (!dias[kd]) dias[kd] = { llamadas: 0, contactados: 0, votos: 0 };
        dias[kd].llamadas++;
        if (esSi(contesto)) dias[kd].contactados++;
        if (esSi(votaria)) dias[kd].votos++;
      }
    }
  }

  // Tasas
  resultado.tasaContacto = resultado.totalLlamadas > 0 ? Math.round((resultado.contestaron / resultado.totalLlamadas) * 1000) / 10 : 0;
  resultado.tasaVoto = resultado.contestaron > 0 ? Math.round((resultado.votarian / resultado.contestaron) * 1000) / 10 : 0;
  resultado.tasaConoceCandidato = resultado.contestaron > 0 ? Math.round((resultado.conoceCandidato / resultado.contestaron) * 1000) / 10 : 0;

  // Arrays para graficos
  var opArr = [];
  for (var ok in operadores) {
    opArr.push({ label: ok, llamadas: operadores[ok].llamadas, contactados: operadores[ok].contactados, votos: operadores[ok].votos });
  }
  opArr.sort(function(a, b) { return b.llamadas - a.llamadas; });
  resultado.porOperador = opArr.slice(0, 10);

  var comArr = [];
  for (var ck in comunas) {
    var lab = ck.replace('COMUNA ', '');
    comArr.push({ label: lab, llamadas: comunas[ck].llamadas, contactados: comunas[ck].contactados, votos: comunas[ck].votos });
  }
  comArr.sort(function(a, b) { return b.llamadas - a.llamadas; });
  resultado.porComuna = comArr;

  var diaArr = [];
  for (var dk in dias) {
    diaArr.push({ label: dk, llamadas: dias[dk].llamadas, contactados: dias[dk].contactados, votos: dias[dk].votos });
  }
  resultado.porDia = diaArr;

  return resultado;
}


// ================================================================
// COMUNAS
// ================================================================

function sigemAnalizarComunas(datosReg, mapaPuestos) {
  if (!datosReg) return { tabla: [], distribucion: [], cobertura: [] };

  var cd = {};
  for (var c = 0; c < SIGEM_COMUNAS.length; c++) {
    cd[SIGEM_COMUNAS[c]] = { nombre: SIGEM_COMUNAS[c], simp: 0, cp: 0, barrios: {}, lideres: {} };
  }
  cd['SIN COMUNA'] = { nombre: 'SIN COMUNA', simp: 0, cp: 0, barrios: {}, lideres: {} };

  for (var i = 0; i < datosReg.length; i++) {
    var fila = datosReg[i];
    var puesto = String(fila[SIGEM_COL_REG.PUESTO_VOTACION] || '').trim().toUpperCase();
    var barrio = String(fila[SIGEM_COL_REG.BARRIO] || '').trim().toUpperCase();
    var lider = String(fila[SIGEM_COL_REG.NOMBRE_LIDER] || '').trim();
    var tp = (puesto !== '' && puesto !== 'UNDEFINED' && puesto !== 'NULL' && puesto !== 'SIN ASIGNAR' && puesto !== 'NO REGISTRA');

    var ck = 'SIN COMUNA';
    if (puesto && mapaPuestos[puesto]) {
      ck = mapaPuestos[puesto];
      if (!cd[ck]) {
        var enc = false;
        for (var k in cd) { if (k !== 'SIN COMUNA' && (k.indexOf(ck) !== -1 || ck.indexOf(k) !== -1)) { ck = k; enc = true; break; } }
        if (!enc) ck = 'SIN COMUNA';
      }
    }

    cd[ck].simp++;
    if (tp) cd[ck].cp++;
    if (barrio) cd[ck].barrios[barrio] = true;
    if (lider) cd[ck].lideres[lider] = true;
  }

  var tabla = [], distribucion = [], cobertura = [];
  var claves = Object.keys(cd);
  claves.sort(function(a, b) { return cd[b].simp - cd[a].simp; });

  for (var j = 0; j < claves.length; j++) {
    var d = cd[claves[j]];
    var nb = Object.keys(d.barrios).length;
    var nl = Object.keys(d.lideres).length;
    var cob = d.simp > 0 ? Math.round((d.cp / d.simp) * 100) : 0;
    tabla.push({ nombre: d.nombre, simpatizantes: d.simp, conPuesto: d.cp, lideres: nl, barrios: nb, cobertura: cob });
    if (d.simp > 0) {
      var lab = d.nombre.replace('COMUNA ', '');
      distribucion.push({ label: lab, value: d.simp });
      cobertura.push({ label: lab, value: cob });
    }
  }
  return { tabla: tabla, distribucion: distribucion, cobertura: cobertura };
}


// ================================================================
// RANKING LIDERES
// ================================================================

function sigemRankingLideres(datosReg) {
  if (!datosReg) return { top10: [], efectividad: [], ranking: [] };

  var lm = {};
  for (var i = 0; i < datosReg.length; i++) {
    var fila = datosReg[i];
    var nl = String(fila[SIGEM_COL_REG.NOMBRE_LIDER] || '').trim();
    if (!nl || nl === 'undefined') continue;
    if (!lm[nl]) lm[nl] = { nombre: nl, total: 0, cp: 0, uf: null };
    lm[nl].total++;

    var puesto = String(fila[SIGEM_COL_REG.PUESTO_VOTACION] || '').trim().toUpperCase();
    if (puesto !== '' && puesto !== 'UNDEFINED' && puesto !== 'SIN ASIGNAR' && puesto !== 'NO REGISTRA') lm[nl].cp++;

    var fr = fila[SIGEM_COL_REG.FECHA_REGISTRO];
    if (fr) {
      var f = (fr instanceof Date) ? fr : new Date(fr);
      if (!isNaN(f.getTime()) && (!lm[nl].uf || f > lm[nl].uf)) lm[nl].uf = f;
    }
  }

  var lista = [];
  for (var key in lm) lista.push(lm[key]);
  lista.sort(function(a, b) { return b.total - a.total; });

  var ranking = [], top10 = [], efectividad = [];
  for (var k = 0; k < Math.min(lista.length, 30); k++) {
    var l = lista[k];
    var ef = l.total > 0 ? Math.round((l.cp / l.total) * 100) : 0;
    var fs = '';
    if (l.uf) { try { fs = Utilities.formatDate(l.uf, 'America/Bogota', 'dd/MM/yyyy'); } catch(e) {} }
    ranking.push({ pos: k+1, nombre: l.nombre, total: l.total, conPuesto: l.cp, efectividad: ef, ultimaFecha: fs });
    if (k < 10) {
      top10.push({ label: l.nombre, value: l.total });
      efectividad.push({ label: l.nombre, value: ef });
    }
  }
  return { top10: top10, efectividad: efectividad, ranking: ranking };
}


// ================================================================
// TENDENCIA
// ================================================================

function sigemCalcularTendencia(datosReg) {
  if (!datosReg) return { diario: [], semanal: [], acumulado: [] };

  var hoy = new Date(); hoy.setHours(0,0,0,0);
  var conteo30 = {};
  for (var d = 29; d >= 0; d--) {
    var dia = new Date(hoy.getTime()); dia.setDate(dia.getDate() - d);
    conteo30[Utilities.formatDate(dia, 'America/Bogota', 'yyyy-MM-dd')] = 0;
  }
  var conteoMes = {};

  for (var i = 0; i < datosReg.length; i++) {
    var fr = datosReg[i][SIGEM_COL_REG.FECHA_REGISTRO];
    if (!fr) continue;
    var f = (fr instanceof Date) ? fr : new Date(fr);
    if (isNaN(f.getTime())) continue;
    var kd = Utilities.formatDate(f, 'America/Bogota', 'yyyy-MM-dd');
    if (conteo30.hasOwnProperty(kd)) conteo30[kd]++;
    var km = Utilities.formatDate(f, 'America/Bogota', 'yyyy-MM');
    if (!conteoMes[km]) conteoMes[km] = 0;
    conteoMes[km]++;
  }

  var diario = [];
  var cd = Object.keys(conteo30); cd.sort();
  for (var j = 0; j < cd.length; j++) {
    var p = cd[j].split('-');
    diario.push({ label: p[2] + '/' + p[1], value: conteo30[cd[j]] });
  }

  var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var mk = Object.keys(conteoMes); mk.sort();
  var acumulado = [], ac = 0;
  for (var m = 0; m < mk.length; m++) {
    ac += conteoMes[mk[m]];
    var pm = mk[m].split('-');
    acumulado.push({ label: meses[parseInt(pm[1],10)-1] + ' ' + pm[0].substring(2), value: ac, registros: conteoMes[mk[m]] });
  }

  var semanal = [];
  for (var s = 11; s >= 0; s--) {
    var ini = new Date(hoy.getTime()); ini.setDate(ini.getDate() - (s*7+6)); ini.setHours(0,0,0,0);
    var fin = new Date(hoy.getTime()); fin.setDate(fin.getDate() - (s*7)); fin.setHours(23,59,59,999);
    var ts = 0;
    for (var r = 0; r < datosReg.length; r++) {
      var frs = datosReg[r][SIGEM_COL_REG.FECHA_REGISTRO];
      if (!frs) continue;
      var fs = (frs instanceof Date) ? frs : new Date(frs);
      if (!isNaN(fs.getTime()) && fs >= ini && fs <= fin) ts++;
    }
    semanal.push({ label: 'S' + (12-s), value: ts });
  }

  return { diario: diario, semanal: semanal, acumulado: acumulado };
}


// ================================================================
// PREDICCION
// ================================================================

function sigemCalcularPrediccion(datosReg) {
  var vacio = { proyeccion: 0, escenarios: { pesimista: 0, base: 0, optimista: 0 }, confianza: 0, r2: 0, diasRestantes: 0, velocidadActual: 0, totalActual: 0, datosProyeccion: [] };
  if (!datosReg || datosReg.length === 0) return vacio;

  var hoy = new Date(); hoy.setHours(0,0,0,0);
  var diasRest = Math.max(0, Math.ceil((SIGEM_FECHA_ELECCIONES.getTime() - hoy.getTime()) / 86400000));

  var d30 = [];
  for (var d = 29; d >= 0; d--) {
    var dia = new Date(hoy.getTime()); dia.setDate(dia.getDate() - d); dia.setHours(0,0,0,0);
    d30.push({ fecha: dia, count: 0 });
  }
  for (var i = 0; i < datosReg.length; i++) {
    var fr = datosReg[i][SIGEM_COL_REG.FECHA_REGISTRO];
    if (!fr) continue;
    var f = (fr instanceof Date) ? fr : new Date(fr);
    if (isNaN(f.getTime())) continue;
    f.setHours(0,0,0,0);
    for (var j = 0; j < d30.length; j++) {
      if (f.getTime() === d30[j].fecha.getTime()) { d30[j].count++; break; }
    }
  }

  // Regresion lineal
  var n = d30.length;
  var sx=0, sy=0, sxy=0, sx2=0;
  for (var k = 0; k < n; k++) { sx += k; sy += d30[k].count; sxy += k*d30[k].count; sx2 += k*k; }
  var den = (n*sx2 - sx*sx);
  var b = den !== 0 ? (n*sxy - sx*sy) / den : 0;
  var a = (sy - b*sx) / n;

  var ym = sy/n, ssRes=0, ssTot=0;
  for (var m = 0; m < n; m++) { ssRes += Math.pow(d30[m].count - (a+b*m), 2); ssTot += Math.pow(d30[m].count - ym, 2); }
  var r2 = ssTot > 0 ? Math.max(0, Math.round((1 - ssRes/ssTot)*100)/100) : 0;

  // Suavizado exponencial
  var suav = d30[0].count;
  for (var s = 1; s < n; s++) suav = 0.3*d30[s].count + 0.7*suav;

  var vel = Math.round((0.6*suav + 0.4*Math.max(0, a+b*(n-1)))*10)/10;
  var total = datosReg.length;

  // Datos grafico
  var dp = [];
  var ah = total;
  for (var h = 29; h >= 0; h--) ah -= d30[29-h].count;
  for (var g = 0; g < d30.length; g++) {
    ah += d30[g].count;
    dp.push({ label: Utilities.formatDate(d30[g].fecha, 'America/Bogota', 'dd/MM'), historico: ah, proyeccion: null });
  }
  var intv = Math.max(1, Math.floor(diasRest/12));
  for (var pf = intv; pf <= Math.min(diasRest, 400); pf += intv) {
    var df = new Date(hoy.getTime()); df.setDate(df.getDate()+pf);
    dp.push({ label: Utilities.formatDate(df, 'America/Bogota', 'dd/MM'), historico: null, proyeccion: Math.round(total + vel*pf) });
  }

  return {
    proyeccion: Math.round(total + vel*diasRest),
    escenarios: { pesimista: Math.round(total + vel*0.7*diasRest), base: Math.round(total + vel*diasRest), optimista: Math.round(total + vel*1.3*diasRest) },
    confianza: Math.min(95, Math.max(10, Math.round(r2*70+30))),
    r2: r2, diasRestantes: diasRest, velocidadActual: vel, totalActual: total, datosProyeccion: dp
  };
}


// ================================================================
// DETALLE COMUNA
// ================================================================

function obtenerDetalleComunaSIGEM(nombreComuna) {
  try {
    var ssReg = SpreadsheetApp.openById(SIGEM_ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName(SIGEM_HOJA_REGISTROS);
    var hojaPuestos = ssReg.getSheetByName(SIGEM_HOJA_PUESTOS);
    if (!hojaReg) return { success: false, message: 'Hoja no encontrada' };

    var datosReg = hojaReg.getLastRow() > 1 ? hojaReg.getRange(2,1,hojaReg.getLastRow()-1,hojaReg.getLastColumn()).getValues() : [];
    var dp = (hojaPuestos && hojaPuestos.getLastRow() > 1) ? hojaPuestos.getRange(2,1,hojaPuestos.getLastRow()-1,2).getValues() : [];

    var mp = {};
    for (var p = 0; p < dp.length; p++) {
      var np = String(dp[p][0]||'').trim().toUpperCase();
      var co = String(dp[p][1]||'').trim().toUpperCase();
      if (np && co) mp[np] = co;
    }

    var cb = String(nombreComuna||'').trim().toUpperCase();
    var lids = {}, bars = {}, psts = {}, tot = 0;

    for (var i = 0; i < datosReg.length; i++) {
      var fila = datosReg[i];
      var puesto = String(fila[SIGEM_COL_REG.PUESTO_VOTACION]||'').trim().toUpperCase();
      var cr = mp[puesto] || 'SIN COMUNA';
      if (cr.indexOf(cb) !== -1 || cb.indexOf(cr) !== -1) {
        tot++;
        var lid = String(fila[SIGEM_COL_REG.NOMBRE_LIDER]||'').trim();
        var bar = String(fila[SIGEM_COL_REG.BARRIO]||'').trim();
        if (lid) { if (!lids[lid]) lids[lid]=0; lids[lid]++; }
        if (bar) { if (!bars[bar]) bars[bar]=0; bars[bar]++; }
        if (puesto) { if (!psts[puesto]) psts[puesto]=0; psts[puesto]++; }
      }
    }

    var ll=[], bl=[], pl=[];
    for (var lk in lids) ll.push({nombre:lk,cantidad:lids[lk]});
    for (var bk in bars) bl.push({nombre:bk,cantidad:bars[bk]});
    for (var pk in psts) pl.push({nombre:pk,cantidad:psts[pk]});
    ll.sort(function(a,b){return b.cantidad-a.cantidad;});
    bl.sort(function(a,b){return b.cantidad-a.cantidad;});
    pl.sort(function(a,b){return b.cantidad-a.cantidad;});

    return { success:true, comuna:nombreComuna, total:tot, lideres:ll.slice(0,20), barrios:bl.slice(0,20), puestos:pl.slice(0,20) };
  } catch(e) {
    return { success:false, message:e.message };
  }
}


// ================================================================
// INFORME CSV
// ================================================================

function generarInformeSIGEM() {
  try {
    var datos = obtenerDatosSIGEM();
    if (!datos.success) return { success: false, message: datos.message };

    var l = [];
    l.push('INFORME INTELIGENCIA ELECTORAL 360');
    l.push('Generado,' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm'));
    l.push('Fecha Elecciones,Domingo 8 de Marzo 2026');
    l.push('');
    l.push('KPI,VALOR');
    l.push('Total Simpatizantes,' + datos.kpis.totalSimp);
    l.push('Total Lideres,' + datos.kpis.totalLideres);
    l.push('Cobertura Puesto (%),' + datos.kpis.cobertura);
    l.push('Velocidad Diaria,' + datos.kpis.velocidad);
    l.push('Contactabilidad (%),' + datos.kpis.contactabilidad);
    l.push('Promedio x Lider,' + datos.kpis.promedioXLider);
    l.push('');
    l.push('INTENCION DE VOTO,VALOR');
    l.push('Total Llamadas,' + datos.encuesta.totalLlamadas);
    l.push('Contestaron,' + datos.encuesta.contestaron);
    l.push('Conoce Candidato,' + datos.encuesta.conoceCandidato);
    l.push('Votarian,' + datos.encuesta.votarian);
    l.push('Saben Votar,' + datos.encuesta.sabenVotar);
    l.push('Tasa Contacto (%),' + datos.encuesta.tasaContacto);
    l.push('Tasa Voto Confirmado (%),' + datos.encuesta.tasaVoto);
    l.push('');
    l.push('PREDICCION,VALOR');
    l.push('Dias Restantes,' + datos.prediccion.diasRestantes);
    l.push('Escenario Pesimista,' + datos.prediccion.escenarios.pesimista);
    l.push('Escenario Base,' + datos.prediccion.escenarios.base);
    l.push('Escenario Optimista,' + datos.prediccion.escenarios.optimista);
    l.push('');
    l.push('COMUNA,Simpatizantes,Con Puesto,Lideres,Barrios,Cobertura');
    for (var c = 0; c < datos.comunas.tabla.length; c++) {
      var cm = datos.comunas.tabla[c];
      l.push(cm.nombre+','+cm.simpatizantes+','+cm.conPuesto+','+cm.lideres+','+cm.barrios+','+cm.cobertura);
    }
    l.push('');
    l.push('POS,LIDER,Simpatizantes,Con Puesto,Efectividad,Ultimo Registro');
    for (var r = 0; r < datos.lideres.ranking.length; r++) {
      var li = datos.lideres.ranking[r];
      l.push(li.pos+','+li.nombre+','+li.total+','+li.conPuesto+','+li.efectividad+','+li.ultimaFecha);
    }

    return { success: true, csv: l.join('\n'), filename: 'Informe_SIGEM_' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd_HHmm') + '.csv' };
  } catch(e) {
    return { success: false, message: e.message };
  }
}