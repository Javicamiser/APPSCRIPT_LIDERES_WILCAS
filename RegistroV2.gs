// ================================================================
// REGISTRO V2.GS — BACKEND MÓDULO DE REGISTRO DE SIMPATIZANTES
// Sistema 40 Caldas - Reconstrucción completa
// ================================================================

// ================================================================
// UTILIDAD: Normalizar documento a string limpio
// ================================================================
function docToStringReg_(valor) {
  if (!valor && valor !== 0) return '';
  var s = String(valor).trim();
  // Quitar .0 de números
  if (s.indexOf('.') !== -1 && s.match(/^\d+\.0+$/)) {
    s = s.split('.')[0];
  }
  return s;
}

// ================================================================
// OBTENER LÍDERES (lista ligera para el select del formulario)
// Retorna: [{id, nombre}]
// ================================================================
function obtenerLideres() {
  try {
    Logger.log('=== REGISTRO V2: obtenerLideres() ===');

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    if (!hoja) {
      Logger.log('Hoja BD-lideres no encontrada');
      return [];
    }

    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) return [];

    // Solo leer columnas necesarias: C(Nombre) y E(Documento)
    var datos = hoja.getRange(2, 1, ultimaFila - 1, 5).getValues();
    var lideres = [];
    var yaIncluidos = {};

    for (var i = 0; i < datos.length; i++) {
      var nombre = datos[i][COL.NOMBRE] ? String(datos[i][COL.NOMBRE]).trim() : '';
      var doc = docToStringReg_(datos[i][COL.DOCUMENTO]);

      if (nombre && doc && !yaIncluidos[doc]) {
        yaIncluidos[doc] = true;
        lideres.push({ id: doc, nombre: nombre });
      }
    }

    Logger.log('Líderes cargados: ' + lideres.length);
    return lideres;

  } catch (error) {
    Logger.log('ERROR obtenerLideres: ' + error.toString());
    return [];
  }
}

// ================================================================
// VERIFICAR DOCUMENTO (si ya existe un simpatizante con ese doc)
// Retorna: true si ya existe, false si está disponible
// ================================================================
function verificarDocumentoWrapper(numeroDoc) {
  try {
    Logger.log('=== REGISTRO V2: verificarDocumentoWrapper(' + numeroDoc + ') ===');

    if (!numeroDoc) return false;
    var docBuscar = docToStringReg_(numeroDoc);

    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
    if (!hojaReg) {
      Logger.log('Hoja de registros no encontrada');
      return false;
    }

    var datos = hojaReg.getDataRange().getValues();

    for (var i = 1; i < datos.length; i++) {
      var docHoja = docToStringReg_(datos[i][COL_SIMP.DOCUMENTO]);
      if (docHoja === docBuscar) {
        Logger.log('Documento YA EXISTE en fila ' + (i + 1));
        return true;
      }
    }

    Logger.log('Documento DISPONIBLE');
    return false;

  } catch (error) {
    Logger.log('ERROR verificarDocumentoWrapper: ' + error.toString());
    return false;
  }
}

