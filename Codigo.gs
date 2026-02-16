// ================================================================
// CÓDIGO.GS CONSOLIDADO - SISTEMA 40 CALDAS
// ================================================================

// ========== CONFIGURACIÓN GLOBAL ==========
var ID_REGISTROS = '1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s';
var ID_SEGUIMIENTO_GT = '1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo';

// Alias para compatibilidad
var ID_ARCHIVO_GT = ID_SEGUIMIENTO_GT;
var ID_SIMPATIZANTES = ID_REGISTROS;
var SPREADSHEET_SIMPATIZANTES_ID = ID_REGISTROS;

var CONFIG_LLAMADAS = {
  SPREADSHEET_ID: ID_SEGUIMIENTO_GT,
  HOJA_DATOS: 'BD-lideres',
  CLAVE_ACCESO: 'llamadas2025'
};

// ========== MAPEO DE COLUMNAS BD-LIDERES (41 columnas, A-AO) ==========
var COL = {
  TIMESTAMP: 0, EMAIL_FORM: 1, NOMBRE: 2, TIPO_DOC: 3, DOCUMENTO: 4,
  FECHA_NAC: 5, CELULAR: 6, DIRECCION: 7, BARRIO: 8, CORREO: 9,
  PROFESION: 10, ENTIDAD: 11, CARGO: 12, VINCULACION: 13, HORARIOS: 14,
  SALARIO: 15, SENTIDO_CARGO: 16, CONOCE_JFA: 17, LIDER_BARRIO: 18,
  EXPECTATIVAS: 19, ESTUDIOS: 20, HIJOS: 21, HIJOS_DUP: 22, DEPORTE: 23,
  VEHICULO: 24, FOTO: 25, OBSERVACIONES: 26, REFERIDO: 27, MUNICIPIO: 28,
  NUM_NINOS: 29, NUM_NINAS: 30, TIPO_VEHICULO: 31, PLACA: 32,
  CORREO_DUP: 33, LIDER_NO_LISTADO: 34, ESTADO_LLAMADA: 35,
  FECHA_LLAMADA: 36, USUARIO_LLAMADA: 37, NOTAS_LLAMADA: 38,
  USUARIO_MODIF: 39, COMUNA: 40
};

// ========== MAPEO DE COLUMNAS REGISTROS (Simpatizantes) ==========
var COL_SIMP = {
  NOMBRE: 0, TIPO_DOC: 1, DOCUMENTO: 2, CELULAR: 3,
  DIRECCION: 4, BARRIO: 5, DEPARTAMENTO: 6, MUNICIPIO: 7,
  HA_SIDO: 8, LIDER_DOC: 9, LIDER_NOMBRE: 10, FECHA_REGISTRO: 11,
  PUESTO_VOTACION: 12, MESA: 13, CONTESTO: 14, CONOCE_REFERENTE: 15,
  CONOCE_CANDIDATO: 16, VOTARIA_CANDIDATO: 17, SABE_VOTAR: 18,
  CONOCE_MESA_PUESTO: 19, INFO_WHATSAPP: 20, LISTADO_14_MAYO: 21
};

// ========== CACHE GLOBAL ==========
var cacheEstadisticas = null;
var tiempoCache = null;
var DURACION_CACHE = 5 * 60 * 1000;

function limpiarCache() {
  cacheEstadisticas = null;
  tiempoCache = null;
  return { success: true, message: 'Caché limpiado' };
}


// ================================================================
// FUNCIÓN PRINCIPAL - SERVIR HTML
// ================================================================
function doGet(e) {
  var mode = (e && e.parameter && e.parameter.mode) ? e.parameter.mode : 'menu';

  Logger.log('doGet - Modo: ' + mode);

  var archivo = 'menu';
  var titulo = '40 Caldas - WilCas 40';

  if (mode === 'admin') {
    return servirAdmin();
  } else if (mode === 'llamadas') {
    archivo = 'llamadas';
    titulo = 'Gestion de Llamadas - 40 Caldas';
  } else if (mode === 'registro') {
    archivo = 'registro';
    titulo = 'Registro de Simpatizantes - 40 Caldas';
  }

  try {
    if (mode === 'menu') {
      var baseUrl = ScriptApp.getService().getUrl();
      var htmlMenu = HtmlService.createHtmlOutputFromFile(archivo).getContent();
      htmlMenu = htmlMenu.split('{{BASE_URL}}').join(baseUrl);
      return HtmlService.createHtmlOutput(htmlMenu)
        .setTitle(titulo)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    return HtmlService.createHtmlOutputFromFile(archivo)
      .setTitle(titulo)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    Logger.log('ERROR doGet: ' + err.toString());
    return HtmlService.createHtmlOutput(
      '<html><body style="font-family:Arial;padding:40px;text-align:center;">' +
      '<h2 style="color:#BE123C;">Error al cargar</h2>' +
      '<p>Archivo: <strong>' + archivo + '.html</strong></p>' +
      '<p style="color:#991B1B;">' + err.toString() + '</p>' +
      '<br><a href="' + ScriptApp.getService().getUrl() + '" style="color:#D95F0E;font-weight:bold;">Ir al Menu</a>' +
      '</body></html>'
    ).setTitle('Error - 40 Caldas');
  }
}


// ================================================================
// CONSTRUIR PÁGINA ADMIN SIN TEMPLATE ENGINE
// ================================================================
function servirAdmin() {
  try {
    var html = HtmlService.createHtmlOutputFromFile('admin').getContent();

    var modulos = [
      'admin-dashboard',
      'admin-auditoria-lideres',
      'admin-auditoria-simp',
      'admin-tabla-lideres',
      'admin-rendimiento',
      'admin-busqueda',
      'admin-graficas',
      'admin-configuracion',
      'whatsapp',
      'cumpleanos',
      'admin-mapa-calor'
    ];

    var contenidoModulos = '';
    for (var i = 0; i < modulos.length; i++) {
      try {
        contenidoModulos += '\n' + HtmlService.createHtmlOutputFromFile(modulos[i]).getContent();
        Logger.log('Modulo OK: ' + modulos[i]);
      } catch (modErr) {
        Logger.log('Modulo NO encontrado: ' + modulos[i]);
        contenidoModulos += '\n<div style="background:#FEF3C7;border:1px solid #FDE68A;' +
          'border-radius:10px;padding:20px;margin:10px 0;text-align:center;">' +
          '<p style="color:#92400E;font-weight:bold;">Modulo no disponible: ' + modulos[i] + '</p>' +
          '<p style="color:#B45309;font-size:12px;">Crea el archivo <strong>' + modulos[i] +
          '.html</strong> en Apps Script.</p></div>';
      }
    }

    if (html.indexOf('<!-- MODULOS -->') !== -1) {
      html = html.replace('<!-- MODULOS -->', contenidoModulos);
    } else {
      html = html.replace('</body>', contenidoModulos + '\n</body>');
    }

    Logger.log('Admin construido exitosamente');

    return HtmlService.createHtmlOutput(html)
      .setTitle('Panel de Administracion - 40 Caldas')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    Logger.log('ERROR servirAdmin: ' + err.toString());
    return HtmlService.createHtmlOutput(
      '<html><body style="font-family:Arial;padding:40px;text-align:center;">' +
      '<h2 style="color:#BE123C;">Error al cargar el Panel</h2>' +
      '<p style="color:#991B1B;">' + err.toString() + '</p>' +
      '<br><a href="' + ScriptApp.getService().getUrl() + '" style="color:#D95F0E;font-weight:bold;">Ir al Menu</a>' +
      '</body></html>'
    ).setTitle('Error - 40 Caldas');
  }
}


// ================================================================
// FUNCIÓN INCLUDE (mantenida por compatibilidad)
// ================================================================
function include(filename) {
  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    return '';
  }
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    Logger.log('INCLUDE: ' + filename + ' no encontrado');
    return '';
  }
}


