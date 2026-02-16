// ============================================================================
// SimpatizantesAdmin.gs
// MÓDULO INDEPENDIENTE — AUDITORÍA DE SIMPATIZANTES
// ============================================================================

/**
 * Paginación servidor con filtro único + todos los 22 campos (A-V).
 */
function obtenerSimpatizantesPaginadosV2(pagina, porPagina, filtros) {
  try {
    Logger.log('=== SIMPATIZANTES PAGINADOS V2 ===');

    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja Registros no encontrada', simpatizantes: [], total: 0 };

    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) return { success: true, simpatizantes: [], total: 0, pagina: 1, totalPaginas: 1 };

    // SIEMPRE leer 22 columnas (A-V)
    var numCols = 22;
    var ultCol = hoja.getLastColumn();
    if (ultCol < numCols) numCols = ultCol;
    if (numCols < 12) numCols = 12;

    var datos = hoja.getRange(2, 1, ultimaFila - 1, numCols).getValues();
    Logger.log('Filas: ' + datos.length + ' | Cols: ' + numCols);

    // Filtro único
    var f = filtros || {};
    var fBusqueda = f.busqueda ? String(f.busqueda).toUpperCase().trim() : '';
    var fMunicipio = f.municipio ? String(f.municipio).toUpperCase().trim() : '';

    var indices = [];
    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      var nombre = fila[0] ? String(fila[0]).trim() : '';
      var documento = fila[2] ? String(fila[2]).trim() : '';
      if (!nombre && !documento) continue;

      // Filtro búsqueda general (nombre, documento, líder nombre, líder doc)
      if (fBusqueda) {
        var nUp = nombre.toUpperCase();
        var dUp = documento.toUpperCase();
        var lnUp = fila[10] ? String(fila[10]).toUpperCase() : '';
        var ldUp = fila[9] ? String(fila[9]).toUpperCase() : '';
        if (nUp.indexOf(fBusqueda) === -1 &&
            dUp.indexOf(fBusqueda) === -1 &&
            lnUp.indexOf(fBusqueda) === -1 &&
            ldUp.indexOf(fBusqueda) === -1) {
          continue;
        }
      }

      // Filtro municipio
      if (fMunicipio) {
        var mUp = fila[7] ? String(fila[7]).toUpperCase().trim() : '';
        if (mUp.indexOf(fMunicipio) === -1) continue;
      }

      indices.push(i);
    }

    var total = indices.length;
    var pag = pagina || 1;
    var pp = porPagina || 100;
    var totalPaginas = Math.ceil(total / pp) || 1;
    if (pag > totalPaginas) pag = totalPaginas;
    if (pag < 1) pag = 1;
    var inicio = (pag - 1) * pp;
    var fin = Math.min(inicio + pp, total);

    var simpatizantes = [];
    for (var j = inicio; j < fin; j++) {
      var idx = indices[j];
      var r = datos[idx];

      var fechaReg = '';
      if (r[11]) {
        try {
          var fecha = new Date(r[11]);
          if (!isNaN(fecha.getTime())) fechaReg = Utilities.formatDate(fecha, 'America/Bogota', 'dd/MM/yyyy HH:mm');
          else fechaReg = String(r[11]);
        } catch(e) { fechaReg = String(r[11]); }
      }

      var obj = {
        nombre: r[0] ? String(r[0]).trim() : '',
        tipoDocumento: r[1] ? String(r[1]).trim() : '',
        documento: r[2] ? String(r[2]).trim() : '',
        celular: r[3] ? String(r[3]).trim() : '',
        direccion: r[4] ? String(r[4]).trim() : '',
        barrio: r[5] ? String(r[5]).trim() : '',
        departamento: r[6] ? String(r[6]).trim() : '',
        municipio: r[7] ? String(r[7]).trim() : '',
        haSido: r[8] ? String(r[8]).trim() : '',
        liderDocumento: r[9] ? String(r[9]).trim() : '',
        liderNombre: r[10] ? String(r[10]).trim() : '',
        fechaRegistro: fechaReg,
        fila: idx + 2
      };

      // Campos electorales M-V (índices 12-21)
      obj.puestoVotacion = (numCols > 12 && r[12]) ? String(r[12]).trim() : '';
      obj.mesa           = (numCols > 13 && r[13]) ? String(r[13]).trim() : '';
      obj.contesto       = (numCols > 14 && r[14]) ? String(r[14]).trim() : '';
      obj.conoceReferente= (numCols > 15 && r[15]) ? String(r[15]).trim() : '';
      obj.conoceCandidato= (numCols > 16 && r[16]) ? String(r[16]).trim() : '';
      obj.votariaCandidato=(numCols > 17 && r[17]) ? String(r[17]).trim() : '';
      obj.sabeVotar      = (numCols > 18 && r[18]) ? String(r[18]).trim() : '';
      obj.conoceMesaPuesto=(numCols > 19 && r[19]) ? String(r[19]).trim() : '';
      obj.infoWhatsapp   = (numCols > 20 && r[20]) ? String(r[20]).trim() : '';
      obj.listado14Mayo  = (numCols > 21 && r[21]) ? String(r[21]).trim() : '';

      simpatizantes.push(obj);
    }

    Logger.log('Total: ' + total + ' | Pág: ' + pag + '/' + totalPaginas + ' | EnPag: ' + simpatizantes.length);
    if (simpatizantes.length > 0) {
      Logger.log('Ejemplo registro[0] puesto: ' + simpatizantes[0].puestoVotacion + ' mesa: ' + simpatizantes[0].mesa + ' contesto: ' + simpatizantes[0].contesto);
    }

    return { success: true, simpatizantes: simpatizantes, total: total, pagina: pag, totalPaginas: totalPaginas };
  } catch (error) {
    Logger.log('ERROR V2: ' + error.toString());
    return { success: false, message: error.toString(), simpatizantes: [], total: 0 };
  }
}