// ================================================================
// OBTENER INFO COMPLETA DEL LÍDER V2
// Búsqueda en BD-lideres por documento
// Retorna: {success, encontrado, lider: {nombre, documento, celular,
//           totalSimpatizantes, tieneCorreo, correo}}
// ================================================================
function obtenerInfoLiderV2(idLider) {
  try {
    Logger.log('=== REGISTRO V2: obtenerInfoLiderV2(' + idLider + ') ===');

    if (!idLider || String(idLider).trim().length < 6) {
      return { success: false, encontrado: false, message: 'ID inválido' };
    }

    var idBuscar = docToStringReg_(idLider);
    Logger.log('Buscando líder con doc: [' + idBuscar + '] len:' + idBuscar.length);

    // ── PASO 1: Buscar en BD-lideres ──
    var liderEncontrado = null;

    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');

    if (hoja) {
      var ultimaFila = hoja.getLastRow();
      if (ultimaFila > 1) {
        var datos = hoja.getRange(2, 1, ultimaFila - 1, 41).getValues();

        for (var i = 0; i < datos.length; i++) {
          var docHoja = docToStringReg_(datos[i][COL.DOCUMENTO]);

          if (docHoja === idBuscar) {
            liderEncontrado = {
              nombre: datos[i][COL.NOMBRE] ? String(datos[i][COL.NOMBRE]).trim() : '',
              documento: docHoja,
              celular: datos[i][COL.CELULAR] ? String(datos[i][COL.CELULAR]).trim() : '',
              correo: datos[i][COL.CORREO] ? String(datos[i][COL.CORREO]).trim() : ''
            };
            Logger.log('ENCONTRADO en BD-lideres fila ' + (i + 2) + ': ' + liderEncontrado.nombre);
            break;
          }
        }
      }
    }

    // ── PASO 1B: Si no tiene correo, buscar en SEGUIMIENTOS GT ──
    if (liderEncontrado && !liderEncontrado.correo) {
      Logger.log('Correo vacío, buscando en otras hojas...');
      var hojas = ss.getSheets();
      for (var h = 0; h < hojas.length; h++) {
        if (liderEncontrado.correo) break;
        var nombreHoja = hojas[h].getName();
        if (nombreHoja === 'BD-lideres') continue;

        try {
          var ultF = hojas[h].getLastRow();
          var ultC = hojas[h].getLastColumn();
          if (ultF < 2 || ultC < 2) continue;

          var encabezados = hojas[h].getRange(1, 1, 1, ultC).getValues()[0];
          var colCorreo = -1;
          var colDoc = -1;

          for (var c = 0; c < encabezados.length; c++) {
            var enc = encabezados[c] ? String(encabezados[c]).toLowerCase().trim() : '';
            if (enc.indexOf('correo') !== -1 || enc.indexOf('email') !== -1 || enc.indexOf('e-mail') !== -1) {
              colCorreo = c;
            }
            if (enc.indexOf('documento') !== -1 || enc.indexOf('cedula') !== -1 || enc.indexOf('cédula') !== -1) {
              colDoc = c;
            }
          }

          if (colCorreo === -1 || colDoc === -1) continue;

          var datosH = hojas[h].getRange(2, 1, ultF - 1, ultC).getValues();
          for (var r = 0; r < datosH.length; r++) {
            var docR = docToStringReg_(datosH[r][colDoc]);
            if (docR === idBuscar) {
              var correoR = datosH[r][colCorreo] ? String(datosH[r][colCorreo]).trim() : '';
              if (correoR && correoR.indexOf('@') !== -1) {
                liderEncontrado.correo = correoR;
                Logger.log('Correo encontrado en hoja "' + nombreHoja + '": ' + correoR);
                break;
              }
            }
          }
        } catch (e) {
          Logger.log('Error leyendo hoja "' + nombreHoja + '": ' + e.toString());
        }
      }
    }

    // ── PASO 1C: Si aún no encontrado, buscar en hoja Lideres del spreadsheet Registros ──
    if (!liderEncontrado) {
      try {
        var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
        var hojaLideres = ssReg.getSheetByName('Lideres');
        if (hojaLideres) {
          var datosL = hojaLideres.getDataRange().getValues();
          for (var j = 1; j < datosL.length; j++) {
            // Hoja Lideres: col 0=Nombre, col 2=Documento, col 3=Celular
            var docL = docToStringReg_(datosL[j][2]);
            if (docL === idBuscar) {
              liderEncontrado = {
                nombre: datosL[j][0] ? String(datosL[j][0]).trim() : '',
                documento: docL,
                celular: datosL[j][3] ? String(datosL[j][3]).trim() : '',
                correo: ''
              };
              Logger.log('ENCONTRADO en hoja Lideres (Registros): ' + liderEncontrado.nombre);
              break;
            }
          }
        }
      } catch (e) {
        Logger.log('Error buscando en Registros/Lideres: ' + e.toString());
      }
    }

    // ── NO ENCONTRADO ──
    if (!liderEncontrado) {
      Logger.log('LÍDER NO ENCONTRADO: ' + idBuscar);
      return { success: true, encontrado: false };
    }

    // ── PASO 2: Contar simpatizantes ──
    var totalSimpatizantes = 0;
    try {
      var ssReg2 = SpreadsheetApp.openById(ID_REGISTROS);
      var hojaReg = ssReg2.getSheetByName('Registros');
      if (!hojaReg) hojaReg = ssReg2.getSheetByName('Simpatizantes');

      if (hojaReg) {
        var datosReg = hojaReg.getDataRange().getValues();
        for (var k = 1; k < datosReg.length; k++) {
          var idL = docToStringReg_(datosReg[k][COL_SIMP.LIDER_DOC]);
          if (idL === idBuscar) {
            totalSimpatizantes++;
          }
        }
      }
    } catch (e) {
      Logger.log('Error contando simpatizantes: ' + e.toString());
    }

    Logger.log('Total simpatizantes: ' + totalSimpatizantes + ' | Correo: ' + (liderEncontrado.correo || 'VACÍO'));

    return {
      success: true,
      encontrado: true,
      lider: {
        nombre: liderEncontrado.nombre,
        documento: liderEncontrado.documento,
        celular: liderEncontrado.celular,
        correo: liderEncontrado.correo,
        tieneCorreo: !!(liderEncontrado.correo && liderEncontrado.correo.indexOf('@') !== -1),
        totalSimpatizantes: totalSimpatizantes
      }
    };

  } catch (error) {
    Logger.log('ERROR obtenerInfoLiderV2: ' + error.toString());
    return { success: false, encontrado: false, message: error.toString() };
  }
}