// ========== AUTENTICACIÓN ==========
function validarCredencialesAdmin(usuario, clave) {
  try {
    var ADMIN_USUARIO = 'Administrador';
    var ADMIN_CLAVE = 'PartidoU2026*';

    if (usuario === ADMIN_USUARIO && clave === ADMIN_CLAVE) {
      return { success: true, message: 'Acceso autorizado' };
    }
    if (usuario === 'admin' && clave === 'admin123') {
      return { success: true, message: 'Acceso autorizado' };
    }
    return { success: false, message: 'Usuario o contraseña incorrectos' };
  } catch (error) {
    Logger.log('Error validando credenciales: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

function verificarCredenciales(usuario, contrasena) {
  try {
    if (usuario === 'admin' && contrasena === 'admin123') {
      return { success: true, rol: 'admin', nombre: 'Administrador' };
    }
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaUsuarios = ss.getSheetByName('Usuarios');
    if (hojaUsuarios) {
      var datos = hojaUsuarios.getDataRange().getValues();
      for (var i = 1; i < datos.length; i++) {
        if (datos[i][0] === usuario && datos[i][1] === contrasena) {
          return { success: true, rol: datos[i][2] || 'usuario', nombre: datos[i][3] || usuario };
        }
      }
    }
    return { success: false, mensaje: 'Credenciales incorrectas' };
  } catch (error) {
    return { success: false, mensaje: error.toString() };
  }
}

// ========== TEST COMUNICACIÓN ==========
function testComunicacion() {
  return { success: true, mensaje: 'Comunicación OK', timestamp: new Date().toString() };
}


// ================================================================
// OBTENER DATOS DE LÍDERES (VERSIÓN COMPLETA CON SIMPATIZANTES)
// ================================================================
function obtenerDatosLlamadasWrapper() {
  try {
    Logger.log('=== OBTENER DATOS LLAMADAS (41 COLUMNAS) ===');

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ss.getSheetByName('BD-lideres');
    if (!hojaLideres) {
      return { success: false, message: 'Hoja BD-lideres no encontrada', datos: [] };
    }

    var ultimaFila = hojaLideres.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, datos: [], total: 0 };
    }

    // Leer exactamente 41 columnas para evitar columnas fantasma
    var datos = hojaLideres.getRange(2, 1, ultimaFila - 1, 41).getValues();

    var conteoSimpatizantes = {};
    try {
      var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
      var hojaReg = ssReg.getSheetByName('Registros');
      if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
      if (hojaReg) {
        var datosReg = hojaReg.getDataRange().getValues();
        for (var r = 1; r < datosReg.length; r++) {
          var idLider = datosReg[r][COL_SIMP.LIDER_DOC] ? String(datosReg[r][COL_SIMP.LIDER_DOC]).trim() : '';
          if (idLider) {
            conteoSimpatizantes[idLider] = (conteoSimpatizantes[idLider] || 0) + 1;
          }
        }
      }
    } catch (e) {
      Logger.log('Error contando simpatizantes: ' + e.toString());
    }

    var resultado = [];
    var lideresYaIncluidos = {};

    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      var doc = fila[COL.DOCUMENTO] ? String(fila[COL.DOCUMENTO]).trim() : '';
      var nombre = fila[COL.NOMBRE] ? String(fila[COL.NOMBRE]).trim() : '';

      if (!nombre && !doc) continue;
      if (doc && lideresYaIncluidos[doc]) continue;
      if (doc) lideresYaIncluidos[doc] = true;

      var fechaNacStr = '';
      if (fila[COL.FECHA_NAC]) {
        try {
          var fn = new Date(fila[COL.FECHA_NAC]);
          if (!isNaN(fn.getTime())) {
            fechaNacStr = Utilities.formatDate(fn, 'America/Bogota', 'dd/MM/yyyy');
          }
        } catch (e) { fechaNacStr = String(fila[COL.FECHA_NAC]); }
      }

      var fechaLlamadaStr = '';
      if (fila[COL.FECHA_LLAMADA]) {
        try {
          var fl = new Date(fila[COL.FECHA_LLAMADA]);
          if (!isNaN(fl.getTime())) {
            fechaLlamadaStr = Utilities.formatDate(fl, 'America/Bogota', 'dd/MM/yyyy');
          }
        } catch (e) { fechaLlamadaStr = String(fila[COL.FECHA_LLAMADA]); }
      }

      var cantSimp = conteoSimpatizantes[doc] || 0;

      // Se envían ambos nombres de propiedad para compatibilidad con el frontend
      resultado.push({
        rowIndex: i + 2,
        nombre: nombre,
        tipoDocumento: fila[COL.TIPO_DOC] ? String(fila[COL.TIPO_DOC]) : '',
        documento: doc,
        fechaNacimiento: fechaNacStr,
        celular: fila[COL.CELULAR] ? String(fila[COL.CELULAR]) : '',
        direccion: fila[COL.DIRECCION] ? String(fila[COL.DIRECCION]) : '',
        barrio: fila[COL.BARRIO] ? String(fila[COL.BARRIO]) : '',
        correo: fila[COL.CORREO] ? String(fila[COL.CORREO]) : '',
        profesion: fila[COL.PROFESION] ? String(fila[COL.PROFESION]) : '',
        entidad: fila[COL.ENTIDAD] ? String(fila[COL.ENTIDAD]) : '',
        cargo: fila[COL.CARGO] ? String(fila[COL.CARGO]) : '',
        vinculacion: fila[COL.VINCULACION] ? String(fila[COL.VINCULACION]) : '',
        tipoVinculacion: fila[COL.VINCULACION] ? String(fila[COL.VINCULACION]) : '',
        horarios: fila[COL.HORARIOS] ? String(fila[COL.HORARIOS]) : '',
        salario: fila[COL.SALARIO] ? String(fila[COL.SALARIO]) : '',
        sentidoCargo: fila[COL.SENTIDO_CARGO] ? String(fila[COL.SENTIDO_CARGO]) : '',
        conoceJuanFelipe: fila[COL.CONOCE_JFA] ? String(fila[COL.CONOCE_JFA]) : '',
        conoceJFA: fila[COL.CONOCE_JFA] ? String(fila[COL.CONOCE_JFA]) : '',
        liderBarrio: fila[COL.LIDER_BARRIO] ? String(fila[COL.LIDER_BARRIO]) : '',
        expectativasProyecto: fila[COL.EXPECTATIVAS] ? String(fila[COL.EXPECTATIVAS]) : '',
        expectativas: fila[COL.EXPECTATIVAS] ? String(fila[COL.EXPECTATIVAS]) : '',
        estudios: fila[COL.ESTUDIOS] ? String(fila[COL.ESTUDIOS]) : '',
        numeroHijos: fila[COL.HIJOS] ? String(fila[COL.HIJOS]) : '',
        hijos: fila[COL.HIJOS] ? String(fila[COL.HIJOS]) : '',
        deporte: fila[COL.DEPORTE] ? String(fila[COL.DEPORTE]) : '',
        tieneVehiculo: fila[COL.VEHICULO] ? String(fila[COL.VEHICULO]) : '',
        vehiculo: fila[COL.VEHICULO] ? String(fila[COL.VEHICULO]) : '',
        foto: fila[COL.FOTO] ? String(fila[COL.FOTO]) : '',
        observaciones: fila[COL.OBSERVACIONES] ? String(fila[COL.OBSERVACIONES]) : '',
        referido: fila[COL.REFERIDO] ? String(fila[COL.REFERIDO]) : '',
        municipio: fila[COL.MUNICIPIO] ? String(fila[COL.MUNICIPIO]) : '',
        numNinos: fila[COL.NUM_NINOS] ? String(fila[COL.NUM_NINOS]) : '',
        numNinas: fila[COL.NUM_NINAS] ? String(fila[COL.NUM_NINAS]) : '',
        tipoVehiculo: fila[COL.TIPO_VEHICULO] ? String(fila[COL.TIPO_VEHICULO]) : '',
        placa: fila[COL.PLACA] ? String(fila[COL.PLACA]) : '',
        liderNoListado: fila[COL.LIDER_NO_LISTADO] ? String(fila[COL.LIDER_NO_LISTADO]) : '',
        estadoLlamada: fila[COL.ESTADO_LLAMADA] ? String(fila[COL.ESTADO_LLAMADA]) : 'pendiente',
        fechaLlamada: fechaLlamadaStr,
        usuarioLlamada: fila[COL.USUARIO_LLAMADA] ? String(fila[COL.USUARIO_LLAMADA]) : '',
        notasLlamada: fila[COL.NOTAS_LLAMADA] ? String(fila[COL.NOTAS_LLAMADA]) : '',
        usuarioModifico: fila[COL.USUARIO_MODIF] ? String(fila[COL.USUARIO_MODIF]) : '',
        comuna: fila[COL.COMUNA] ? String(fila[COL.COMUNA]) : '',
        cantidadSimpatizantes: cantSimp,
        metaCumplida: cantSimp >= 40
      });
    }

    Logger.log('Registros procesados: ' + resultado.length);
    return { success: true, datos: resultado, total: resultado.length };

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), datos: [] };
  }
}


