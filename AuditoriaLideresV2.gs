// ================================================================
// AuditoriaLideresV2.gs
// ARCHIVO INDEPENDIENTE - Solo funciones NUEVAS
// ================================================================


/**
 * Envía un reporte empresarial por correo al líder con sus datos y simpatizantes.
 * Genera un correo HTML profesional con diseño corporativo 40 Caldas.
 *
 * @param {string} documentoLider - Documento de identidad del líder
 * @param {string} nombreLider - Nombre del líder
 * @param {string} correoDestino - Correo electrónico destino
 * @return {Object} { success: boolean, message: string }
 */
function enviarReporteCorreoLider(documentoLider, nombreLider, correoDestino) {
  try {
    Logger.log('=== enviarReporteCorreoLider ===');
    Logger.log('Doc: ' + documentoLider + ' | Nombre: ' + nombreLider + ' | Correo param: ' + correoDestino);

    // --- Validación documento ---
    if (!documentoLider) {
      return { success: false, message: 'Documento del líder requerido' };
    }

    // Verificar cuota diaria de MailApp
    var cuota = MailApp.getRemainingDailyQuota();
    if (cuota <= 0) {
      return { success: false, message: 'Cuota de correos diaria agotada. Intente mañana.' };
    }

    // --- 1. Obtener datos del líder desde BD-lideres (PRIMERO, para buscar correo si falta) ---
    var liderData = null;
    try {
      var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
      var hoja = ss.getSheetByName('BD-lideres');
      if (hoja) {
        var datos = hoja.getDataRange().getValues();
        var docBuscar = String(documentoLider).trim();
        for (var i = 1; i < datos.length; i++) {
          var docFila = datos[i][COL.DOCUMENTO] ? String(datos[i][COL.DOCUMENTO]).trim() : '';
          if (docFila === docBuscar) {
            liderData = {
              nombre: datos[i][COL.NOMBRE] ? String(datos[i][COL.NOMBRE]).trim() : '',
              documento: docFila,
              tipoDocumento: datos[i][COL.TIPO_DOC] ? String(datos[i][COL.TIPO_DOC]).trim() : 'CC',
              celular: datos[i][COL.CELULAR] ? String(datos[i][COL.CELULAR]).trim() : '',
              correo: datos[i][COL.CORREO] ? String(datos[i][COL.CORREO]).trim() : '',
              direccion: datos[i][COL.DIRECCION] ? String(datos[i][COL.DIRECCION]).trim() : '',
              barrio: datos[i][COL.BARRIO] ? String(datos[i][COL.BARRIO]).trim() : '',
              entidad: datos[i][COL.ENTIDAD] ? String(datos[i][COL.ENTIDAD]).trim() : '',
              cargo: datos[i][COL.CARGO] ? String(datos[i][COL.CARGO]).trim() : '',
              profesion: datos[i][COL.PROFESION] ? String(datos[i][COL.PROFESION]).trim() : '',
              municipio: datos[i][COL.MUNICIPIO] ? String(datos[i][COL.MUNICIPIO]).trim() : '',
              comuna: datos[i][COL.COMUNA] ? String(datos[i][COL.COMUNA]).trim() : '',
              vinculacion: datos[i][COL.VINCULACION] ? String(datos[i][COL.VINCULACION]).trim() : '',
              estadoLlamada: datos[i][COL.ESTADO_LLAMADA] ? String(datos[i][COL.ESTADO_LLAMADA]).trim() : 'pendiente'
            };
            break;
          }
        }
      }
    } catch (e) {
      Logger.log('Error obteniendo datos líder: ' + e.toString());
    }

    // --- 2. Resolver correo: usar parámetro si existe, sino buscar en BD ---
    var correoLimpio = (correoDestino && String(correoDestino).trim() !== '') 
      ? String(correoDestino).trim() 
      : '';

    // Si el parámetro viene vacío, usar el correo encontrado en BD-lideres
    if (!correoLimpio && liderData && liderData.correo) {
      correoLimpio = liderData.correo;
      Logger.log('Correo obtenido de BD-lideres: ' + correoLimpio);
    }

    // Validar que tengamos un correo
    if (!correoLimpio) {
      return { success: false, message: 'Este líder no tiene correo electrónico registrado en la base de datos' };
    }
    if (correoLimpio.indexOf('@') === -1 || correoLimpio.indexOf('.') === -1) {
      return { success: false, message: 'Formato de correo no válido: ' + correoLimpio };
    }

    // Fallback si no se encontró en BD
    if (!liderData) {
      liderData = {
        nombre: nombreLider || '', documento: String(documentoLider).trim(),
        tipoDocumento: 'CC', celular: '', correo: correoLimpio,
        direccion: '', barrio: '', entidad: '', cargo: '', profesion: '',
        municipio: '', comuna: '', vinculacion: '', estadoLlamada: ''
      };
    }

    // --- 3. Obtener simpatizantes (usa función existente de Código.gs) ---
    var simpResult = obtenerSimpatizantesDelLider(documentoLider);
    var simpatizantes = (simpResult && simpResult.success) ? simpResult.simpatizantes : [];

    // --- 4. Fechas ---
    var fechaCorta = Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');
    var fechaLarga = Utilities.formatDate(new Date(), 'America/Bogota', "dd 'de' MMMM 'de' yyyy");

    // --- 5. Construir HTML empresarial ---
    var htmlCorreo = _buildCorreoHTML40Caldas(liderData, simpatizantes, fechaCorta, fechaLarga);

    // --- 6. Asunto ---
    var asunto = 'Reporte de Simpatizantes - ' +
      (liderData.nombre || documentoLider) +
      ' (' + simpatizantes.length + '/40) - Sistema 40 Caldas';

    // --- 7. Enviar ---
    MailApp.sendEmail({
      to: correoLimpio,
      subject: asunto,
      htmlBody: htmlCorreo,
      name: 'Sistema 40 Caldas'
    });

    Logger.log('Correo enviado OK a: ' + correoLimpio + ' (' + simpatizantes.length + ' simpatizantes)');
    return { success: true, message: 'Correo enviado exitosamente a ' + correoLimpio };

  } catch (error) {
    Logger.log('ERROR enviarReporteCorreoLider: ' + error.toString());
    return { success: false, message: 'Error al enviar correo: ' + error.toString() };
  }
}


