// ============================================================================
// ARCHIVO: RegistroV2.gs (ARCHIVO INDEPENDIENTE)
// ============================================================================
// Sistema 40 Caldas - U Caldas
// Mejoras al módulo de Registro de Simpatizantes
// - Validación estricta de líder (no permite crear nuevos)
// - Conteo de simpatizantes por líder
// - Envío de lista de simpatizantes al correo del líder
// Fecha: 2026-02-08
// ============================================================================
// INSTRUCCIONES:
// 1. En Apps Script: "+" → "Script" → Nombrar: RegistroV2
// 2. Pegar TODO este contenido. NO modifica Código.gs
// ============================================================================


// ============================================
// CONFIGURACIÓN
// ============================================
var CFG_REGISTRO_V2_ = {
  ID_LIDERES: '1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo',
  HOJAS_LIDERES: ['BD-lideres', 'Lideres', 'lideres', 'LIDERES'],
  ID_SIMPATIZANTES: '1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s',
  HOJA_SIMPATIZANTES: 'Registros'
};

// Utilidad: convertir valor de celda a string limpio de documento
function docToString_(val) {
  if (val === null || val === undefined || val === '') return '';
  // Si es número, convertir sin notación científica
  if (typeof val === 'number') return String(Math.round(val));
  var s = String(val).trim();
  // Manejar notación científica tipo "1.075215691E9"
  if (s.match(/^\d+\.?\d*[eE]\+?\d+$/)) return String(Math.round(Number(s)));
  // Quitar .0 al final
  if (s.match(/^\d+\.0+$/)) return s.replace(/\.0+$/, '');
  return s;
}


// ============================================
// OBTENER INFO COMPLETA DEL LÍDER
// Búsqueda directa por columna de documento
// Correo: columna J de SEGUIMIENTOS GT (no columna B de Forms)
// ============================================
function obtenerInfoLiderV2(idLider) {
  try {
    if (!idLider || String(idLider).trim().length < 6) {
      return { success: false, encontrado: false, message: 'ID inválido' };
    }
    
    var idBuscar = docToString_(idLider);
    Logger.log('=== BUSCANDO LÍDER: ' + idBuscar + ' ===');
    
    var liderEncontrado = null;
    var ssLideres = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_LIDERES);
    
    // Listar TODAS las hojas disponibles
    var todasHojas = ssLideres.getSheets();
    var nombresHojas = [];
    for (var th = 0; th < todasHojas.length; th++) {
      nombresHojas.push(todasHojas[th].getName());
    }
    Logger.log('Hojas en SS principal: ' + nombresHojas.join(', '));
    
    // =============================================
    // PASO 1: Buscar en TODAS las hojas del SS principal
    // =============================================
    for (var h = 0; h < todasHojas.length; h++) {
      var resultado = buscarLiderEnHoja2_(todasHojas[h], idBuscar);
      if (resultado) {
        liderEncontrado = resultado;
        Logger.log('>>> Encontrado en "' + todasHojas[h].getName() + '": ' + resultado.nombre + ' | Correo: ' + resultado.correo);
        break;
      }
    }
    
    // =============================================
    // PASO 2: Si no está en SS principal, buscar en SS de simpatizantes
    // =============================================
    if (!liderEncontrado) {
      try {
        var ssSimpat = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
        var hojasSimpat = ssSimpat.getSheets();
        for (var hs = 0; hs < hojasSimpat.length; hs++) {
          // Saltar hoja "Registros" (es de simpatizantes, no de líderes)
          if (hojasSimpat[hs].getName() === CFG_REGISTRO_V2_.HOJA_SIMPATIZANTES) continue;
          var resultado2 = buscarLiderEnHoja2_(hojasSimpat[hs], idBuscar);
          if (resultado2) {
            liderEncontrado = resultado2;
            Logger.log('>>> Encontrado en SS2 "' + hojasSimpat[hs].getName() + '": ' + resultado2.nombre);
            break;
          }
        }
      } catch(e2) {
        Logger.log('Error en SS simpatizantes: ' + e2.toString());
      }
    }
    
    if (!liderEncontrado) {
      Logger.log('=== LÍDER NO ENCONTRADO ===');
      return { success: true, encontrado: false };
    }
    
    // =============================================
    // PASO 3: Contar simpatizantes
    // =============================================
    var totalSimpatizantes = 0;
    try {
      var ssSimpat2 = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
      var hojaSimpat = ssSimpat2.getSheetByName(CFG_REGISTRO_V2_.HOJA_SIMPATIZANTES);
      
      if (hojaSimpat && hojaSimpat.getLastRow() >= 2) {
        var encSimpat = hojaSimpat.getRange(1, 1, 1, hojaSimpat.getLastColumn()).getValues()[0];
        
        var colIdLider = -1;
        for (var i = 0; i < encSimpat.length; i++) {
          var enc = encSimpat[i].toString().toLowerCase();
          if (enc.indexOf('lider') >= 0 || enc.indexOf('líder') >= 0) {
            colIdLider = i;
            break;
          }
        }
        
        if (colIdLider >= 0) {
          var datosSimpat = hojaSimpat.getRange(2, colIdLider + 1, hojaSimpat.getLastRow() - 1, 1).getValues();
          for (var s = 0; s < datosSimpat.length; s++) {
            if (docToString_(datosSimpat[s][0]) === idBuscar) {
              totalSimpatizantes++;
            }
          }
        }
      }
    } catch(e) {
      Logger.log('Error contando simpatizantes: ' + e.toString());
    }
    
    liderEncontrado.totalSimpatizantes = totalSimpatizantes;
    liderEncontrado.tieneCorreo = liderEncontrado.correo !== '' && liderEncontrado.correo.indexOf('@') >= 0;
    
    Logger.log('=== RESULTADO: ' + liderEncontrado.nombre + ' | Correo: ' + liderEncontrado.correo + ' (' + liderEncontrado.tieneCorreo + ') | Simpat: ' + totalSimpatizantes + ' ===');
    
    return {
      success: true,
      encontrado: true,
      lider: liderEncontrado
    };
    
  } catch (error) {
    Logger.log('ERROR obtenerInfoLider: ' + error.toString());
    return { success: false, encontrado: false, message: error.toString() };
  }
}