// ================================================================
// OBTENER DATOS LIGEROS (para carga inicial rápida)
// ================================================================
function obtenerDatosLlamadasLigero() {
  try {
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ss.getSheetByName('BD-lideres');
    if (!hojaLideres) return { success: false, message: 'Hoja no encontrada', datos: [] };

    var ultimaFila = hojaLideres.getLastRow();
    if (ultimaFila <= 1) return { success: true, datos: [], total: 0 };

    var datos = hojaLideres.getRange(2, 1, ultimaFila - 1, 41).getValues();

    var conteo = {};
    try {
      var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
      var hojaReg = ssReg.getSheetByName('Registros');
      if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
      if (hojaReg) {
        var datosReg = hojaReg.getDataRange().getValues();
        for (var r = 1; r < datosReg.length; r++) {
          var idL = datosReg[r][COL_SIMP.LIDER_DOC] ? String(datosReg[r][COL_SIMP.LIDER_DOC]).trim() : '';
          if (idL) conteo[idL] = (conteo[idL] || 0) + 1;
        }
      }
    } catch (e) {}

    var resultado = [];
    var yaIncluidos = {};

    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      var doc = fila[COL.DOCUMENTO] ? String(fila[COL.DOCUMENTO]).trim() : '';
      var nombre = fila[COL.NOMBRE] ? String(fila[COL.NOMBRE]).trim() : '';
      if (!nombre && !doc) continue;
      if (doc && yaIncluidos[doc]) continue;
      if (doc) yaIncluidos[doc] = true;

      var cantSimp = conteo[doc] || 0;

      resultado.push({
        rowIndex: i + 2,
        nombre: nombre,
        documento: doc,
        celular: fila[COL.CELULAR] ? String(fila[COL.CELULAR]) : '',
        entidad: fila[COL.ENTIDAD] ? String(fila[COL.ENTIDAD]) : '',
        municipio: fila[COL.MUNICIPIO] ? String(fila[COL.MUNICIPIO]) : '',
        barrio: fila[COL.BARRIO] ? String(fila[COL.BARRIO]) : '',
        comuna: fila[COL.COMUNA] ? String(fila[COL.COMUNA]) : '',
        estadoLlamada: fila[COL.ESTADO_LLAMADA] ? String(fila[COL.ESTADO_LLAMADA]) : 'pendiente',
        usuarioLlamada: fila[COL.USUARIO_LLAMADA] ? String(fila[COL.USUARIO_LLAMADA]) : '',
        cantidadSimpatizantes: cantSimp,
        metaCumplida: cantSimp >= 40
      });
    }

    return { success: true, datos: resultado, total: resultado.length };
  } catch (error) {
    return { success: false, message: error.toString(), datos: [] };
  }
}