// ================================================================
// FUNCIONES INTERNAS (prefijo _ para evitar colisiones en namespace)
// ================================================================

/**
 * Construye el HTML empresarial completo para el correo.
 * Diseño corporativo 40 Caldas: naranja #D95F0E, grises profesionales.
 * Compatible con clientes de correo (inline styles, table layout).
 */
function _buildCorreoHTML40Caldas(lider, simpatizantes, fecha, fechaLarga) {
  var metaCumplida = simpatizantes.length >= 40;
  var porcentaje = Math.min(Math.round((simpatizantes.length / 40) * 100), 100);
  var barColor = metaCumplida ? '#0D9488' : '#D95F0E';
  var barBg = metaCumplida ? '#F0FDFA' : '#FFF8F1';

  var h = '<!DOCTYPE html><html><head><meta charset="utf-8">';
  h += '<meta name="viewport" content="width=device-width,initial-scale=1.0">';
  h += '</head><body style="margin:0;padding:0;background:#F1F5F9;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;color:#1E293B;line-height:1.6;-webkit-text-size-adjust:100%;">';

  // Outer wrapper
  h += '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;"><tr><td align="center" style="padding:32px 16px;">';

  // Container
  h += '<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">';

  // ═══ HEADER ═══
  h += '<tr><td style="background:#D95F0E;padding:0;">';
  h += '<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 36px 24px;">';
  h += '<h1 style="color:#FFFFFF;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.3px;">SISTEMA 40 CALDAS</h1>';
  h += '<p style="color:rgba(255,255,255,0.85);font-size:12px;margin:6px 0 0;font-weight:400;">Reporte de Simpatizantes</p>';
  h += '</td><td style="padding:28px 36px 24px;text-align:right;vertical-align:top;">';
  h += '<p style="color:rgba(255,255,255,0.7);font-size:11px;margin:0;">' + fecha + '</p>';
  h += '</td></tr></table>';
  h += '</td></tr>';

  // ═══ BODY ═══
  h += '<tr><td style="padding:32px 36px 16px;">';

  // Saludo
  h += '<p style="font-size:15px;margin:0 0 8px;color:#1E293B;">Estimado(a) <strong style="color:#D95F0E;">' + (lider.nombre || 'L&iacute;der') + '</strong>,</p>';
  h += '<p style="font-size:13px;color:#64748B;margin:0 0 28px;line-height:1.7;">A continuaci&oacute;n encontrar&aacute; el reporte actualizado de sus simpatizantes registrados en el Sistema 40 Caldas.</p>';

  // ═══ CARD PROGRESO META ═══
  h += '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td style="background:' + barBg + ';border:1px solid ' + (metaCumplida ? '#99F6E4' : '#FED7AA') + ';border-radius:12px;padding:24px;">';

  // Número grande + label
  h += '<table width="100%" cellpadding="0" cellspacing="0"><tr>';
  h += '<td style="vertical-align:middle;">';
  h += '<span style="font-size:42px;font-weight:800;color:' + barColor + ';line-height:1;">' + simpatizantes.length + '</span>';
  h += '<span style="font-size:16px;color:#94A3B8;font-weight:400;"> / 40</span>';
  h += '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:' + (metaCumplida ? '#0D9488' : '#B45309') + ';margin:6px 0 0;">' + (metaCumplida ? '&#10003; META CUMPLIDA' : 'FALTAN ' + (40 - simpatizantes.length) + ' SIMPATIZANTES') + '</p>';
  h += '</td>';
  h += '<td style="text-align:right;vertical-align:middle;width:120px;">';
  h += '<span style="font-size:32px;font-weight:800;color:' + barColor + ';">' + porcentaje + '%</span>';
  h += '</td></tr></table>';

  // Barra progreso
  h += '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;"><tr>';
  h += '<td style="background:#E2E8F0;border-radius:10px;height:10px;overflow:hidden;">';
  if (porcentaje > 0) {
    h += '<table width="' + porcentaje + '%" cellpadding="0" cellspacing="0" style="height:10px;"><tr>';
    h += '<td style="background:' + barColor + ';border-radius:10px;"></td>';
    h += '</tr></table>';
  }
  h += '</td></tr></table>';

  h += '</td></tr></table>';

  // ═══ DATOS DEL LÍDER ═══
  h += '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">';
  h += '<tr><td style="padding-bottom:12px;border-bottom:2px solid #FED7AA;">';
  h += '<h3 style="font-size:14px;font-weight:700;color:#D95F0E;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Datos del L&iacute;der</h3>';
  h += '</td></tr></table>';

  h += '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">';
  var datosLider = [
    ['Nombre', lider.nombre], ['Documento', (lider.tipoDocumento || 'CC') + ' ' + lider.documento],
    ['Celular', lider.celular], ['Correo', lider.correo],
    ['Entidad', lider.entidad], ['Cargo', lider.cargo],
    ['Municipio', lider.municipio], ['Comuna', lider.comuna]
  ];
  for (var d = 0; d < datosLider.length; d += 2) {
    h += '<tr>';
    h += _celdaDatoCorreo(datosLider[d][0], datosLider[d][1], d === 0);
    if (d + 1 < datosLider.length) {
      h += _celdaDatoCorreo(datosLider[d+1][0], datosLider[d+1][1], d === 0);
    }
    h += '</tr>';
  }
  h += '</table>';

  // ═══ TABLA SIMPATIZANTES ═══
  h += '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">';
  h += '<tr><td style="padding-bottom:12px;border-bottom:2px solid #FED7AA;">';
  h += '<h3 style="font-size:14px;font-weight:700;color:#D95F0E;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Simpatizantes Registrados (' + simpatizantes.length + ')</h3>';
  h += '</td></tr></table>';

  if (simpatizantes.length > 0) {
    h += '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-top:12px;">';
    h += '<tr>';
    h += '<th style="background:#D95F0E;color:#fff;padding:10px 8px;font-size:9px;font-weight:700;text-align:center;letter-spacing:0.5px;width:28px;">#</th>';
    h += '<th style="background:#D95F0E;color:#fff;padding:10px 8px;font-size:9px;font-weight:700;text-align:left;letter-spacing:0.5px;">NOMBRE</th>';
    h += '<th style="background:#D95F0E;color:#fff;padding:10px 8px;font-size:9px;font-weight:700;text-align:left;letter-spacing:0.5px;">DOCUMENTO</th>';
    h += '<th style="background:#D95F0E;color:#fff;padding:10px 8px;font-size:9px;font-weight:700;text-align:left;letter-spacing:0.5px;">CELULAR</th>';
    h += '<th style="background:#D95F0E;color:#fff;padding:10px 8px;font-size:9px;font-weight:700;text-align:left;letter-spacing:0.5px;">MUNICIPIO</th>';
    h += '<th style="background:#D95F0E;color:#fff;padding:10px 8px;font-size:9px;font-weight:700;text-align:left;letter-spacing:0.5px;">BARRIO</th>';
    h += '</tr>';

    for (var i = 0; i < simpatizantes.length; i++) {
      var s = simpatizantes[i];
      var bg = (i % 2 === 0) ? '#FFFFFF' : '#F8FAFC';
      var bdr = 'border-bottom:1px solid #E2E8F0;';
      h += '<tr style="background:' + bg + ';">';
      h += '<td style="padding:8px;text-align:center;' + bdr + 'font-weight:600;color:#94A3B8;font-size:11px;">' + (i + 1) + '</td>';
      h += '<td style="padding:8px;' + bdr + 'font-weight:600;color:#1E293B;font-size:12px;">' + (s.nombre || '-') + '</td>';
      h += '<td style="padding:8px;' + bdr + 'font-family:Courier New,monospace;font-size:11px;color:#475569;">' + (s.documento || '-') + '</td>';
      h += '<td style="padding:8px;' + bdr + 'color:#475569;font-size:12px;">' + (s.celular || '-') + '</td>';
      h += '<td style="padding:8px;' + bdr + 'color:#475569;font-size:12px;">' + (s.municipio || '-') + '</td>';
      h += '<td style="padding:8px;' + bdr + 'color:#475569;font-size:12px;">' + (s.barrio || '-') + '</td>';
      h += '</tr>';
    }
    h += '</table>';
  } else {
    h += '<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="text-align:center;padding:36px;color:#94A3B8;font-style:italic;font-size:14px;">A&uacute;n no tiene simpatizantes registrados.</td></tr></table>';
  }

  h += '</td></tr>'; // end body

  // ═══ FOOTER ═══
  h += '<tr><td style="padding:0;">';
  h += '<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:3px;background:#D95F0E;"></td></tr></table>';
  h += '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;"><tr><td style="padding:24px 36px;text-align:center;">';
  h += '<p style="color:#F97316;font-weight:700;font-size:13px;margin:0 0 6px;letter-spacing:0.3px;">Sistema 40 Caldas</p>';
  h += '<p style="color:#64748B;font-size:11px;margin:0 0 2px;">Generado el ' + fechaLarga + '</p>';
  h += '<p style="color:#475569;font-size:10px;margin:0;">Este correo fue enviado autom&aacute;ticamente. No responda a este mensaje.</p>';
  h += '</td></tr></table>';
  h += '</td></tr>';

  h += '</table>'; // container
  h += '</td></tr></table>'; // outer
  h += '</body></html>';

  return h;
}


/**
 * Celda de dato para la tabla de info del líder (grid 2 cols)
 */
function _celdaDatoCorreo(label, valor, isFirst) {
  var v = (valor && String(valor).trim() !== '') ? String(valor).trim() : '-';
  var pad = isFirst ? '14px 14px 6px' : '6px 14px';
  return '<td style="padding:' + pad + ';vertical-align:top;width:50%;">' +
    '<span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#94A3B8;">' + label + '</span><br>' +
    '<span style="font-size:13px;color:#1E293B;font-weight:500;">' + v + '</span>' +
  '</td>';
}