// ============================================
// FUNCIÓN AUXILIAR: Buscar líder en una hoja
// NUNCA ignora un match de documento - siempre retorna resultado
// ============================================
function buscarLiderEnHoja2_(hoja, idBuscar) {
  var ultimaFila = hoja.getLastRow();
  var ultimaCol = hoja.getLastColumn();
  if (ultimaFila < 2 || ultimaCol < 2) return null;
  
  var encabezados = hoja.getRange(1, 1, 1, ultimaCol).getValues()[0];
  
  // Mapear columnas - DOS PASADAS para priorizar correctamente
  var colDoc = -1;
  var colNombre = -1;
  var colCelular = -1;
  var colCorreoReal = -1;
  var colCorreoForms = -1;
  
  // PASADA 1: Buscar columnas con nombres MÁS ESPECÍFICOS
  for (var i = 0; i < encabezados.length; i++) {
    var e = encabezados[i] ? encabezados[i].toString().toLowerCase().replace(/\s+/g, ' ').trim() : '';
    
    // Documento: PREFERIR "numero de documento" o "identidad" (NO "tipo de documento")
    if (colDoc === -1 && (e.indexOf('identidad') >= 0 || (e.indexOf('numero') >= 0 && e.indexOf('documento') >= 0))) {
      colDoc = i;
    }
    // Nombre: buscar "nombre completo" primero
    if (colNombre === -1 && e.indexOf('nombre completo') >= 0) {
      colNombre = i;
    }
    // Celular: preferir "numero de celular"
    if (colCelular === -1 && e.indexOf('celular') >= 0) {
      colCelular = i;
    }
    // Correo: tomar el PRIMER "Correo Electrónico" que NO sea "Dirección de correo"
    if (e.indexOf('correo') >= 0 || e.indexOf('email') >= 0 || e.indexOf('e-mail') >= 0) {
      if (e.indexOf('direcci') >= 0) {
        if (colCorreoForms === -1) colCorreoForms = i; // Solo el primero
      } else {
        if (colCorreoReal === -1) colCorreoReal = i; // Solo el PRIMERO (col J, no col AH)
      }
    }
  }
  
  // PASADA 2: Si no encontró con nombres específicos, buscar genéricos
  if (colDoc === -1) {
    for (var i2 = 0; i2 < encabezados.length; i2++) {
      var e2 = encabezados[i2] ? encabezados[i2].toString().toLowerCase() : '';
      // "documento" pero NO "tipo de documento"
      if (colDoc === -1 && e2.indexOf('documento') >= 0 && e2.indexOf('tipo') === -1) {
        colDoc = i2;
      }
      if (colDoc === -1 && (e2.indexOf('cedula') >= 0 || e2.indexOf('cédula') >= 0)) {
        colDoc = i2;
      }
    }
  }
  if (colNombre === -1) {
    for (var i3 = 0; i3 < encabezados.length; i3++) {
      var e3 = encabezados[i3] ? encabezados[i3].toString().toLowerCase() : '';
      if (colNombre === -1 && e3.indexOf('nombre') >= 0 && e3.indexOf('referido') === -1 && e3.indexOf('lider') === -1 && e3.indexOf('líder') === -1) {
        colNombre = i3;
      }
    }
  }
  if (colCelular === -1) {
    for (var i4 = 0; i4 < encabezados.length; i4++) {
      var e4 = encabezados[i4] ? encabezados[i4].toString().toLowerCase() : '';
      if (colCelular === -1 && (e4.indexOf('telefono') >= 0 || e4.indexOf('teléfono') >= 0)) {
        colCelular = i4;
      }
    }
  }
  
  var colCorreo = colCorreoReal >= 0 ? colCorreoReal : colCorreoForms;
  
  Logger.log('  Hoja "' + hoja.getName() + '" -> doc:' + colDoc + ' nombre:' + colNombre + ' correoR:' + colCorreoReal + ' correoF:' + colCorreoForms + ' cel:' + colCelular);
  
  // Si no hay columna documento por encabezado, intentar buscar el valor en TODAS las columnas
  var columnasBusqueda = [];
  if (colDoc >= 0) {
    columnasBusqueda = [colDoc];
  } else {
    // Fallback: buscar en todas las columnas numéricas
    for (var cb = 0; cb < ultimaCol; cb++) columnasBusqueda.push(cb);
  }
  
  var datos = hoja.getRange(2, 1, ultimaFila - 1, ultimaCol).getValues();
  
  for (var cb2 = 0; cb2 < columnasBusqueda.length; cb2++) {
    var colBuscar = columnasBusqueda[cb2];
    
    for (var f = 0; f < datos.length; f++) {
      if (docToString_(datos[f][colBuscar]) === idBuscar) {
        
        // Encontró el documento — NUNCA ignorar este match
        var nombre = '';
        
        // Intentar nombre por encabezado
        if (colNombre >= 0) {
          nombre = String(datos[f][colNombre]).trim();
        }
        
        // Si nombre vacío/numérico, buscar en otras columnas
        if (!nombre || nombre.match(/^\d+$/) || nombre.match(/^\d{1,2}\//)) {
          for (var cn = 0; cn < ultimaCol; cn++) {
            if (cn === colBuscar) continue;
            var val = String(datos[f][cn]).trim();
            if (val && val.length > 3 && !val.match(/^\d+$/) && !val.match(/^\d{1,2}\//) && !val.match(/@/) && val.indexOf('http') === -1 && val.indexOf('cedula') === -1 && val.indexOf('ciudadan') === -1) {
              nombre = val;
              break;
            }
          }
        }
        
        // ÚLTIMO RECURSO: usar el documento como nombre
        if (!nombre) nombre = 'Líder ' + idBuscar;
        
        var correo = colCorreo >= 0 ? String(datos[f][colCorreo]).trim() : '';
        var celular = colCelular >= 0 ? docToString_(datos[f][colCelular]) : '';
        
        Logger.log('  >>> MATCH fila ' + (f+2) + ' col ' + colBuscar + ': nombre="' + nombre + '" correo="' + correo + '" cel="' + celular + '"');
        
        // Si encontró por columna sin encabezado "documento", verificar que no sea un campo ID Líder de simpatizante
        // (evitar falso positivo en hoja Registros donde el doc aparece como ID del líder)
        if (colDoc === -1) {
          // Verificar que el encabezado de la columna donde encontró NO contiene "lider"/"líder"
          var encCol = encabezados[colBuscar] ? encabezados[colBuscar].toString().toLowerCase() : '';
          if (encCol.indexOf('lider') >= 0 || encCol.indexOf('líder') >= 0) {
            Logger.log('  >>> DESCARTADO: columna es de ID Líder, no documento propio');
            continue;
          }
        }
        
        return {
          nombre: nombre.toUpperCase(),
          documento: idBuscar,
          correo: correo,
          celular: celular,
          filaLider: f + 2
        };
      }
    }
  }
  
  return null;
}


// ============================================
// ENVIAR LISTA DE SIMPATIZANTES POR EMAIL
// ============================================
function enviarListaSimpatizantesV2(idLider) {
  try {
    if (!idLider) {
      return { success: false, message: 'ID de líder requerido' };
    }
    
    var idBuscar = docToString_(idLider);
    
    // 1. Obtener info del líder (nombre y correo)
    var infoResult = obtenerInfoLiderV2(idBuscar);
    if (!infoResult.success || !infoResult.encontrado) {
      return { success: false, message: 'Líder no encontrado' };
    }
    
    var lider = infoResult.lider;
    
    if (!lider.tieneCorreo) {
      return { success: false, message: 'El líder no tiene correo registrado. Contacte la sede para actualizar sus datos.' };
    }
    
    // 2. Obtener lista de simpatizantes
    var ssSimpat = SpreadsheetApp.openById(CFG_REGISTRO_V2_.ID_SIMPATIZANTES);
    var hojaSimpat = ssSimpat.getSheetByName(CFG_REGISTRO_V2_.HOJA_SIMPATIZANTES);
    
    if (!hojaSimpat || hojaSimpat.getLastRow() < 2) {
      return { success: false, message: 'No hay simpatizantes registrados' };
    }
    
    var ultimaFila = hojaSimpat.getLastRow();
    var ultimaCol = hojaSimpat.getLastColumn();
    var encabezados = hojaSimpat.getRange(1, 1, 1, ultimaCol).getValues()[0];
    var datos = hojaSimpat.getRange(2, 1, ultimaFila - 1, ultimaCol).getValues();
    
    // Buscar columnas
    function buscarCol(nombre) {
      var n = nombre.toLowerCase();
      for (var i = 0; i < encabezados.length; i++) {
        if (encabezados[i] && encabezados[i].toString().toLowerCase().indexOf(n) >= 0) return i;
      }
      return -1;
    }
    
    var colNombre = buscarCol('nombre');
    var colDoc = buscarCol('documento');
    if (colDoc === -1) colDoc = buscarCol('cedula');
    var colCelular = buscarCol('celular');
    if (colCelular === -1) colCelular = buscarCol('telefono');
    var colBarrio = buscarCol('barrio');
    var colMunicipio = buscarCol('municipio');
    
    // Buscar columna ID Líder
    var colIdLider = -1;
    for (var i = 0; i < encabezados.length; i++) {
      var enc = encabezados[i].toString().toLowerCase();
      if ((enc.indexOf('id') >= 0 && (enc.indexOf('líder') >= 0 || enc.indexOf('lider') >= 0))) {
        colIdLider = i;
        break;
      }
    }
    
    // Fallback: buscar columna que contenga solo "lider"
    if (colIdLider === -1) {
      for (var i2 = 0; i2 < encabezados.length; i2++) {
        var enc2 = encabezados[i2].toString().toLowerCase();
        if (enc2.indexOf('lider') >= 0 || enc2.indexOf('líder') >= 0) {
          colIdLider = i2;
          break;
        }
      }
    }
    
    if (colIdLider === -1) {
      return { success: false, message: 'No se encontró columna de ID Líder' };
    }
    
    // Filtrar simpatizantes de este líder
    var simpatizantes = [];
    for (var f = 0; f < datos.length; f++) {
      if (docToString_(datos[f][colIdLider]) === idBuscar) {
        simpatizantes.push({
          nombre: colNombre >= 0 ? String(datos[f][colNombre]).trim() : '',
          documento: colDoc >= 0 ? docToString_(datos[f][colDoc]) : '',
          celular: colCelular >= 0 ? docToString_(datos[f][colCelular]) : '',
          barrio: colBarrio >= 0 ? String(datos[f][colBarrio]).trim() : '',
          municipio: colMunicipio >= 0 ? String(datos[f][colMunicipio]).trim() : ''
        });
      }
    }
    
    if (simpatizantes.length === 0) {
      return { success: false, message: 'No se encontraron simpatizantes para este líder' };
    }
    
    // 3. Construir correo HTML
    var fechaHoy = Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');
    
    var html = '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:700px;margin:0 auto;">';
    html += '<div style="background:linear-gradient(90deg,#ff6b00,#ff8c00,#9acd32);padding:25px;border-radius:12px 12px 0 0;color:white;text-align:center;">';
    html += '<h1 style="margin:0;font-size:22px;">📋 Lista de Simpatizantes</h1>';
    html += '<p style="margin:8px 0 0;opacity:0.9;font-size:14px;">Red 40-WilCas • U Caldas</p>';
    html += '</div>';
    
    html += '<div style="background:white;padding:25px;border:1px solid #e0e0e0;">';
    html += '<p style="font-size:15px;color:#333;">Estimado(a) <strong>' + lider.nombre + '</strong>,</p>';
    html += '<p style="font-size:14px;color:#555;">A continuación encontrará la lista de sus <strong>' + simpatizantes.length + '</strong> simpatizantes registrados.</p>';
    html += '<p style="font-size:12px;color:#999;">Generado: ' + fechaHoy + '</p>';
    
    // Tabla
    html += '<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:13px;">';
    html += '<thead><tr style="background:#1a3353;color:white;">';
    html += '<th style="padding:10px 8px;text-align:left;border:1px solid #2d4a6f;">#</th>';
    html += '<th style="padding:10px 8px;text-align:left;border:1px solid #2d4a6f;">Nombre</th>';
    html += '<th style="padding:10px 8px;text-align:left;border:1px solid #2d4a6f;">Documento</th>';
    html += '<th style="padding:10px 8px;text-align:left;border:1px solid #2d4a6f;">Celular</th>';
    html += '<th style="padding:10px 8px;text-align:left;border:1px solid #2d4a6f;">Barrio</th>';
    html += '<th style="padding:10px 8px;text-align:left;border:1px solid #2d4a6f;">Municipio</th>';
    html += '</tr></thead><tbody>';
    
    for (var s = 0; s < simpatizantes.length; s++) {
      var bg = s % 2 === 0 ? '#ffffff' : '#f8f9fa';
      html += '<tr style="background:' + bg + ';">';
      html += '<td style="padding:8px;border:1px solid #e0e0e0;text-align:center;">' + (s + 1) + '</td>';
      html += '<td style="padding:8px;border:1px solid #e0e0e0;font-weight:600;">' + simpatizantes[s].nombre + '</td>';
      html += '<td style="padding:8px;border:1px solid #e0e0e0;">' + simpatizantes[s].documento + '</td>';
      html += '<td style="padding:8px;border:1px solid #e0e0e0;">' + simpatizantes[s].celular + '</td>';
      html += '<td style="padding:8px;border:1px solid #e0e0e0;">' + simpatizantes[s].barrio + '</td>';
      html += '<td style="padding:8px;border:1px solid #e0e0e0;">' + simpatizantes[s].municipio + '</td>';
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    
    // Resumen
    html += '<div style="background:#f0f7ff;border-radius:10px;padding:15px;margin-top:15px;">';
    html += '<p style="margin:0;font-size:14px;color:#1a3353;"><strong>📊 Resumen:</strong> ' + simpatizantes.length + ' simpatizantes registrados</p>';
    html += '</div>';
    
    html += '</div>';
    
    // Footer
    html += '<div style="background:#1a3353;padding:15px;border-radius:0 0 12px 12px;text-align:center;">';
    html += '<p style="margin:0;color:white;font-size:12px;">Desarrollado por <span style="color:#ff8c00;font-weight:600;">Soluciones WilCas</span></p>';
    html += '</div></div>';
    
    // 4. Enviar correo
    MailApp.sendEmail({
      to: lider.correo,
      subject: '📋 Lista de Simpatizantes - ' + lider.nombre + ' (' + simpatizantes.length + ')',
      htmlBody: html
    });
    
    Logger.log('Correo enviado a: ' + lider.correo + ' con ' + simpatizantes.length + ' simpatizantes');
    
    return { 
      success: true, 
      message: 'Lista enviada al correo ' + lider.correo,
      correo: lider.correo,
      totalEnviados: simpatizantes.length
    };
    
  } catch (error) {
    Logger.log('Error enviarListaSimpatizantes: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


// ============================================
// DIAGNÓSTICO: Ejecutar desde Apps Script → Ejecutar → diagnosticarLider
// Cambia el número de documento abajo para probar
// ============================================
function diagnosticarLider() {
  var DOC_PRUEBA = '1075215691'; // <-- Cambiar aquí para probar otro líder
  
  Logger.log('========================================');
  Logger.log('DIAGNÓSTICO PARA DOCUMENTO: ' + DOC_PRUEBA);
  Logger.log('========================================');
  
  // 1. Listar hojas del SS principal
  var ss = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
  var hojas = ss.getSheets();
  Logger.log('\nSS PRINCIPAL - Hojas:');
  for (var i = 0; i < hojas.length; i++) {
    var h = hojas[i];
    var enc = h.getLastRow() >= 1 && h.getLastColumn() >= 1 ? h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0] : [];
    Logger.log('  [' + i + '] "' + h.getName() + '" (' + h.getLastRow() + ' filas) enc: ' + enc.join(' | '));
    
    // Buscar el documento en cada hoja
    if (h.getLastRow() >= 2) {
      var datos = h.getRange(2, 1, h.getLastRow() - 1, h.getLastColumn()).getValues();
      for (var f = 0; f < datos.length; f++) {
        for (var c = 0; c < datos[f].length; c++) {
          if (docToString_(datos[f][c]) === DOC_PRUEBA) {
            Logger.log('    >>> ENCONTRADO en fila ' + (f+2) + ' col ' + c + ' (' + enc[c] + ') = ' + datos[f][c]);
            var filaStr = '';
            for (var fc = 0; fc < Math.min(datos[f].length, 12); fc++) {
              filaStr += enc[fc] + ': "' + String(datos[f][fc]).substring(0, 30) + '" | ';
            }
            Logger.log('    FILA: ' + filaStr);
          }
        }
      }
    }
  }
  
  // 2. Ejecutar la función real
  Logger.log('\n========================================');
  Logger.log('EJECUTANDO obtenerInfoLiderV2...');
  Logger.log('========================================');
  var resultado = obtenerInfoLiderV2(DOC_PRUEBA);
  Logger.log('\nRESULTADO FINAL: ' + JSON.stringify(resultado));
}