// ================================================================
// OBTENER ESTADÍSTICAS OPTIMIZADAS (DASHBOARD)
// ================================================================
function obtenerEstadisticasOptimizadas() {
  try {
    var ahora = new Date().getTime();
    if (cacheEstadisticas && tiempoCache && (ahora - tiempoCache) < DURACION_CACHE) {
      return cacheEstadisticas;
    }

    var inicio = new Date().getTime();
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ss.getSheetByName('BD-lideres');
    if (!hojaLideres) return { success: false, message: 'Hoja no encontrada' };

    var ultimaFila = hojaLideres.getLastRow();
    var totalLideres = ultimaFila > 1 ? ultimaFila - 1 : 0;

    var datos = ultimaFila > 1 ? hojaLideres.getRange(2, 1, ultimaFila - 1, 41).getValues() : [];

    var contactados = 0, pendientes = 0, noContesta = 0;
    var entidades = {}, comunas = {}, municipios = {};
    var lideresUnicos = {};

    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      var doc = fila[COL.DOCUMENTO] ? String(fila[COL.DOCUMENTO]).trim() : '';
      if (doc && lideresUnicos[doc]) continue;
      if (doc) lideresUnicos[doc] = true;

      var estado = fila[COL.ESTADO_LLAMADA] ? String(fila[COL.ESTADO_LLAMADA]).toLowerCase().trim() : 'pendiente';
      if (estado === 'contactado' || estado === 'llamado') contactados++;
      else if (estado === 'no contesta') noContesta++;
      else pendientes++;

      var ent = fila[COL.ENTIDAD] ? String(fila[COL.ENTIDAD]).trim() : '';
      if (ent) entidades[ent] = (entidades[ent] || 0) + 1;

      var com = fila[COL.COMUNA] ? String(fila[COL.COMUNA]).trim() : '';
      if (com) comunas[com] = (comunas[com] || 0) + 1;

      var mun = fila[COL.MUNICIPIO] ? String(fila[COL.MUNICIPIO]).trim() : '';
      if (mun) municipios[mun] = (municipios[mun] || 0) + 1;
    }

    totalLideres = Object.keys(lideresUnicos).length || totalLideres;

    var totalSimpatizantes = 0;
    var lideresConMeta = 0;
    var conteo = {};
    try {
      var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
      var hojaReg = ssReg.getSheetByName('Registros');
      if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
      if (hojaReg) {
        var datosReg = hojaReg.getDataRange().getValues();
        totalSimpatizantes = datosReg.length - 1;
        for (var r = 1; r < datosReg.length; r++) {
          var idL = datosReg[r][COL_SIMP.LIDER_DOC] ? String(datosReg[r][COL_SIMP.LIDER_DOC]).trim() : '';
          if (idL) conteo[idL] = (conteo[idL] || 0) + 1;
        }
        for (var k in conteo) {
          if (conteo[k] >= 40) lideresConMeta++;
        }
      }
    } catch (e) {}

    var fin = new Date().getTime();

    var resultado = {
      success: true,
      estadisticas: {
        totalLideres: totalLideres,
        totalSimpatizantes: totalSimpatizantes,
        contactados: contactados,
        pendientes: pendientes,
        noContesta: noContesta,
        lideresConMeta: lideresConMeta,
        promedioSimpatizantes: totalLideres > 0 ? Math.round(totalSimpatizantes / totalLideres) : 0,
        porcentajeMeta: totalLideres > 0 ? Math.round((lideresConMeta / totalLideres) * 100) : 0,
        entidades: entidades,
        comunas: comunas,
        municipios: municipios
      },
      tiempoEjecucion: fin - inicio
    };

    cacheEstadisticas = resultado;
    tiempoCache = ahora;
    return resultado;

  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// ACTUALIZAR REGISTRO DE LÍDER — ESCRITURA BATCH
// ================================================================
// ESTRATEGIA: Lee fila actual → modifica en memoria → escribe 1 vez
// Esto reemplaza las 28+ llamadas individuales a setValue() que
// causaban escrituras parciales y filas/columnas extra.
// ================================================================
function actualizarRegistroLlamadaWrapper(datos) {
  try {
    if (!datos || !datos.documento) {
      return { success: false, message: 'Datos incompletos: documento requerido' };
    }

    Logger.log('=== actualizarRegistroLlamadaWrapper ===');
    Logger.log('Documento a buscar: [' + String(datos.documento).trim() + ']');
    Logger.log('Campos recibidos: ' + Object.keys(datos).join(', '));

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    if (!hoja) return { success: false, message: 'Hoja BD-lideres no encontrada' };

    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) return { success: false, message: 'Hoja sin datos' };

    // PASO 1: Buscar fila por documento (solo lee columna E)
    var colDocumentos = hoja.getRange(2, COL.DOCUMENTO + 1, ultimaFila - 1, 1).getValues();
    var docBuscar = String(datos.documento).trim();
    var filaEncontrada = -1;

    for (var i = 0; i < colDocumentos.length; i++) {
      var docHoja = colDocumentos[i][0] ? String(colDocumentos[i][0]).trim() : '';
      if (docHoja === docBuscar) {
        filaEncontrada = i + 2; // fila 1 = encabezado, datos empiezan en fila 2
        break;
      }
    }

    if (filaEncontrada === -1) {
      Logger.log('ERROR: Documento NO encontrado: ' + docBuscar);
      return { success: false, message: 'Líder no encontrado con documento: ' + docBuscar };
    }

    Logger.log('Documento encontrado en fila: ' + filaEncontrada);

    // PASO 2: Leer la fila COMPLETA actual (exactamente 41 columnas)
    var rangoFila = hoja.getRange(filaEncontrada, 1, 1, 41);
    var filaActual = rangoFila.getValues()[0];

    // PASO 3: Modificar SOLO los campos que vienen en el objeto datos
    // Se usa !== undefined para no borrar campos que no se enviaron

    // Datos personales
    if (datos.nombre !== undefined) filaActual[COL.NOMBRE] = datos.nombre;
    if (datos.tipoDocumento !== undefined) filaActual[COL.TIPO_DOC] = datos.tipoDocumento;
    if (datos.fechaNacimiento !== undefined) filaActual[COL.FECHA_NAC] = datos.fechaNacimiento;
    if (datos.celular !== undefined) filaActual[COL.CELULAR] = datos.celular;
    if (datos.correo !== undefined) filaActual[COL.CORREO] = datos.correo;
    if (datos.direccion !== undefined) filaActual[COL.DIRECCION] = datos.direccion;
    if (datos.barrio !== undefined) filaActual[COL.BARRIO] = datos.barrio;

    // Datos laborales
    if (datos.profesion !== undefined) filaActual[COL.PROFESION] = datos.profesion;
    if (datos.entidad !== undefined) filaActual[COL.ENTIDAD] = datos.entidad;
    if (datos.cargo !== undefined) filaActual[COL.CARGO] = datos.cargo;
    if (datos.tipoVinculacion !== undefined) filaActual[COL.VINCULACION] = datos.tipoVinculacion;
    else if (datos.vinculacion !== undefined) filaActual[COL.VINCULACION] = datos.vinculacion;
    if (datos.horarios !== undefined) filaActual[COL.HORARIOS] = datos.horarios;
    if (datos.salario !== undefined) filaActual[COL.SALARIO] = datos.salario;

    // Datos políticos/proyecto
    if (datos.conoceJuanFelipe !== undefined) filaActual[COL.CONOCE_JFA] = datos.conoceJuanFelipe;
    if (datos.liderBarrio !== undefined) filaActual[COL.LIDER_BARRIO] = datos.liderBarrio;
    if (datos.expectativasProyecto !== undefined) filaActual[COL.EXPECTATIVAS] = datos.expectativasProyecto;

    // Datos personales adicionales
    if (datos.estudios !== undefined) filaActual[COL.ESTUDIOS] = datos.estudios;
    if (datos.numeroHijos !== undefined) filaActual[COL.HIJOS] = datos.numeroHijos;
    if (datos.deporte !== undefined) filaActual[COL.DEPORTE] = datos.deporte;
    if (datos.tieneVehiculo !== undefined) filaActual[COL.VEHICULO] = datos.tieneVehiculo;

    // Ubicación
    if (datos.municipio !== undefined) filaActual[COL.MUNICIPIO] = datos.municipio;
    if (datos.comuna !== undefined) filaActual[COL.COMUNA] = datos.comuna;

    // Observaciones
    if (datos.observaciones !== undefined) filaActual[COL.OBSERVACIONES] = datos.observaciones;

    // Datos de llamada/seguimiento
    if (datos.estadoLlamada !== undefined) filaActual[COL.ESTADO_LLAMADA] = datos.estadoLlamada;
    if (datos.fechaLlamada !== undefined) filaActual[COL.FECHA_LLAMADA] = datos.fechaLlamada;
    if (datos.usuarioLlamada !== undefined) filaActual[COL.USUARIO_LLAMADA] = datos.usuarioLlamada;
    if (datos.notasLlamada !== undefined) filaActual[COL.NOTAS_LLAMADA] = datos.notasLlamada;
    if (datos.usuarioModifico !== undefined) filaActual[COL.USUARIO_MODIF] = datos.usuarioModifico;

    // PASO 4: Escribir toda la fila de una sola vez (1 operación)
    rangoFila.setValues([filaActual]);

    Logger.log('Fila ' + filaEncontrada + ' actualizada OK (batch write, 41 columnas)');

    limpiarCache();
    return { success: true, message: 'Registro actualizado correctamente' };

  } catch (error) {
    Logger.log('ERROR actualizarRegistroLlamadaWrapper: ' + error.toString());
    return { success: false, message: 'Error al actualizar: ' + error.toString() };
  }
}