// ================================================================
// ENVIAR LISTA DE SIMPATIZANTES POR CORREO V2
// Busca el correo del líder y envía tabla HTML con sus simpatizantes
// ================================================================
function enviarListaSimpatizantesV2(documentoLider) {
  try {
    Logger.log('=== REGISTRO V2: enviarListaSimpatizantesV2(' + documentoLider + ') ===');

    if (!documentoLider) {
      return { success: false, message: 'Documento del líder requerido' };
    }

    var docBuscar = docToStringReg_(documentoLider);

    // Obtener info del líder (incluye correo)
    var infoLider = obtenerInfoLiderV2(docBuscar);
    if (!infoLider.success || !infoLider.encontrado) {
      return { success: false, message: 'Líder no encontrado' };
    }

    var lider = infoLider.lider;
    if (!lider.tieneCorreo || !lider.correo) {
      return { success: false, message: 'El líder no tiene correo electrónico registrado' };
    }

    // Obtener simpatizantes
    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
    if (!hojaReg) {
      return { success: false, message: 'Hoja de registros no encontrada' };
    }

    var datos = hojaReg.getDataRange().getValues();
    var simpatizantes = [];

    for (var i = 1; i < datos.length; i++) {
      var idL = docToStringReg_(datos[i][COL_SIMP.LIDER_DOC]);
      if (idL === docBuscar) {
        simpatizantes.push({
          nombre: datos[i][COL_SIMP.NOMBRE] ? String(datos[i][COL_SIMP.NOMBRE]).trim() : '',
          documento: docToStringReg_(datos[i][COL_SIMP.DOCUMENTO]),
          celular: datos[i][COL_SIMP.CELULAR] ? String(datos[i][COL_SIMP.CELULAR]).trim() : '',
          barrio: datos[i][COL_SIMP.BARRIO] ? String(datos[i][COL_SIMP.BARRIO]).trim() : '',
          municipio: datos[i][COL_SIMP.MUNICIPIO] ? String(datos[i][COL_SIMP.MUNICIPIO]).trim() : ''
        });
      }
    }

    if (simpatizantes.length === 0) {
      return { success: false, message: 'El líder no tiene simpatizantes registrados' };
    }

    // Generar HTML del correo
    var html = '<html><head><style>';
    html += 'body{font-family:"Source Sans 3",Arial,sans-serif;font-size:13px;margin:0;padding:20px;background:#F8FAFC;}';
    html += '.container{max-width:600px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;}';
    html += '.header{background:linear-gradient(135deg,#D95F0E,#F97316);color:white;padding:24px;text-align:center;}';
    html += '.header h2{margin:0;font-size:18px;font-weight:800;}';
    html += '.header p{margin:6px 0 0;font-size:13px;opacity:0.9;}';
    html += '.body-content{padding:20px;}';
    html += '.info{background:#FFF8F1;border:1px solid #FED7AA;border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;}';
    html += 'table{width:100%;border-collapse:collapse;}';
    html += 'th{background:#0F172A;color:white;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;}';
    html += 'td{border-bottom:1px solid #E2E8F0;padding:8px 12px;font-size:12px;}';
    html += 'tr:nth-child(even) td{background:#F8FAFC;}';
    html += '.footer{padding:16px;text-align:center;font-size:11px;color:#94A3B8;border-top:1px solid #E2E8F0;}';
    html += '.footer strong{color:#D95F0E;}';
    html += '</style></head><body>';
    html += '<div class="container">';
    html += '<div class="header"><h2>Listado de Simpatizantes</h2>';
    html += '<p>' + lider.nombre + ' - Doc: ' + lider.documento + '</p></div>';
    html += '<div class="body-content">';
    html += '<div class="info">Total de simpatizantes registrados: <strong>' + simpatizantes.length + '</strong></div>';
    html += '<table><tr><th>#</th><th>Nombre</th><th>Documento</th><th>Celular</th><th>Municipio</th><th>Barrio</th></tr>';

    for (var j = 0; j < simpatizantes.length; j++) {
      var s = simpatizantes[j];
      html += '<tr><td>' + (j + 1) + '</td>';
      html += '<td>' + s.nombre + '</td>';
      html += '<td>' + s.documento + '</td>';
      html += '<td>' + s.celular + '</td>';
      html += '<td>' + s.municipio + '</td>';
      html += '<td>' + s.barrio + '</td></tr>';
    }

    html += '</table></div>';
    html += '<div class="footer">Generado por <strong>Sistema 40 Caldas</strong> - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm') + '</div>';
    html += '</div></body></html>';

    // Enviar correo
    var asunto = '40 Caldas - Lista de Simpatizantes (' + simpatizantes.length + ') - ' + lider.nombre;

    MailApp.sendEmail({
      to: lider.correo,
      subject: asunto,
      htmlBody: html
    });

    Logger.log('Correo enviado a: ' + lider.correo + ' con ' + simpatizantes.length + ' simpatizantes');

    return {
      success: true,
      message: 'Lista enviada al correo ' + lider.correo,
      totalEnviados: simpatizantes.length,
      correoDestino: lider.correo
    };

  } catch (error) {
    Logger.log('ERROR enviarListaSimpatizantesV2: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ================================================================
// GUARDAR REGISTRO DE SIMPATIZANTE (desde formulario público)
// Mapea campos del formulario a columnas de la hoja Registros
// ================================================================
function guardarRegistroWrapper(datos) {
  try {
    Logger.log('=== REGISTRO V2: guardarRegistroWrapper() ===');
    Logger.log('Datos recibidos: ' + JSON.stringify(datos));

    if (!datos) {
      return { success: false, message: 'No se recibieron datos' };
    }

    // Validaciones básicas
    if (!datos.nombreCompleto || !datos.nombreCompleto.trim()) {
      return { success: false, message: 'El nombre es obligatorio' };
    }
    if (!datos.numeroDocumento || !datos.numeroDocumento.trim()) {
      return { success: false, message: 'El documento es obligatorio' };
    }
    if (!datos.idLider || !datos.idLider.trim()) {
      return { success: false, message: 'El ID del líder es obligatorio' };
    }

    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (!hojaReg) hojaReg = ssReg.getSheetByName('Simpatizantes');
    if (!hojaReg) {
      return { success: false, message: 'Hoja de registros no encontrada' };
    }

    // Verificar duplicado
    var docNuevo = docToStringReg_(datos.numeroDocumento);
    var datosExistentes = hojaReg.getDataRange().getValues();

    for (var i = 1; i < datosExistentes.length; i++) {
      var docEx = docToStringReg_(datosExistentes[i][COL_SIMP.DOCUMENTO]);
      if (docEx === docNuevo) {
        return { success: false, message: 'Este documento ya está registrado' };
      }
    }

    // Construir fila de 22 columnas
    var nuevaFila = [];
    for (var c = 0; c < 22; c++) nuevaFila.push('');

    nuevaFila[COL_SIMP.NOMBRE] = datos.nombreCompleto ? datos.nombreCompleto.trim().toUpperCase() : '';
    nuevaFila[COL_SIMP.TIPO_DOC] = datos.tipoDocumento || 'CC';
    nuevaFila[COL_SIMP.DOCUMENTO] = docNuevo;
    nuevaFila[COL_SIMP.CELULAR] = datos.numeroCelular ? datos.numeroCelular.trim() : '';
    nuevaFila[COL_SIMP.DIRECCION] = datos.direccion ? datos.direccion.trim().toUpperCase() : '';
    nuevaFila[COL_SIMP.BARRIO] = datos.barrio ? datos.barrio.trim().toUpperCase() : '';
    nuevaFila[COL_SIMP.DEPARTAMENTO] = datos.departamento || '';
    nuevaFila[COL_SIMP.MUNICIPIO] = datos.municipio || '';
    nuevaFila[COL_SIMP.HA_SIDO] = datos.hasBeenType || '';
    nuevaFila[COL_SIMP.LIDER_DOC] = docToStringReg_(datos.idLider);
    nuevaFila[COL_SIMP.LIDER_NOMBRE] = datos.nombreLider ? datos.nombreLider.trim().toUpperCase() : '';
    nuevaFila[COL_SIMP.FECHA_REGISTRO] = new Date();

    hojaReg.appendRow(nuevaFila);

    Logger.log('Registro guardado: ' + nuevaFila[COL_SIMP.NOMBRE] + ' | Líder: ' + nuevaFila[COL_SIMP.LIDER_DOC]);

    // También registrar al líder en hoja "Lideres" si no existe
    try {
      var hojaLideres = ssReg.getSheetByName('Lideres');
      if (hojaLideres) {
        var datosLideres = hojaLideres.getDataRange().getValues();
        var liderExiste = false;
        var docLider = docToStringReg_(datos.idLider);

        for (var j = 1; j < datosLideres.length; j++) {
          var docLH = docToStringReg_(datosLideres[j][2]);
          if (docLH === docLider) {
            liderExiste = true;
            break;
          }
        }

        if (!liderExiste && datos.nombreLider) {
          hojaLideres.appendRow([
            datos.nombreLider.trim().toUpperCase(),
            '',
            docLider,
            ''
          ]);
          Logger.log('Líder agregado a hoja Lideres: ' + datos.nombreLider);
        }
      }
    } catch (e) {
      Logger.log('Info: No se pudo sincronizar hoja Lideres: ' + e.toString());
    }

    return { success: true, message: 'Registro guardado exitosamente' };

  } catch (error) {
    Logger.log('ERROR guardarRegistroWrapper: ' + error.toString());
    return { success: false, message: 'Error al guardar: ' + error.toString() };
  }
}