/**
 * Actualizar simpatizante desde admin. Columnas A-V.
 */
function actualizarSimpatizanteAdmin(datos) {
  try {
    Logger.log('=== ACTUALIZAR SIMPATIZANTE ===');
    if (!datos || !datos.fila) return { success: false, message: 'Fila no especificada' };

    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja Registros no encontrada' };

    var fila = datos.fila;

    // Básicos
    if (datos.nombre !== undefined)    hoja.getRange(fila, 1).setValue(datos.nombre);
    if (datos.celular !== undefined)   hoja.getRange(fila, 4).setValue(datos.celular);
    if (datos.direccion !== undefined) hoja.getRange(fila, 5).setValue(datos.direccion);
    if (datos.barrio !== undefined)    hoja.getRange(fila, 6).setValue(datos.barrio);
    if (datos.municipio !== undefined) hoja.getRange(fila, 8).setValue(datos.municipio);

    // Electorales M-V
    if (datos.puestoVotacion !== undefined)  hoja.getRange(fila, 13).setValue(datos.puestoVotacion);
    if (datos.mesa !== undefined)            hoja.getRange(fila, 14).setValue(datos.mesa);
    if (datos.contesto !== undefined)        hoja.getRange(fila, 15).setValue(datos.contesto);
    if (datos.conoceReferente !== undefined) hoja.getRange(fila, 16).setValue(datos.conoceReferente);
    if (datos.conoceCandidato !== undefined) hoja.getRange(fila, 17).setValue(datos.conoceCandidato);
    if (datos.votariaCandidato !== undefined)hoja.getRange(fila, 18).setValue(datos.votariaCandidato);
    if (datos.sabeVotar !== undefined)       hoja.getRange(fila, 19).setValue(datos.sabeVotar);
    if (datos.conoceMesaPuesto !== undefined)hoja.getRange(fila, 20).setValue(datos.conoceMesaPuesto);
    if (datos.infoWhatsapp !== undefined)    hoja.getRange(fila, 21).setValue(datos.infoWhatsapp);
    if (datos.listado14Mayo !== undefined)   hoja.getRange(fila, 22).setValue(datos.listado14Mayo);

    Logger.log('Actualizado fila ' + fila);
    return { success: true, message: 'Registro actualizado' };
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


/**
 * Exportar simpatizantes para CSV. Límite 15K.
 */
function obtenerSimpatizantesParaExportar(filtroNombre, filtroMunicipio) {
  try {
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    if (!hoja) return { success: false, message: 'Hoja no encontrada', simpatizantes: [] };

    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) return { success: true, simpatizantes: [], total: 0 };

    var datos = hoja.getRange(2, 1, ultimaFila - 1, 12).getValues();
    var fN = filtroNombre ? String(filtroNombre).toUpperCase().trim() : '';
    var fM = filtroMunicipio ? String(filtroMunicipio).toUpperCase().trim() : '';

    var result = [];
    for (var i = 0; i < datos.length; i++) {
      var f = datos[i];
      var nom = f[0] ? String(f[0]).trim() : '';
      var doc = f[2] ? String(f[2]).trim() : '';
      if (!nom && !doc) continue;
      if (fN) {
        var nU = nom.toUpperCase(), dU = doc.toUpperCase(), lU = f[10] ? String(f[10]).toUpperCase() : '', ldU = f[9] ? String(f[9]).toUpperCase() : '';
        if (nU.indexOf(fN) === -1 && dU.indexOf(fN) === -1 && lU.indexOf(fN) === -1 && ldU.indexOf(fN) === -1) continue;
      }
      if (fM) { var mU = f[7] ? String(f[7]).toUpperCase() : ''; if (mU.indexOf(fM) === -1) continue; }
      var fr = '';
      if (f[11]) { try { var d = new Date(f[11]); if (!isNaN(d.getTime())) fr = Utilities.formatDate(d, 'America/Bogota', 'dd/MM/yyyy'); else fr = String(f[11]); } catch(e) { fr = String(f[11]); } }
      result.push({ nombre: nom, documento: doc, celular: f[3] ? String(f[3]).trim() : '', municipio: f[7] ? String(f[7]).trim() : '', barrio: f[5] ? String(f[5]).trim() : '', liderNombre: f[10] ? String(f[10]).trim() : '', fechaRegistro: fr });
      if (result.length >= 15000) break;
    }
    return { success: true, simpatizantes: result, total: result.length };
  } catch (error) {
    return { success: false, message: error.toString(), simpatizantes: [] };
  }
}