// ================================================================
// AGREGAR NUEVO LÍDER (CON TODOS LOS CAMPOS)
// ================================================================
function agregarNuevoLiderWrapper(datos) {
  try {
    if (!datos || !datos.nombre || !datos.documento) {
      return { success: false, message: 'Nombre y documento son obligatorios' };
    }

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    if (!hoja) return { success: false, message: 'Hoja no encontrada' };

    // Verificar duplicados eficientemente (solo columna documento)
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila > 1) {
      var colDocs = hoja.getRange(2, COL.DOCUMENTO + 1, ultimaFila - 1, 1).getValues();
      var docNuevo = String(datos.documento).trim();
      for (var i = 0; i < colDocs.length; i++) {
        var docEx = colDocs[i][0] ? String(colDocs[i][0]).trim() : '';
        if (docEx === docNuevo) {
          return { success: false, message: 'Ya existe un líder con ese documento' };
        }
      }
    }

    var nuevaFila = [];
    for (var c = 0; c < 41; c++) nuevaFila.push('');

    nuevaFila[COL.TIMESTAMP] = new Date();
    nuevaFila[COL.NOMBRE] = datos.nombre || '';
    nuevaFila[COL.TIPO_DOC] = datos.tipoDocumento || 'CC';
    nuevaFila[COL.DOCUMENTO] = datos.documento || '';
    nuevaFila[COL.CELULAR] = datos.celular || '';
    nuevaFila[COL.DIRECCION] = datos.direccion || '';
    nuevaFila[COL.BARRIO] = datos.barrio || '';
    nuevaFila[COL.CORREO] = datos.correo || '';
    nuevaFila[COL.PROFESION] = datos.profesion || '';
    nuevaFila[COL.ENTIDAD] = datos.entidad || '';
    nuevaFila[COL.CARGO] = datos.cargo || '';
    nuevaFila[COL.VINCULACION] = datos.tipoVinculacion || datos.vinculacion || '';
    nuevaFila[COL.HORARIOS] = datos.horarios || '';
    nuevaFila[COL.SALARIO] = datos.salario || '';
    nuevaFila[COL.CONOCE_JFA] = datos.conoceJuanFelipe || '';
    nuevaFila[COL.LIDER_BARRIO] = datos.liderBarrio || '';
    nuevaFila[COL.EXPECTATIVAS] = datos.expectativasProyecto || '';
    nuevaFila[COL.ESTUDIOS] = datos.estudios || '';
    nuevaFila[COL.HIJOS] = datos.numeroHijos || '';
    nuevaFila[COL.DEPORTE] = datos.deporte || '';
    nuevaFila[COL.VEHICULO] = datos.tieneVehiculo || '';
    nuevaFila[COL.OBSERVACIONES] = datos.observaciones || '';
    nuevaFila[COL.MUNICIPIO] = datos.municipio || '';
    nuevaFila[COL.REFERIDO] = datos.referido || '';
    nuevaFila[COL.ESTADO_LLAMADA] = 'pendiente';
    nuevaFila[COL.COMUNA] = datos.comuna || '';

    if (datos.fechaNacimiento) nuevaFila[COL.FECHA_NAC] = datos.fechaNacimiento;

    hoja.appendRow(nuevaFila);
    limpiarCache();

    return { success: true, message: 'Líder agregado correctamente' };

  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// ELIMINAR LÍDER (CON CASCADA A SIMPATIZANTES)
// ================================================================
function eliminarLiderWrapper(documento) {
  try {
    if (!documento) return { success: false, message: 'Documento requerido' };
    var docBuscar = String(documento).trim();

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    if (!hoja) return { success: false, message: 'Hoja no encontrada' };

    var datos = hoja.getDataRange().getValues();
    var filaEliminar = -1;

    for (var i = datos.length - 1; i >= 1; i--) {
      var docHoja = datos[i][COL.DOCUMENTO] ? String(datos[i][COL.DOCUMENTO]).trim() : '';
      if (docHoja === docBuscar) {
        filaEliminar = i + 1;
        break;
      }
    }

    if (filaEliminar === -1) {
      return { success: false, message: 'Líder no encontrado' };
    }

    hoja.deleteRow(filaEliminar);

    try {
      var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
      var hojaLideres2 = ssReg.getSheetByName('Lideres');
      if (hojaLideres2) {
        var datosL2 = hojaLideres2.getDataRange().getValues();
        for (var j = datosL2.length - 1; j >= 1; j--) {
          var docL2 = datosL2[j][2] ? String(datosL2[j][2]).trim() : '';
          if (docL2 === docBuscar) {
            hojaLideres2.deleteRow(j + 1);
          }
        }
      }
    } catch (e) {}

    limpiarCache();
    return { success: true, message: 'Líder eliminado correctamente' };

  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// DEVOLVER REGISTRO A PENDIENTE (BATCH WRITE)
// ================================================================
function devolverRegistroLlamadaWrapper(documento) {
  try {
    if (!documento) return { success: false, message: 'Documento requerido' };

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) return { success: false, message: 'Hoja sin datos' };

    var colDocs = hoja.getRange(2, COL.DOCUMENTO + 1, ultimaFila - 1, 1).getValues();
    var docBuscar = String(documento).trim();

    for (var i = 0; i < colDocs.length; i++) {
      var docHoja = colDocs[i][0] ? String(colDocs[i][0]).trim() : '';
      if (docHoja === docBuscar) {
        var fila = i + 2;
        var rango = hoja.getRange(fila, 1, 1, 41);
        var filaData = rango.getValues()[0];
        filaData[COL.ESTADO_LLAMADA] = 'pendiente';
        filaData[COL.FECHA_LLAMADA] = '';
        filaData[COL.USUARIO_LLAMADA] = '';
        filaData[COL.NOTAS_LLAMADA] = '';
        rango.setValues([filaData]);
        limpiarCache();
        return { success: true, message: 'Registro devuelto a pendiente' };
      }
    }

    return { success: false, message: 'Líder no encontrado' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// OBTENER TODOS LOS SIMPATIZANTES
// ================================================================
function obtenerTodosSimpatizantes() {
  try {
    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
    if (!hojaReg) return { success: false, message: 'Hoja no encontrada', simpatizantes: [] };

    var datos = hojaReg.getDataRange().getValues();
    var simpatizantes = [];

    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      var nombre = fila[COL_SIMP.NOMBRE] ? String(fila[COL_SIMP.NOMBRE]).trim() : '';
      if (!nombre) continue;

      var fechaReg = '';
      if (fila[COL_SIMP.FECHA_REGISTRO]) {
        try {
          var f = new Date(fila[COL_SIMP.FECHA_REGISTRO]);
          if (!isNaN(f.getTime())) {
            fechaReg = Utilities.formatDate(f, 'America/Bogota', 'dd/MM/yyyy');
          }
        } catch (e) { fechaReg = String(fila[COL_SIMP.FECHA_REGISTRO]); }
      }

      simpatizantes.push({
        nombre: nombre,
        tipoDocumento: fila[COL_SIMP.TIPO_DOC] ? String(fila[COL_SIMP.TIPO_DOC]).trim() : '',
        documento: fila[COL_SIMP.DOCUMENTO] ? String(fila[COL_SIMP.DOCUMENTO]).trim() : '',
        celular: fila[COL_SIMP.CELULAR] ? String(fila[COL_SIMP.CELULAR]).trim() : '',
        direccion: fila[COL_SIMP.DIRECCION] ? String(fila[COL_SIMP.DIRECCION]).trim() : '',
        barrio: fila[COL_SIMP.BARRIO] ? String(fila[COL_SIMP.BARRIO]).trim() : '',
        departamento: fila[COL_SIMP.DEPARTAMENTO] ? String(fila[COL_SIMP.DEPARTAMENTO]).trim() : '',
        municipio: fila[COL_SIMP.MUNICIPIO] ? String(fila[COL_SIMP.MUNICIPIO]).trim() : '',
        haSido: fila[COL_SIMP.HA_SIDO] ? String(fila[COL_SIMP.HA_SIDO]).trim() : '',
        liderDocumento: fila[COL_SIMP.LIDER_DOC] ? String(fila[COL_SIMP.LIDER_DOC]).trim() : '',
        liderNombre: fila[COL_SIMP.LIDER_NOMBRE] ? String(fila[COL_SIMP.LIDER_NOMBRE]).trim() : '',
        fechaRegistro: fechaReg
      });
    }

    return { success: true, simpatizantes: simpatizantes, total: simpatizantes.length };
  } catch (error) {
    return { success: false, message: error.toString(), simpatizantes: [] };
  }
}


// ================================================================
// OBTENER SIMPATIZANTES DE UN LÍDER
// ================================================================
function obtenerSimpatizantesDelLider(documentoLider) {
  try {
    if (!documentoLider) return { success: false, message: 'Documento requerido', simpatizantes: [] };

    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
    if (!hojaReg) return { success: false, message: 'Hoja no encontrada', simpatizantes: [] };

    var datos = hojaReg.getDataRange().getValues();
    var simpatizantes = [];
    var docBuscar = String(documentoLider).trim();

    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      var idLider = fila[COL_SIMP.LIDER_DOC] ? String(fila[COL_SIMP.LIDER_DOC]).trim() : '';

      if (idLider === docBuscar) {
        var fechaReg = '';
        if (fila[COL_SIMP.FECHA_REGISTRO]) {
          try {
            var f = new Date(fila[COL_SIMP.FECHA_REGISTRO]);
            if (!isNaN(f.getTime())) fechaReg = Utilities.formatDate(f, 'America/Bogota', 'dd/MM/yyyy');
          } catch (e) { fechaReg = String(fila[COL_SIMP.FECHA_REGISTRO]); }
        }

        simpatizantes.push({
          nombre: fila[COL_SIMP.NOMBRE] ? String(fila[COL_SIMP.NOMBRE]).trim() : '',
          tipoDocumento: fila[COL_SIMP.TIPO_DOC] ? String(fila[COL_SIMP.TIPO_DOC]).trim() : '',
          documento: fila[COL_SIMP.DOCUMENTO] ? String(fila[COL_SIMP.DOCUMENTO]).trim() : '',
          celular: fila[COL_SIMP.CELULAR] ? String(fila[COL_SIMP.CELULAR]).trim() : '',
          direccion: fila[COL_SIMP.DIRECCION] ? String(fila[COL_SIMP.DIRECCION]).trim() : '',
          barrio: fila[COL_SIMP.BARRIO] ? String(fila[COL_SIMP.BARRIO]).trim() : '',
          departamento: fila[COL_SIMP.DEPARTAMENTO] ? String(fila[COL_SIMP.DEPARTAMENTO]).trim() : '',
          municipio: fila[COL_SIMP.MUNICIPIO] ? String(fila[COL_SIMP.MUNICIPIO]).trim() : '',
          haSido: fila[COL_SIMP.HA_SIDO] ? String(fila[COL_SIMP.HA_SIDO]).trim() : '',
          liderDocumento: idLider,
          liderNombre: fila[COL_SIMP.LIDER_NOMBRE] ? String(fila[COL_SIMP.LIDER_NOMBRE]).trim() : '',
          fechaRegistro: fechaReg
        });
      }
    }

    return { success: true, simpatizantes: simpatizantes, total: simpatizantes.length };
  } catch (error) {
    return { success: false, message: error.toString(), simpatizantes: [] };
  }
}


// ================================================================
// BUSCAR LÍDER OPTIMIZADO
// ================================================================
function buscarLiderOptimizado(termino) {
  try {
    if (!termino || String(termino).trim().length < 2) {
      return { success: false, message: 'Ingrese al menos 2 caracteres' };
    }

    var buscar = String(termino).trim().toUpperCase();
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) return { success: true, resultados: [], total: 0 };

    var datos = hoja.getRange(2, 1, ultimaFila - 1, 41).getValues();

    var resultados = [];
    for (var i = 0; i < datos.length; i++) {
      var nombre = datos[i][COL.NOMBRE] ? String(datos[i][COL.NOMBRE]).toUpperCase() : '';
      var doc = datos[i][COL.DOCUMENTO] ? String(datos[i][COL.DOCUMENTO]) : '';
      var cel = datos[i][COL.CELULAR] ? String(datos[i][COL.CELULAR]) : '';

      if (nombre.indexOf(buscar) !== -1 || doc.indexOf(buscar) !== -1 || cel.indexOf(buscar) !== -1) {
        resultados.push({
          rowIndex: i + 2,
          nombre: datos[i][COL.NOMBRE] ? String(datos[i][COL.NOMBRE]) : '',
          documento: doc,
          celular: cel,
          entidad: datos[i][COL.ENTIDAD] ? String(datos[i][COL.ENTIDAD]) : '',
          municipio: datos[i][COL.MUNICIPIO] ? String(datos[i][COL.MUNICIPIO]) : '',
          comuna: datos[i][COL.COMUNA] ? String(datos[i][COL.COMUNA]) : '',
          estadoLlamada: datos[i][COL.ESTADO_LLAMADA] ? String(datos[i][COL.ESTADO_LLAMADA]) : 'pendiente'
        });
      }
    }

    return { success: true, resultados: resultados, total: resultados.length };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// GENERAR PDF DE SIMPATIZANTES
// ================================================================
function generarPDFSimpatizantes(documentoLider, nombreLider) {
  try {
    var result = obtenerSimpatizantesDelLider(documentoLider);
    if (!result.success || result.simpatizantes.length === 0) {
      return { success: false, message: 'Sin simpatizantes para generar PDF' };
    }

    var html = '<html><head><style>';
    html += 'body{font-family:Arial;font-size:11px;margin:20px;}';
    html += 'h2{color:#D95F0E;border-bottom:2px solid #D95F0E;padding-bottom:5px;}';
    html += 'table{width:100%;border-collapse:collapse;margin-top:10px;}';
    html += 'th{background:#D95F0E;color:white;padding:8px;text-align:left;font-size:10px;}';
    html += 'td{border:1px solid #ddd;padding:6px;font-size:10px;}';
    html += 'tr:nth-child(even){background:#f9f9f9;}';
    html += '.header{text-align:center;margin-bottom:20px;}';
    html += '.info{margin:10px 0;font-size:12px;}';
    html += '</style></head><body>';
    html += '<div class="header"><h2>Simpatizantes - ' + (nombreLider || 'Líder') + '</h2>';
    html += '<p class="info">Documento: ' + documentoLider + ' | Total: ' + result.simpatizantes.length + '</p></div>';
    html += '<table><tr><th>#</th><th>Nombre</th><th>Documento</th><th>Celular</th><th>Municipio</th><th>Barrio</th></tr>';

    for (var i = 0; i < result.simpatizantes.length; i++) {
      var s = result.simpatizantes[i];
      html += '<tr><td>' + (i + 1) + '</td><td>' + s.nombre + '</td><td>' + s.documento + '</td>';
      html += '<td>' + s.celular + '</td><td>' + s.municipio + '</td><td>' + s.barrio + '</td></tr>';
    }

    html += '</table></body></html>';

    var blob = HtmlService.createHtmlOutput(html).getContent();
    var pdf = Utilities.newBlob(blob, 'text/html', 'simpatizantes_' + documentoLider + '.html');

    return { success: true, contenidoHTML: html };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// ENVIAR CORREO CON SIMPATIZANTES
// ================================================================
function enviarCorreoSimpatizantesLider(documentoLider, nombreLider, correoDestino) {
  try {
    if (!correoDestino) return { success: false, message: 'Correo destino requerido' };

    var result = obtenerSimpatizantesDelLider(documentoLider);
    if (!result.success) return result;

    var pdfResult = generarPDFSimpatizantes(documentoLider, nombreLider);
    if (!pdfResult.success) return pdfResult;

    var asunto = 'Listado de Simpatizantes - ' + (nombreLider || documentoLider);
    var cuerpo = 'Adjunto encontrará el listado de ' + result.total + ' simpatizantes registrados.';

    var htmlBlob = Utilities.newBlob(pdfResult.contenidoHTML, 'text/html', 'simpatizantes.html');

    MailApp.sendEmail({
      to: correoDestino,
      subject: asunto,
      body: cuerpo,
      attachments: [htmlBlob]
    });

    return { success: true, message: 'Correo enviado a ' + correoDestino };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// DEPURACIÓN DE DUPLICADOS
// ================================================================
function depurarDuplicadosWrapper(documentoLider) {
  try {
    if (!documentoLider) return { success: false, message: 'Documento requerido' };

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    var datos = hoja.getDataRange().getValues();
    var docBuscar = String(documentoLider).trim();

    var filasConDoc = [];
    for (var i = 1; i < datos.length; i++) {
      var doc = datos[i][COL.DOCUMENTO] ? String(datos[i][COL.DOCUMENTO]).trim() : '';
      if (doc === docBuscar) filasConDoc.push(i + 1);
    }

    if (filasConDoc.length <= 1) {
      return { success: true, message: 'No hay duplicados', eliminados: 0 };
    }

    var eliminados = 0;
    for (var j = filasConDoc.length - 1; j >= 1; j--) {
      hoja.deleteRow(filasConDoc[j]);
      eliminados++;
    }

    limpiarCache();
    return { success: true, message: 'Duplicados eliminados: ' + eliminados, eliminados: eliminados };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// SINCRONIZACIÓN ENTRE HOJAS
// ================================================================
function sincronizarHojasWrapper() {
  try {
    var ssGT = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ssGT.getSheetByName('BD-lideres');
    if (!hojaLideres) return { success: false, message: 'Hoja BD-lideres no encontrada' };

    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaLideresReg = ssReg.getSheetByName('Lideres');

    if (!hojaLideresReg) {
      return { success: false, message: 'Hoja Lideres no encontrada en Registros' };
    }

    var datosGT = hojaLideres.getDataRange().getValues();
    var datosReg = hojaLideresReg.getDataRange().getValues();

    var lideresGT = {};
    for (var i = 1; i < datosGT.length; i++) {
      var doc = datosGT[i][COL.DOCUMENTO] ? String(datosGT[i][COL.DOCUMENTO]).trim() : '';
      if (doc) {
        lideresGT[doc] = {
          nombre: datosGT[i][COL.NOMBRE] ? String(datosGT[i][COL.NOMBRE]) : '',
          celular: datosGT[i][COL.CELULAR] ? String(datosGT[i][COL.CELULAR]) : ''
        };
      }
    }

    var lideresReg = {};
    for (var j = 1; j < datosReg.length; j++) {
      var docR = datosReg[j][2] ? String(datosReg[j][2]).trim() : '';
      if (docR) lideresReg[docR] = true;
    }

    var agregados = 0;
    for (var docKey in lideresGT) {
      if (!lideresReg[docKey]) {
        hojaLideresReg.appendRow([lideresGT[docKey].nombre, '', docKey, lideresGT[docKey].celular]);
        agregados++;
      }
    }

    return {
      success: true,
      message: 'Sincronización completada. Líderes agregados: ' + agregados,
      agregados: agregados,
      totalGT: Object.keys(lideresGT).length,
      totalReg: Object.keys(lideresReg).length
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// ELIMINAR SIMPATIZANTE
// ================================================================
function eliminarSimpatizanteWrapper(documentoSimpatizante, documentoLider) {
  try {
    if (!documentoSimpatizante) return { success: false, message: 'Documento requerido' };

    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
    if (!hojaReg) return { success: false, message: 'Hoja no encontrada' };

    var datos = hojaReg.getDataRange().getValues();
    var docBuscar = String(documentoSimpatizante).trim();

    for (var i = datos.length - 1; i >= 1; i--) {
      var docS = datos[i][COL_SIMP.DOCUMENTO] ? String(datos[i][COL_SIMP.DOCUMENTO]).trim() : '';
      if (docS === docBuscar) {
        hojaReg.deleteRow(i + 1);
        return { success: true, message: 'Simpatizante eliminado' };
      }
    }

    return { success: false, message: 'Simpatizante no encontrado' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// GUARDAR SIMPATIZANTE (nuevo o actualización)
// ================================================================
function guardarSimpatizanteWrapper(datos) {
  try {
    if (!datos || !datos.nombre) return { success: false, message: 'Datos incompletos' };

    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
    if (!hojaReg) return { success: false, message: 'Hoja no encontrada' };

    if (datos.documento) {
      var datosExistentes = hojaReg.getDataRange().getValues();
      var docBuscar = String(datos.documento).trim();

      for (var i = 1; i < datosExistentes.length; i++) {
        var docEx = datosExistentes[i][COL_SIMP.DOCUMENTO] ? String(datosExistentes[i][COL_SIMP.DOCUMENTO]).trim() : '';
        if (docEx === docBuscar) {
          var fila = i + 1;
          hojaReg.getRange(fila, COL_SIMP.NOMBRE + 1).setValue(datos.nombre || '');
          hojaReg.getRange(fila, COL_SIMP.CELULAR + 1).setValue(datos.celular || '');
          hojaReg.getRange(fila, COL_SIMP.DIRECCION + 1).setValue(datos.direccion || '');
          hojaReg.getRange(fila, COL_SIMP.BARRIO + 1).setValue(datos.barrio || '');
          hojaReg.getRange(fila, COL_SIMP.DEPARTAMENTO + 1).setValue(datos.departamento || '');
          hojaReg.getRange(fila, COL_SIMP.MUNICIPIO + 1).setValue(datos.municipio || '');
          return { success: true, message: 'Simpatizante actualizado', accion: 'actualizado' };
        }
      }
    }

    var nuevaFila = [];
    for (var c = 0; c < 22; c++) nuevaFila.push('');

    nuevaFila[COL_SIMP.NOMBRE] = datos.nombre || '';
    nuevaFila[COL_SIMP.TIPO_DOC] = datos.tipoDocumento || '';
    nuevaFila[COL_SIMP.DOCUMENTO] = datos.documento || '';
    nuevaFila[COL_SIMP.CELULAR] = datos.celular || '';
    nuevaFila[COL_SIMP.DIRECCION] = datos.direccion || '';
    nuevaFila[COL_SIMP.BARRIO] = datos.barrio || '';
    nuevaFila[COL_SIMP.DEPARTAMENTO] = datos.departamento || '';
    nuevaFila[COL_SIMP.MUNICIPIO] = datos.municipio || '';
    nuevaFila[COL_SIMP.HA_SIDO] = datos.haSido || '';
    nuevaFila[COL_SIMP.LIDER_DOC] = datos.liderDocumento || '';
    nuevaFila[COL_SIMP.LIDER_NOMBRE] = datos.liderNombre || '';
    nuevaFila[COL_SIMP.FECHA_REGISTRO] = new Date();

    hojaReg.appendRow(nuevaFila);
    return { success: true, message: 'Simpatizante registrado', accion: 'nuevo' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// EJECUTAR DIAGNÓSTICO
// ================================================================
function ejecutarDiagnostico() {
  try {
    var resultado = { spreadsheets: {} };

    try {
      var ss1 = SpreadsheetApp.openById(ID_REGISTROS);
      var hojas1 = ss1.getSheets().map(function(h) { return h.getName(); });
      resultado.spreadsheets.registros = {
        status: 'OK', id: ID_REGISTROS, hojas: hojas1,
        filas: ss1.getSheets()[0].getLastRow()
      };
    } catch (e) {
      resultado.spreadsheets.registros = { status: 'ERROR', message: e.toString() };
    }

    try {
      var ss2 = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
      var hojas2 = ss2.getSheets().map(function(h) { return h.getName(); });
      var hojaLD = ss2.getSheetByName('BD-lideres');
      resultado.spreadsheets.bdLideres = {
        status: 'OK', id: ID_SEGUIMIENTO_GT, hojas: hojas2,
        filas: hojaLD ? hojaLD.getLastRow() : 0,
        columnas: hojaLD ? hojaLD.getLastColumn() : 0
      };
    } catch (e) {
      resultado.spreadsheets.bdLideres = { status: 'ERROR', message: e.toString() };
    }

    return { success: true, diagnostico: resultado };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}