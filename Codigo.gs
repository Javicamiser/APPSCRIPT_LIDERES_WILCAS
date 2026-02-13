// ================================================================
// CÓDIGO.GS CONSOLIDADO - SISTEMA 40 CALDAS
// Fecha: Enero 2026
// ================================================================

// ========== CONFIGURACIÓN ==========
var ID_REGISTROS = '1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s';
var ID_SEGUIMIENTO_GT = '1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo';

// Alias para compatibilidad
var ID_ARCHIVO_GT = ID_SEGUIMIENTO_GT;
var ID_SIMPATIZANTES = ID_REGISTROS;
var ID_HOJA_REGISTRO = ID_REGISTROS;

const COLUMNAS_SIMPATIZANTES = {
  NOMBRE: 0, TIPO_DOC: 1, DOCUMENTO: 2, CELULAR: 3,
  DIRECCION: 4, BARRIO: 5, DEPARTAMENTO: 6, MUNICIPIO: 7,
  HA_SIDO: 8, LIDER_DOC: 9, LIDER_NOMBRE: 10, FECHA_REGISTRO: 11,
  // Nuevos campos
  PUESTO_VOTACION: 12, MESA: 13, CONTESTO: 14, CONOCE_REFERENTE: 15,
  CONOCE_CANDIDATO: 16, VOTARIA_CANDIDATO: 17, SABE_VOTAR: 18,
  CONOCE_MESA_PUESTO: 19, INFO_WHATSAPP: 20, LISTADO_14_MAYO: 21
};

// ========== FUNCIÓN PRINCIPAL - SERVIR HTML ==========
function doGet(e) {
  var mode = (e && e.parameter && e.parameter.mode) ? e.parameter.mode : 'menu';
  
  Logger.log('Modo solicitado: ' + mode);
  
  var archivo = 'menu';
  var titulo = '40 Caldas - Red 40-WilCas';
  
  if (mode === 'admin') {
    archivo = 'admin';
    titulo = 'Panel de Administración - 40 Caldas';
  } else if (mode === 'llamadas') {
    archivo = 'llamadas';
    titulo = 'Gestión de Llamadas - 40 Caldas';
  } else if (mode === 'registro') {
    archivo = 'registro';
    titulo = 'Registro de Simpatizantes - 40 Caldas';
  }
  
  // CORREGIDO: Usar createTemplateFromFile para procesar los <?!= include() ?>
  var template = HtmlService.createTemplateFromFile(archivo);
  return template.evaluate()
    .setTitle(titulo)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ========== FUNCIÓN PARA INCLUIR ARCHIVOS HTML ==========
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ========== AUTENTICACIÓN ==========
function verificarCredenciales(usuario, contrasena) {
  try {
    // Credenciales de administrador
    if (usuario === 'admin' && contrasena === 'admin123') {
      return { success: true, rol: 'admin', nombre: 'Administrador' };
    }
    
    // Verificar en hoja de usuarios si existe
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaUsuarios = ss.getSheetByName('Usuarios');
    
    if (hojaUsuarios) {
      var datos = hojaUsuarios.getDataRange().getValues();
      for (var i = 1; i < datos.length; i++) {
        if (datos[i][0] === usuario && datos[i][1] === contrasena) {
          return { 
            success: true, 
            rol: datos[i][2] || 'usuario', 
            nombre: datos[i][3] || usuario 
          };
        }
      }
    }
    
    return { success: false, mensaje: 'Credenciales incorrectas' };
    
  } catch (error) {
    Logger.log('Error en verificarCredenciales: ' + error.toString());
    return { success: false, mensaje: error.toString() };
  }
}

// Función de validación para el panel de administración
function validarCredencialesAdmin(usuario, clave) {
  try {
    const ADMIN_USUARIO = 'Administrador';
    const ADMIN_CLAVE = 'Manizales2026*partido';


    
    if (usuario === ADMIN_USUARIO && clave === ADMIN_CLAVE) {
      return { success: true, message: 'Acceso autorizado' };
    }
    
    // También permitir admin/admin123 como respaldo
    if (usuario === 'admin' && clave === 'admin123') {
      return { success: true, message: 'Acceso autorizado' };
    }
    
    return { success: false, message: 'Usuario o contraseña incorrectos' };
    
  } catch (error) {
    Logger.log('Error validando credenciales admin: ' + error.toString());
    return { success: false, message: 'Error en validación: ' + error.toString() };
  }
}

// ========== OBTENER DATOS DE LLAMADAS (LÍDERES) ==========
function obtenerDatosLlamadasWrapper() {
  try {
    Logger.log('=== OBTENER DATOS LLAMADAS (41 COLUMNAS) ===');
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ss.getSheetByName('BD-lideres');
    
    var resultado = [];
    var lideresYaIncluidos = {};
    
    if (hojaLideres) {
      var ultimaFila = hojaLideres.getLastRow();
      Logger.log('BD-lideres ultima fila: ' + ultimaFila);
      
      if (ultimaFila > 1) {
        // Leer 41 columnas (A hasta AO)
        var datos = hojaLideres.getRange(2, 1, ultimaFila - 1, 41).getValues();
        Logger.log('Filas leidas: ' + datos.length);
        
        for (var i = 0; i < datos.length; i++) {
          var fila = datos[i];
          var doc = fila[4] ? String(fila[4]).trim() : '';
          
          if (!doc) continue;
          
          lideresYaIncluidos[doc] = true;
          
          resultado.push({
            idx: i + 2,
            nombre: fila[2] ? String(fila[2]).trim() : '',            // C(3)
            tipoDocumento: fila[3] ? String(fila[3]).trim() : '',     // D(4)
            documento: doc,                                            // E(5)
            fechaNacimiento: fila[5] || '',                            // F(6)
            celular: fila[6] ? String(fila[6]).trim() : '',           // G(7)
            direccion: fila[7] ? String(fila[7]).trim() : '',         // H(8)
            barrio: fila[8] ? String(fila[8]).trim() : '',            // I(9)
            correo: fila[9] ? String(fila[9]).trim() : '',            // J(10)
            profesion: fila[10] ? String(fila[10]).trim() : '',       // K(11)
            entidad: fila[11] ? String(fila[11]).trim() : '',         // L(12)
            cargo: fila[12] ? String(fila[12]).trim() : '',           // M(13)
            tipoVinculacion: fila[13] ? String(fila[13]).trim() : '', // N(14)
            horarios: fila[14] ? String(fila[14]).trim() : '',        // O(15)
            salario: fila[15] ? String(fila[15]).trim() : '',         // P(16)
            comoSeSiente: fila[16] ? String(fila[16]).trim() : '',    // Q(17)
            conoceJuanFelipe: fila[17] ? String(fila[17]).trim() : '',// R(18)
            liderBarrio: fila[18] ? String(fila[18]).trim() : '',     // S(19)
            expectativasProyecto: fila[19] ? String(fila[19]).trim() : '', // T(20)
            estudios: fila[20] ? String(fila[20]).trim() : '',        // U(21)
            numeroHijos: fila[21] ? String(fila[21]).trim() : '',     // V(22)
            deporte: fila[23] ? String(fila[23]).trim() : '',         // X(24)
            tieneVehiculo: fila[24] ? String(fila[24]).trim() : '',   // Y(25)
            observaciones: fila[26] ? String(fila[26]).trim() : '',   // AA(27)
            nombreReferido: fila[27] ? String(fila[27]).trim() : '',  // AB(28)
            municipio: fila[28] ? String(fila[28]).trim() : '',       // AC(29)
            numeroNinos: fila[29] ? String(fila[29]).trim() : '',     // AD(30)
            numeroNinas: fila[30] ? String(fila[30]).trim() : '',     // AE(31)
            tipoVehiculo: fila[31] ? String(fila[31]).trim() : '',    // AF(32)
            placaVehiculo: fila[32] ? String(fila[32]).trim() : '',   // AG(33)
            liderNoListado: fila[34] ? String(fila[34]).trim() : '',  // AI(35)
            estadoLlamada: fila[35] ? String(fila[35]).trim() : 'pendiente', // AJ(36)
            fechaLlamada: fila[36] || '',                              // AK(37)
            usuarioLlamada: fila[37] ? String(fila[37]).trim() : '',  // AL(38)
            notasLlamada: fila[38] ? String(fila[38]).trim() : '',    // AM(39)
            usuarioModifico: fila[39] ? String(fila[39]).trim() : '', // AN(40)
            comuna: fila[40] ? String(fila[40]).trim() : '',          // AO(41) ← COMUNA
            cantidadSimpatizantes: 0,
            metaCumplida: false,
            origen: 'BD-lideres'
          });
        }
      }
    }
    
    // ========== CONTAR SIMPATIZANTES ==========
    var conteoSimpatizantes = {};
    try {
      var ssRegistro = SpreadsheetApp.openById(ID_HOJA_REGISTRO);
      var hojaRegistro = ssRegistro.getSheetByName('Registros');
      
      if (hojaRegistro && hojaRegistro.getLastRow() > 1) {
        var datosReg = hojaRegistro.getRange(2, 1, hojaRegistro.getLastRow() - 1, 2).getValues();
        for (var j = 0; j < datosReg.length; j++) {
          var docLider = datosReg[j][0] ? String(datosReg[j][0]).trim() : '';
          if (docLider) {
            conteoSimpatizantes[docLider] = (conteoSimpatizantes[docLider] || 0) + 1;
          }
        }
      }
    } catch(e) {
      Logger.log('Error contando simpatizantes: ' + e.toString());
    }
    
    // Asignar conteo
    for (var k = 0; k < resultado.length; k++) {
      var docL = resultado[k].documento;
      resultado[k].cantidadSimpatizantes = conteoSimpatizantes[docL] || 0;
      resultado[k].metaCumplida = resultado[k].cantidadSimpatizantes >= 40;
    }
    
    // ========== AGREGAR LÍDERES SOLO EN REGISTROS ==========
    try {
      var ssRegistro2 = SpreadsheetApp.openById(ID_HOJA_REGISTRO);
      var hojaRegistro2 = ssRegistro2.getSheetByName('Registros');
      
      if (hojaRegistro2 && hojaRegistro2.getLastRow() > 1) {
        var datosReg2 = hojaRegistro2.getRange(2, 1, hojaRegistro2.getLastRow() - 1, 2).getValues();
        
        for (var m = 0; m < datosReg2.length; m++) {
          var docLider2 = datosReg2[m][0] ? String(datosReg2[m][0]).trim() : '';
          var nombreLider2 = datosReg2[m][1] ? String(datosReg2[m][1]).trim() : '';
          
          if (docLider2 && !lideresYaIncluidos[docLider2]) {
            lideresYaIncluidos[docLider2] = true;
            var cantSimp = conteoSimpatizantes[docLider2] || 0;
            
            resultado.push({
              nombre: nombreLider2,
              tipoDocumento: 'CC',
              documento: docLider2,
              fechaNacimiento: '',
              celular: '',
              direccion: '',
              barrio: '',
              correo: '',
              profesion: '',
              entidad: 'Registros',
              cargo: '',
              tipoVinculacion: '',
              horarios: '',
              salario: '',
              comoSeSiente: '',
              conoceJuanFelipe: '',
              liderBarrio: '',
              expectativasProyecto: '',
              estudios: '',
              numeroHijos: '',
              deporte: '',
              tieneVehiculo: '',
              observaciones: '',
              nombreReferido: '',
              municipio: '',
              numeroNinos: '',
              numeroNinas: '',
              tipoVehiculo: '',
              placaVehiculo: '',
              liderNoListado: '',
              estadoLlamada: 'pendiente',
              fechaLlamada: '',
              usuarioLlamada: '',
              notasLlamada: '',
              usuarioModifico: '',
              comuna: '',
              cantidadSimpatizantes: cantSimp,
              metaCumplida: cantSimp >= 40,
              origen: 'Registros'
            });
          }
        }
      }
    } catch(e) {
      Logger.log('Error procesando Registros: ' + e.toString());
    }
    
    Logger.log('Total registros: ' + resultado.length);
    
    return {
      success: true,
      datos: resultado,
      total: resultado.length
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), datos: [] };
  }
}


// ========== ELIMINAR LÍDER ==========
function eliminarLiderWrapper(documento) {
  try {
    Logger.log('=== ELIMINAR LÍDER ===');
    Logger.log('Documento a eliminar: ' + documento);
    
    if (!documento) {
      return { success: false, message: 'Documento no proporcionado' };
    }
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var datos = hoja.getDataRange().getValues();
    var filaEliminar = -1;
    
    // Buscar el documento en la columna E (índice 4)
    for (var i = 1; i < datos.length; i++) {
      var docFila = datos[i][4] ? String(datos[i][4]).trim() : '';
      if (docFila === String(documento).trim()) {
        filaEliminar = i + 1;
        Logger.log('Encontrado en fila: ' + filaEliminar);
        break;
      }
    }
    
    if (filaEliminar === -1) {
      Logger.log('Documento no encontrado');
      return { success: false, message: 'Líder no encontrado con documento: ' + documento };
    }
    
    hoja.deleteRow(filaEliminar);
    Logger.log('Fila eliminada exitosamente');
    
    return { 
      success: true, 
      message: 'Líder eliminado correctamente',
      filaEliminada: filaEliminar
    };
    
  } catch (error) {
    Logger.log('ERROR al eliminar: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ========== ELIMINAR REGISTRO POR ÍNDICE ==========
function eliminarRegistroLlamadaWrapper(idx) {
  try {
    Logger.log('=== ELIMINAR REGISTRO POR ÍNDICE ===');
    Logger.log('Índice: ' + idx);
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja no encontrada' };
    }
    
    hoja.deleteRow(parseInt(idx));
    Logger.log('Registro eliminado');
    
    return { success: true, message: 'Registro eliminado' };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ========== AGREGAR NUEVO LÍDER ==========
function agregarNuevoLiderWrapper(datos) {
  try {
    Logger.log('=== AGREGAR NUEVO LÍDER (41 COLUMNAS) ===');
    Logger.log('Nombre: ' + datos.nombre);
    Logger.log('Documento: ' + datos.documento);
    
    if (!datos.nombre || !datos.documento) {
      return { success: false, message: 'Nombre y documento son obligatorios' };
    }
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    // Verificar duplicado
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila > 1) {
      var documentos = hoja.getRange(2, 5, ultimaFila - 1, 1).getValues();
      for (var i = 0; i < documentos.length; i++) {
        if (String(documentos[i][0]).trim() === String(datos.documento).trim()) {
          return { success: false, message: 'Ya existe un líder con documento ' + datos.documento };
        }
      }
    }
    
    // Construir fila de 41 columnas (A hasta AO)
    var nuevaFila = [
      Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm'), // A(1): Marca temporal
      datos.correo || '',                    // B(2): Correo formulario
      datos.nombre || '',                    // C(3): Nombre
      datos.tipoDocumento || 'CC',           // D(4): Tipo Documento
      datos.documento || '',                 // E(5): Documento
      datos.fechaNacimiento || '',           // F(6): Fecha Nacimiento
      datos.celular || '',                   // G(7): Celular
      datos.direccion || '',                 // H(8): Dirección
      datos.barrio || '',                    // I(9): Barrio
      datos.correo || '',                    // J(10): Correo
      datos.profesion || '',                 // K(11): Profesión
      datos.entidad || '',                   // L(12): Entidad
      datos.cargo || '',                     // M(13): Cargo
      datos.tipoVinculacion || '',           // N(14): Tipo Vinculación
      datos.horarios || '',                  // O(15): Horarios
      datos.salario || '',                   // P(16): Salario
      datos.comoSeSiente || '',              // Q(17): Como se Siente
      datos.conoceJuanFelipe || '',          // R(18): Conoce JF
      datos.liderBarrio || '',               // S(19): Líder Barrio
      datos.expectativas || '',              // T(20): Expectativas
      datos.estudios || '',                  // U(21): Estudios
      datos.numeroHijos || '',               // V(22): Num Hijos
      '',                                    // W(23): Num Hijos [dup]
      datos.deporte || '',                   // X(24): Deporte
      datos.tieneVehiculo || '',             // Y(25): Tiene Vehículo
      '',                                    // Z(26): Fotografía
      datos.observaciones || '',             // AA(27): Observaciones
      datos.nombreReferido || '',            // AB(28): Referido
      datos.municipio || '',                 // AC(29): Municipio
      datos.numeroNinos || '',               // AD(30): Num Niños
      datos.numeroNinas || '',               // AE(31): Num Niñas
      datos.tipoVehiculo || '',              // AF(32): Tipo Vehículo
      datos.placaVehiculo || '',             // AG(33): Placa
      '',                                    // AH(34): Correo [dup]
      datos.liderNoListado || '',            // AI(35): Líder No Listado
      'pendiente',                           // AJ(36): Estado Llamada
      '',                                    // AK(37): Fecha Llamada
      '',                                    // AL(38): Usuario Llamada
      '',                                    // AM(39): Notas Llamada
      'ADMIN - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm'), // AN(40): Usuario Modificación
      datos.comuna || ''                     // AO(41): Comuna ← ÚLTIMA
    ];
    
    hoja.appendRow(nuevaFila);
    
    Logger.log('✅ Líder agregado. Comuna: ' + (datos.comuna || '(vacío)'));
    
    return { 
      success: true, 
      message: 'Líder agregado correctamente',
      documento: datos.documento,
      nombre: datos.nombre
    };
    
  } catch (error) {
    Logger.log('ERROR al agregar: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


// ========== ACTUALIZAR REGISTRO DE LLAMADA ==========
function actualizarRegistroLlamadaWrapper(datos) {
  try {
    Logger.log('=== ACTUALIZAR REGISTRO (41 COLUMNAS) ===');
    Logger.log('RowIndex: ' + datos.rowIndex);
    
    if (!datos || !datos.rowIndex) {
      return { success: false, message: 'Índice de fila no proporcionado' };
    }
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var rowIndex = parseInt(datos.rowIndex);
    
    // ========== DATOS PERSONALES ==========
    if (datos.nombre !== undefined) hoja.getRange(rowIndex, 3).setValue(datos.nombre);               // C
    if (datos.tipoDocumento !== undefined) hoja.getRange(rowIndex, 4).setValue(datos.tipoDocumento); // D
    if (datos.documento !== undefined) hoja.getRange(rowIndex, 5).setValue(datos.documento);         // E
    if (datos.fechaNacimiento !== undefined) hoja.getRange(rowIndex, 6).setValue(datos.fechaNacimiento); // F
    if (datos.celular !== undefined) hoja.getRange(rowIndex, 7).setValue(datos.celular);             // G
    if (datos.direccion !== undefined) hoja.getRange(rowIndex, 8).setValue(datos.direccion);         // H
    if (datos.barrio !== undefined) hoja.getRange(rowIndex, 9).setValue(datos.barrio);               // I
    if (datos.correo !== undefined) hoja.getRange(rowIndex, 10).setValue(datos.correo);              // J
    
    // ========== DATOS LABORALES ==========
    if (datos.profesion !== undefined) hoja.getRange(rowIndex, 11).setValue(datos.profesion);         // K
    if (datos.entidad !== undefined) hoja.getRange(rowIndex, 12).setValue(datos.entidad);             // L
    if (datos.cargo !== undefined) hoja.getRange(rowIndex, 13).setValue(datos.cargo);                 // M
    if (datos.tipoVinculacion !== undefined) hoja.getRange(rowIndex, 14).setValue(datos.tipoVinculacion); // N
    if (datos.horarios !== undefined) hoja.getRange(rowIndex, 15).setValue(datos.horarios);           // O
    if (datos.salario !== undefined) hoja.getRange(rowIndex, 16).setValue(datos.salario);             // P
    if (datos.comoSeSiente !== undefined) hoja.getRange(rowIndex, 17).setValue(datos.comoSeSiente);   // Q
    if (datos.conoceJuanFelipe !== undefined) hoja.getRange(rowIndex, 18).setValue(datos.conoceJuanFelipe); // R
    if (datos.liderBarrio !== undefined) hoja.getRange(rowIndex, 19).setValue(datos.liderBarrio);     // S
    if (datos.expectativas !== undefined) hoja.getRange(rowIndex, 20).setValue(datos.expectativas);   // T
    if (datos.estudios !== undefined) hoja.getRange(rowIndex, 21).setValue(datos.estudios);           // U
    if (datos.numeroHijos !== undefined) hoja.getRange(rowIndex, 22).setValue(datos.numeroHijos);     // V
    if (datos.deporte !== undefined) hoja.getRange(rowIndex, 24).setValue(datos.deporte);             // X
    if (datos.tieneVehiculo !== undefined) hoja.getRange(rowIndex, 25).setValue(datos.tieneVehiculo); // Y
    
    // ========== OTROS DATOS ==========
    if (datos.observaciones !== undefined) hoja.getRange(rowIndex, 27).setValue(datos.observaciones); // AA
    if (datos.nombreReferido !== undefined) hoja.getRange(rowIndex, 28).setValue(datos.nombreReferido); // AB
    if (datos.municipio !== undefined) hoja.getRange(rowIndex, 29).setValue(datos.municipio);         // AC
    if (datos.numeroNinos !== undefined) hoja.getRange(rowIndex, 30).setValue(datos.numeroNinos);     // AD
    if (datos.numeroNinas !== undefined) hoja.getRange(rowIndex, 31).setValue(datos.numeroNinas);     // AE
    if (datos.tipoVehiculo !== undefined) hoja.getRange(rowIndex, 32).setValue(datos.tipoVehiculo);   // AF
    if (datos.placaVehiculo !== undefined) hoja.getRange(rowIndex, 33).setValue(datos.placaVehiculo); // AG
    if (datos.liderNoListado !== undefined) hoja.getRange(rowIndex, 35).setValue(datos.liderNoListado); // AI
    
    // ========== AUDITORÍA DE LLAMADAS ==========
    if (datos.estadoLlamada !== undefined) hoja.getRange(rowIndex, 36).setValue(datos.estadoLlamada); // AJ
    if (datos.fechaLlamada !== undefined) hoja.getRange(rowIndex, 37).setValue(datos.fechaLlamada);   // AK
    if (datos.usuarioLlamada !== undefined) hoja.getRange(rowIndex, 38).setValue(datos.usuarioLlamada); // AL
    if (datos.notasLlamada !== undefined) hoja.getRange(rowIndex, 39).setValue(datos.notasLlamada);   // AM
    
    // ========== COLUMNA 40 (AN) = USUARIO MODIFICACIÓN ==========
    var infoModificacion = '';
    if (datos.usuarioModifico) {
      infoModificacion = datos.usuarioModifico;
      if (datos.fechaModificacion) {
        infoModificacion += ' - ' + datos.fechaModificacion;
      }
    }
    if (infoModificacion) {
      hoja.getRange(rowIndex, 40).setValue(infoModificacion);  // AN(40)
    }
    
    // ========== COLUMNA 41 (AO) = COMUNA ==========
    if (datos.comuna !== undefined) {
      hoja.getRange(rowIndex, 41).setValue(datos.comuna);      // AO(41) ← COMUNA
    }
    
    Logger.log('✅ Registro actualizado fila: ' + rowIndex);
    Logger.log('   Usuario Mod → col 40: ' + infoModificacion);
    Logger.log('   Comuna → col 41: ' + (datos.comuna || '(sin cambio)'));
    
    return { success: true, message: 'Registro actualizado correctamente' };
    
  } catch (error) {
    Logger.log('ERROR al actualizar: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


// ========== DEVOLVER REGISTRO A PENDIENTE ==========
function devolverRegistroLlamadaWrapper(datos) {
  try {
    Logger.log('=== DEVOLVER A PENDIENTE ===');
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    var rowIndex = parseInt(datos.rowIndex);
    
    hoja.getRange(rowIndex, 36).setValue('pendiente');
    hoja.getRange(rowIndex, 37).setValue('');
    hoja.getRange(rowIndex, 38).setValue('');
    hoja.getRange(rowIndex, 39).setValue(datos.notasLlamada || '');
    // ★ CORREGIDO: Usuario+fecha combinados en col 40 (AN), col 41 (AO) = Comuna NO se toca
    hoja.getRange(rowIndex, 40).setValue('ADMIN - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm'));
    
    return { success: true, message: 'Registro devuelto a pendiente' };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ========== OBTENER ESTADÍSTICAS OPTIMIZADAS ==========
function obtenerEstadisticasOptimizadas() {
  try {
    Logger.log('=== ESTADÍSTICAS CON SIMPATIZANTES REALES ===');
    var inicio = new Date().getTime();
    
    // 1. Obtener líderes de Seguimiento GT
    var ssLideres = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ssLideres.getSheetByName('BD-lideres');
    
    if (!hojaLideres) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var datosLideres = hojaLideres.getDataRange().getValues();
    var totalLideres = datosLideres.length - 1;
    
    // 2. Obtener simpatizantes de Registros
    var ssRegistros = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaRegistros = ssRegistros.getSheetByName('Registros');
    
    var totalSimpatizantes = 0;
    var conteoSimpatizantes = {};
    
    if (hojaRegistros) {
      var datosRegistros = hojaRegistros.getDataRange().getValues();
      totalSimpatizantes = datosRegistros.length - 1;
      
      // Contar por líder (columna J = índice 9)
      for (var i = 1; i < datosRegistros.length; i++) {
        var idLider = datosRegistros[i][9] ? String(datosRegistros[i][9]).trim() : '';
        if (idLider && idLider !== '') {
          if (!conteoSimpatizantes[idLider]) {
            conteoSimpatizantes[idLider] = 0;
          }
          conteoSimpatizantes[idLider]++;
        }
      }
    }
    
    // 3. Calcular estadísticas por líder
    var estadisticas = [];
    var lideresConMeta = 0;
    var lideresAtencion = 0;
    var lideresCriticos = 0;
    var lideresBuenos = 0;
    
    for (var i = 1; i < datosLideres.length; i++) {
      var fila = datosLideres[i];
      var documento = fila[4] ? String(fila[4]).trim() : '';
      var nombre = fila[2] ? String(fila[2]).trim() : '';
      var entidad = fila[11] ? String(fila[11]).trim() : '';
      
      if (documento || nombre) {
        var simpatizantes = conteoSimpatizantes[documento] || 0;
        var porcentaje = Math.round((simpatizantes / 40) * 100);
        var clasificacion = '';
        var mensaje = '';
        var estado = '';
        
        if (simpatizantes >= 40) {
          clasificacion = 'excelente';
          mensaje = '✅ Meta cumplida';
          estado = 'success';
          lideresConMeta++;
        } else if (simpatizantes >= 30) {
          clasificacion = 'bueno';
          mensaje = '📈 Buen avance';
          estado = 'info';
          lideresBuenos++;
        } else if (simpatizantes >= 15) {
          clasificacion = 'atencion';
          mensaje = '⚠️ Requiere atención';
          estado = 'warning';
          lideresAtencion++;
        } else {
          clasificacion = 'critico';
          mensaje = '🚨 Estado crítico';
          estado = 'danger';
          lideresCriticos++;
        }
        
        estadisticas.push({
          id: documento,
          nombre: nombre,
          entidad: entidad,
          simpatizantes: simpatizantes,
          porcentaje: porcentaje,
          faltan: Math.max(0, 40 - simpatizantes),
          clasificacion: clasificacion,
          mensaje: mensaje,
          estado: estado
        });
      }
    }
    
    // Ordenar por simpatizantes descendente
    estadisticas.sort(function(a, b) {
      return b.simpatizantes - a.simpatizantes;
    });
    
    var fin = new Date().getTime();
    
    return {
      success: true,
      estadisticas: estadisticas,
      resumen: {
        totalLideres: totalLideres,
        totalSimpatizantes: totalSimpatizantes,
        lideresConMeta: lideresConMeta,
        lideresBuenos: lideresBuenos,
        lideresAtencion: lideresAtencion,
        lideresCriticos: lideresCriticos,
        porcentajeAvance: totalLideres > 0 ? Math.round((lideresConMeta / totalLideres) * 100) : 0
      },
      tiempoEjecucion: fin - inicio
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ========== OBTENER TODOS LOS SIMPATIZANTES ==========
function obtenerTodosSimpatizantes() {
  try {
    Logger.log('=== OBTENER TODOS SIMPATIZANTES ===');
    
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      Logger.log('ERROR: Hoja Registros no encontrada');
      return { success: false, message: 'No se encontró la hoja Registros', simpatizantes: [] };
    }
    
    var datos = hoja.getDataRange().getValues();
    Logger.log('Filas encontradas: ' + datos.length);
    
    if (datos.length <= 1) {
      return { success: true, simpatizantes: [], total: 0 };
    }
    
    var simpatizantes = [];
    
    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      
      // Saltar filas vacías
      if (!fila[COLUMNAS_SIMPATIZANTES.DOCUMENTO] && !fila[COLUMNAS_SIMPATIZANTES.NOMBRE]) {
        continue;
      }
      
      simpatizantes.push({
        nombre: fila[COLUMNAS_SIMPATIZANTES.NOMBRE] || '',
        tipoDocumento: fila[COLUMNAS_SIMPATIZANTES.TIPO_DOC] || '',
        documento: fila[COLUMNAS_SIMPATIZANTES.DOCUMENTO] ? fila[COLUMNAS_SIMPATIZANTES.DOCUMENTO].toString() : '',
        celular: fila[COLUMNAS_SIMPATIZANTES.CELULAR] ? fila[COLUMNAS_SIMPATIZANTES.CELULAR].toString() : '',
        direccion: fila[COLUMNAS_SIMPATIZANTES.DIRECCION] || '',
        barrio: fila[COLUMNAS_SIMPATIZANTES.BARRIO] || '',
        departamento: fila[COLUMNAS_SIMPATIZANTES.DEPARTAMENTO] || '',
        municipio: fila[COLUMNAS_SIMPATIZANTES.MUNICIPIO] || '',
        haSido: fila[COLUMNAS_SIMPATIZANTES.HA_SIDO] || '',
        liderDocumento: fila[COLUMNAS_SIMPATIZANTES.LIDER_DOC] ? fila[COLUMNAS_SIMPATIZANTES.LIDER_DOC].toString() : '',
        liderNombre: fila[COLUMNAS_SIMPATIZANTES.LIDER_NOMBRE] || '',
        fechaRegistro: fila[COLUMNAS_SIMPATIZANTES.FECHA_REGISTRO] || '',
        puestoVotacion: fila[COLUMNAS_SIMPATIZANTES.PUESTO_VOTACION] || '',
        mesa: fila[COLUMNAS_SIMPATIZANTES.MESA] ? fila[COLUMNAS_SIMPATIZANTES.MESA].toString() : '',
        contesto: fila[COLUMNAS_SIMPATIZANTES.CONTESTO] || '',
        conoceReferente: fila[COLUMNAS_SIMPATIZANTES.CONOCE_REFERENTE] || '',
        conoceCandidato: fila[COLUMNAS_SIMPATIZANTES.CONOCE_CANDIDATO] || '',
        votariaCandidato: fila[COLUMNAS_SIMPATIZANTES.VOTARIA_CANDIDATO] || '',
        sabeVotar: fila[COLUMNAS_SIMPATIZANTES.SABE_VOTAR] || '',
        conoceMesaPuesto: fila[COLUMNAS_SIMPATIZANTES.CONOCE_MESA_PUESTO] || '',
        infoWhatsapp: fila[COLUMNAS_SIMPATIZANTES.INFO_WHATSAPP] || '',
        listado14Mayo: fila[COLUMNAS_SIMPATIZANTES.LISTADO_14_MAYO] || '',
        fila: i + 1
      });
    }
    
    Logger.log('Total simpatizantes procesados: ' + simpatizantes.length);
    return { success: true, simpatizantes: simpatizantes, total: simpatizantes.length };
    
  } catch (error) {
    Logger.log('Error en obtenerTodosSimpatizantes: ' + error.toString());
    return { success: false, message: error.toString(), simpatizantes: [] };
  }
}


// ========== OBTENER SIMPATIZANTES OPTIMIZADO ==========
function obtenerSimpatizantesOptimizado() {
  try {
    Logger.log('=== OBTENER SIMPATIZANTES OPTIMIZADO ===');
    
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, message: 'Hoja no encontrada', simpatizantes: [] };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, simpatizantes: [], total: 0 };
    }
    
    // Solo leer las columnas necesarias (A-V = 22 columnas)
    var datos = hoja.getRange(2, 1, ultimaFila - 1, 22).getValues();
    Logger.log('Filas leídas: ' + datos.length);
    
    var simpatizantes = [];
    
    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      
      if (!fila[2] && !fila[0]) continue; // Saltar vacíos
      
      simpatizantes.push({
        nombre: fila[0] || '',
        documento: fila[2] ? String(fila[2]) : '',
        celular: fila[3] ? String(fila[3]) : '',
        municipio: fila[7] || '',
        liderDocumento: fila[9] ? String(fila[9]) : '',
        liderNombre: fila[10] || '',
        puestoVotacion: fila[12] || '',
        mesa: fila[13] ? String(fila[13]) : '',
        contesto: fila[14] || '',
        votariaCandidato: fila[17] || '',
        fila: i + 2
      });
    }
    
    Logger.log('Total procesados: ' + simpatizantes.length);
    return { success: true, simpatizantes: simpatizantes, total: simpatizantes.length };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), simpatizantes: [] };
  }
}

// ========== OBTENER SIMPATIZANTES DE UN LÍDER ==========
function obtenerSimpatizantesDelLider(documentoLider) {
  try {
    Logger.log('=== OBTENER SIMPATIZANTES DEL LÍDER: ' + documentoLider + ' ===');
    
    if (!documentoLider) {
      return { success: false, message: 'Documento requerido', simpatizantes: [], total: 0 };
    }
    
    var docBuscar = String(documentoLider).trim();
    
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, message: 'Hoja Registros no encontrada', simpatizantes: [], total: 0 };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, simpatizantes: [], total: 0 };
    }
    
    var simpatizantes = [];
    var BLOQUE = 5000;
    
    for (var inicio = 2; inicio <= ultimaFila; inicio += BLOQUE) {
      var fin = Math.min(inicio + BLOQUE - 1, ultimaFila);
      var cantidadFilas = fin - inicio + 1;
      
      var datos = hoja.getRange(inicio, 1, cantidadFilas, 22).getValues();
      
      for (var i = 0; i < datos.length; i++) {
        var fila = datos[i];
        var liderDoc = fila[9] ? String(fila[9]).trim() : '';
        
        if (liderDoc === docBuscar) {
          var fechaReg = '';
          if (fila[11]) {
            try {
              var f = new Date(fila[11]);
              if (!isNaN(f.getTime())) {
                fechaReg = Utilities.formatDate(f, 'America/Bogota', 'dd/MM/yyyy');
              }
            } catch(e) {
              fechaReg = String(fila[11]);
            }
          }
          
          simpatizantes.push({
            nombre: fila[0] ? String(fila[0]).trim() : '',
            tipoDocumento: fila[1] ? String(fila[1]).trim() : '',
            documento: fila[2] ? String(fila[2]).trim() : '',
            celular: fila[3] ? String(fila[3]).trim() : '',
            direccion: fila[4] ? String(fila[4]).trim() : '',
            barrio: fila[5] ? String(fila[5]).trim() : '',
            departamento: fila[6] ? String(fila[6]).trim() : '',
            municipio: fila[7] ? String(fila[7]).trim() : '',
            haSido: fila[8] ? String(fila[8]).trim() : '',
            liderDocumento: liderDoc,
            liderNombre: fila[10] ? String(fila[10]).trim() : '',
            fechaRegistro: fechaReg,
            puestoVotacion: fila[12] ? String(fila[12]).trim() : '',
            mesa: fila[13] ? String(fila[13]).trim() : '',
            contesto: fila[14] ? String(fila[14]).trim() : '',
            conoceReferente: fila[15] ? String(fila[15]).trim() : '',
            conoceCandidato: fila[16] ? String(fila[16]).trim() : '',
            votariaCandidato: fila[17] ? String(fila[17]).trim() : '',
            sabeVotar: fila[18] ? String(fila[18]).trim() : '',
            conoceMesaPuesto: fila[19] ? String(fila[19]).trim() : '',
            infoWhatsapp: fila[20] ? String(fila[20]).trim() : '',
            listado14Mayo: fila[21] ? String(fila[21]).trim() : '',
            fila: inicio + i
          });
        }
      }
    }
    
    Logger.log('Simpatizantes encontrados: ' + simpatizantes.length);
    
    return {
      success: true,
      simpatizantes: simpatizantes,
      total: simpatizantes.length
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), simpatizantes: [], total: 0 };
  }
}


// ========== BUSCAR LÍDER OPTIMIZADO ==========
function buscarLiderOptimizado(termino) {
  try {
    Logger.log('=== BUSCAR LÍDER: ' + termino + ' ===');
    
    var terminoLower = String(termino).toLowerCase().trim();
    var terminoExacto = String(termino).trim();
    var liderEncontrado = null;
    
    // 1. Buscar en BD-lideres (ID_SEGUIMIENTO_GT)
    var ssLideres = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ssLideres.getSheetByName('BD-lideres');
    
    if (hojaLideres) {
      var datosLideres = hojaLideres.getDataRange().getValues();
      
      for (var i = 1; i < datosLideres.length; i++) {
        var fila = datosLideres[i];
        var documento = fila[4] ? String(fila[4]).trim() : '';
        var nombre = fila[2] ? String(fila[2]).trim() : '';
        var nombreLower = nombre.toLowerCase();
        
        if (documento === terminoExacto || nombreLower.indexOf(terminoLower) >= 0) {
          liderEncontrado = {
            documento: documento,
            nombre: nombre,
            entidad: fila[11] ? String(fila[11]).trim() : '',
            celular: fila[6] ? String(fila[6]).trim() : '',
            correo: fila[9] ? String(fila[9]).trim() : ''
          };
          break;
        }
      }
    }
    
    // 2. Si no se encontró, buscar en hoja "Lideres" de Registros
    if (!liderEncontrado) {
      var ssRegistros = SpreadsheetApp.openById(ID_REGISTROS);
      var hojaLideresReg = ssRegistros.getSheetByName('Lideres');
      
      if (hojaLideresReg) {
        var datosLideresReg = hojaLideresReg.getDataRange().getValues();
        
        for (var j = 1; j < datosLideresReg.length; j++) {
          var filaL = datosLideresReg[j];
          var docLider = filaL[0] ? String(filaL[0]).trim() : '';
          var nombreLider = filaL[1] ? String(filaL[1]).trim() : '';
          var nombreLiderLower = nombreLider.toLowerCase();
          
          if (docLider === terminoExacto || nombreLiderLower.indexOf(terminoLower) >= 0) {
            liderEncontrado = {
              documento: docLider,
              nombre: nombreLider,
              entidad: '',
              celular: '',
              correo: ''
            };
            break;
          }
        }
      }
    }
    
    // 3. Buscar simpatizantes en hoja Registros
    var docBuscar = liderEncontrado ? liderEncontrado.documento : terminoExacto;
    var resSimpatizantes = obtenerSimpatizantesDelLider(docBuscar);
    var simpatizantes = resSimpatizantes.success ? resSimpatizantes.simpatizantes : [];
    
    // 4. Si no hay líder pero sí simpatizantes, obtener datos del líder desde registros
    if (!liderEncontrado && simpatizantes.length > 0) {
      liderEncontrado = {
        documento: simpatizantes[0].liderDocumento || docBuscar,
        nombre: simpatizantes[0].liderNombre || 'Líder ' + docBuscar,
        entidad: '',
        celular: '',
        correo: ''
      };
    }
    
    // 5. Verificar resultados
    if (!liderEncontrado && simpatizantes.length === 0) {
      return { success: false, message: 'No se encontró el líder ni simpatizantes' };
    }
    
    var cantidadSimpatizantes = simpatizantes.length;
    var porcentaje = Math.round((cantidadSimpatizantes / 40) * 100);
    var clasificacion = '';
    var mensaje = '';
    
    if (cantidadSimpatizantes >= 40) {
      clasificacion = 'excelente';
      mensaje = '✅ Meta cumplida';
    } else if (cantidadSimpatizantes >= 30) {
      clasificacion = 'bueno';
      mensaje = '📈 Buen avance';
    } else if (cantidadSimpatizantes >= 15) {
      clasificacion = 'atencion';
      mensaje = '⚠️ Requiere atención';
    } else {
      clasificacion = 'critico';
      mensaje = '🚨 Estado crítico';
    }
    
    Logger.log('Líder: ' + (liderEncontrado ? liderEncontrado.nombre : 'N/A') + ', Simpatizantes: ' + cantidadSimpatizantes);
    
    return {
      success: true,
      lider: {
        id: liderEncontrado ? liderEncontrado.documento : terminoExacto,
        nombre: liderEncontrado ? liderEncontrado.nombre : 'Líder ' + terminoExacto,
        entidad: liderEncontrado ? liderEncontrado.entidad : '',
        celular: liderEncontrado ? liderEncontrado.celular : '',
        correo: liderEncontrado ? liderEncontrado.correo : '',
        simpatizantes: cantidadSimpatizantes,
        porcentaje: porcentaje,
        faltan: Math.max(0, 40 - cantidadSimpatizantes),
        clasificacion: clasificacion,
        mensaje: mensaje,
        simpatizantesDetalle: simpatizantes
      }
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
Pasos:
// ========== GENERAR PDF DE SIMPATIZANTES ==========
function generarPDFSimpatizantes(simpatizantes) {
  try {
    Logger.log('=== GENERAR PDF SIMPATIZANTES ===');
    Logger.log('Cantidad: ' + simpatizantes.length);
    
    var html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
          h1 { color: #1e40af; font-size: 18px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #1e40af; color: white; padding: 8px; text-align: left; font-size: 10px; }
          td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
          tr:nth-child(even) { background: #f9fafb; }
          .header-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 9px; }
        </style>
      </head>
      <body>
        <h1>📋 Reporte de Simpatizantes</h1>
        <div class="header-info">
          <strong>Fecha de generación:</strong> ${Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm')}<br>
          <strong>Total de registros:</strong> ${simpatizantes.length}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Celular</th>
              <th>Municipio</th>
              <th>Líder</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    simpatizantes.forEach(function(s, i) {
      html += `<tr><td>${i + 1}</td><td>${s.nombre || '-'}</td><td>${s.documento || '-'}</td><td>${s.celular || '-'}</td><td>${s.municipio || '-'}</td><td>${s.liderNombre || 'Sin líder'}</td><td>${s.fechaRegistro || '-'}</td></tr>`;
    });
    
    html += `
          </tbody>
        </table>
        <div class="footer">Generado por Sistema 40 Caldas - ${new Date().getFullYear()}</div>
      </body>
      </html>
    `;
    
    var blob = Utilities.newBlob(html, 'text/html', 'reporte_simpatizantes.html');
    var pdf = blob.getAs('application/pdf');
    pdf.setName('Reporte_Simpatizantes_' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd_HHmm') + '.pdf');
    
    var folder = DriveApp.getRootFolder();
    var file = folder.createFile(pdf);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return { success: true, url: file.getUrl() };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ========== GENERAR PDF DE UN LÍDER ==========
function generarPDFLider(documentoLider, nombreLider) {
  try {
    Logger.log('=== GENERAR PDF LÍDER: ' + nombreLider + ' ===');
    
    var resSimp = obtenerSimpatizantesDelLider(documentoLider);
    var simpatizantes = resSimp.success ? resSimp.simpatizantes : [];
    
    var ssLideres = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ssLideres.getSheetByName('BD-lideres');
    var datosLideres = hojaLideres.getDataRange().getValues();
    
    var lider = null;
    for (var i = 1; i < datosLideres.length; i++) {
      if (String(datosLideres[i][4]).trim() === String(documentoLider).trim()) {
        lider = {
          nombre: datosLideres[i][2] || '',
          documento: datosLideres[i][4] || '',
          celular: datosLideres[i][6] || '',
          correo: datosLideres[i][9] || '',
          entidad: datosLideres[i][11] || '',
          cargo: datosLideres[i][12] || '',
          barrio: datosLideres[i][8] || '',
          municipio: datosLideres[i][28] || ''
        };
        break;
      }
    }
    
    var colorEstado = simpatizantes.length >= 40 ? '#10b981' : simpatizantes.length >= 30 ? '#3b82f6' : simpatizantes.length >= 15 ? '#f59e0b' : '#ef4444';
    
    var html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
          h1 { color: #7c3aed; font-size: 18px; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
          h2 { color: #374151; font-size: 14px; margin-top: 20px; background: #f3f4f6; padding: 10px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #7c3aed; color: white; padding: 8px; text-align: left; font-size: 10px; }
          td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
          tr:nth-child(even) { background: #f9fafb; }
          .header-box { background: linear-gradient(135deg, #c4b5fd, #ddd6fe); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .stats-box { text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; margin: 10px 0; }
          .stats-number { font-size: 28px; font-weight: bold; color: #7c3aed; }
          .progress-bar { background: #e5e7eb; border-radius: 10px; height: 20px; margin: 15px 0; overflow: hidden; }
          .progress-fill { background: ${colorEstado}; height: 100%; }
          .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 9px; }
        </style>
      </head>
      <body>
        <h1>📋 Reporte de Líder</h1>
        <div class="header-box">
          <div style="font-size: 20px; font-weight: bold; color: #5b21b6;">${lider ? lider.nombre : nombreLider}</div>
          <div style="color: #7c3aed; margin-top: 5px;">Documento: ${documentoLider}</div>
        </div>
        ${lider ? `
        <h2>📌 Información del Líder</h2>
        <table>
          <tr><td style="width: 30%; font-weight: bold;">Celular:</td><td>${lider.celular || '-'}</td></tr>
          <tr><td style="font-weight: bold;">Correo:</td><td>${lider.correo || '-'}</td></tr>
          <tr><td style="font-weight: bold;">Entidad:</td><td>${lider.entidad || '-'}</td></tr>
          <tr><td style="font-weight: bold;">Cargo:</td><td>${lider.cargo || '-'}</td></tr>
        </table>` : ''}
        <h2>📊 Progreso de Meta</h2>
        <div class="stats-box">
          <div class="stats-number">${simpatizantes.length}/40</div>
          <div>Simpatizantes registrados</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(simpatizantes.length / 40 * 100, 100)}%;"></div>
          </div>
          <div style="color: ${colorEstado};">
            ${simpatizantes.length >= 40 ? '✅ Meta cumplida' : '⏳ Faltan ' + (40 - simpatizantes.length) + ' simpatizantes'}
          </div>
        </div>
        <h2>👥 Lista de Simpatizantes (${simpatizantes.length})</h2>
        ${simpatizantes.length > 0 ? `
        <table>
          <thead><tr><th>#</th><th>Nombre</th><th>Documento</th><th>Celular</th><th>Municipio</th></tr></thead>
          <tbody>${simpatizantes.map(function(s, i) { return '<tr><td>' + (i + 1) + '</td><td>' + (s.nombre || '-') + '</td><td>' + (s.documento || '-') + '</td><td>' + (s.celular || '-') + '</td><td>' + (s.municipio || '-') + '</td></tr>'; }).join('')}</tbody>
        </table>` : '<p style="text-align: center; color: #9ca3af;">No hay simpatizantes registrados</p>'}
        <div class="footer">Generado por Sistema 40 Caldas - ${Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm')}</div>
      </body>
      </html>
    `;
    
    var blob = Utilities.newBlob(html, 'text/html', 'reporte_lider.html');
    var pdf = blob.getAs('application/pdf');
    var nombreArchivo = 'Reporte_' + (lider ? lider.nombre : nombreLider).replace(/[^a-zA-Z0-9]/g, '_') + '_' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd') + '.pdf';
    pdf.setName(nombreArchivo);
    
    var folder = DriveApp.getRootFolder();
    var file = folder.createFile(pdf);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return { success: true, url: file.getUrl() };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ========== ENVIAR CORREO AL LÍDER ==========
function enviarCorreoSimpatizantesLider(documentoLider, nombreLider, correoLider) {
  try {
    Logger.log('=== ENVIAR CORREO A LÍDER ===');
    Logger.log('Correo: ' + correoLider);
    
    if (!correoLider || correoLider === '' || correoLider === '-') {
      return { success: false, message: 'El líder no tiene correo electrónico registrado' };
    }
    
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoLider)) {
      return { success: false, message: 'El formato del correo electrónico no es válido: ' + correoLider };
    }
    
    var resSimp = obtenerSimpatizantesDelLider(documentoLider);
    var simpatizantes = resSimp.success ? resSimp.simpatizantes : [];
    
    var porcentaje = Math.round((simpatizantes.length / 40) * 100);
    var faltan = Math.max(0, 40 - simpatizantes.length);
    var colorEstado = simpatizantes.length >= 40 ? '#10b981' : simpatizantes.length >= 30 ? '#3b82f6' : simpatizantes.length >= 15 ? '#f59e0b' : '#ef4444';
    var mensajeEstado = simpatizantes.length >= 40 ? '✅ ¡Felicitaciones! Has cumplido tu meta' : '⏳ Faltan ' + faltan + ' simpatizantes para cumplir la meta';
    
    var htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .stats-box { background: #f9fafb; border-radius: 10px; padding: 25px; text-align: center; margin-bottom: 25px; }
          .stats-number { font-size: 48px; font-weight: bold; color: #7c3aed; }
          .progress-bar { background: #e5e7eb; border-radius: 20px; height: 24px; margin: 20px 0; overflow: hidden; }
          .progress-fill { background: ${colorEstado}; height: 100%; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #7c3aed; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Reporte de Simpatizantes</h1>
            <p>Hola ${nombreLider}, aquí está tu progreso actualizado</p>
          </div>
          <div class="content">
            <div class="stats-box">
              <div class="stats-number">${simpatizantes.length}/40</div>
              <div style="color: #6b7280;">Simpatizantes registrados</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(porcentaje, 100)}%;"></div>
              </div>
              <div style="color: ${colorEstado}; font-weight: 600;">${mensajeEstado}</div>
            </div>
            ${simpatizantes.length > 0 ? `
            <h3 style="color: #374151;">👥 Tus Simpatizantes</h3>
            <table>
              <thead><tr><th>#</th><th>Nombre</th><th>Documento</th><th>Celular</th><th>Municipio</th></tr></thead>
              <tbody>${simpatizantes.map(function(s, i) { return '<tr><td>' + (i + 1) + '</td><td>' + (s.nombre || '-') + '</td><td>' + (s.documento || '-') + '</td><td>' + (s.celular || '-') + '</td><td>' + (s.municipio || '-') + '</td></tr>'; }).join('')}</tbody>
            </table>` : '<p style="text-align: center; color: #9ca3af; padding: 30px;">Aún no tienes simpatizantes registrados. ¡Ánimo!</p>'}
          </div>
          <div class="footer">
            <p>Sistema 40 Caldas - ${Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: correoLider,
      subject: '📋 Reporte de Simpatizantes - ' + nombreLider + ' (' + simpatizantes.length + '/40)',
      htmlBody: htmlBody
    });
    
    Logger.log('Correo enviado exitosamente a: ' + correoLider);
    
    return { success: true, message: 'Correo enviado a ' + correoLider };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ========== FUNCIÓN DE PRUEBA ==========
function testObtenerDatosLlamadas() {
  Logger.log('=== TEST INICIO ===');
  var resultado = obtenerDatosLlamadasWrapper();
  Logger.log('Success: ' + resultado.success);
  Logger.log('Total: ' + resultado.total);
  if (resultado.datos && resultado.datos.length > 0) {
    Logger.log('Primer registro: ' + JSON.stringify(resultado.datos[0]));
  }
  Logger.log('=== TEST FIN ===');
  return resultado;
}

function testObtenerSimpatizantes() {
  Logger.log('=== TEST SIMPATIZANTES INICIO ===');
  var resultado = obtenerTodosSimpatizantes();
  Logger.log('Success: ' + resultado.success);
  Logger.log('Total: ' + resultado.total);
  if (resultado.simpatizantes && resultado.simpatizantes.length > 0) {
    Logger.log('Primer simpatizante: ' + JSON.stringify(resultado.simpatizantes[0]));
  }
  Logger.log('=== TEST FIN ===');
  return resultado;
}


// FUNCIÓN: OBTENER DATOS DE UN LÍDER
function obtenerDatosLider(documento) {
  try {
    Logger.log('=== OBTENIENDO DATOS DEL LÍDER: ' + documento + ' ===');
    
    var ss = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var datos = hoja.getDataRange().getValues();
    var liderFila = null;
    var liderIdx = -1;
    
    for (var i = 1; i < datos.length; i++) {
      var docFila = datos[i][4] ? datos[i][4].toString().trim() : '';
      if (docFila === documento.toString().trim()) {
        liderFila = datos[i];
        liderIdx = i + 1;
        break;
      }
    }
    
    if (!liderFila) {
      return { success: false, message: 'Líder no encontrado' };
    }
    
    var lider = {
      idx: liderIdx,
      nombre: liderFila[2] || '',
      documento: liderFila[4] || '',
      celular: liderFila[6] || '',
      correo: liderFila[9] || '',
      direccion: liderFila[7] || '',
      barrio: liderFila[8] || '',
      municipio: liderFila[28] || '',
      profesion: liderFila[10] || '',
      entidad: liderFila[11] || '',
      cargo: liderFila[12] || '',
      tipoVinculacion: liderFila[13] || '',
      observaciones: liderFila[26] || ''
    };
    
    return { success: true, lider: lider };
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: ACTUALIZAR DATOS DE UN LÍDER
function actualizarDatosLider(datos) {
  try {
    Logger.log('=== ACTUALIZANDO LÍDER ===');
    
    var ss = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var rowIndex = datos.rowIndex;
    if (!rowIndex || rowIndex < 2) {
      return { success: false, message: 'Índice de fila inválido' };
    }
    
    if (datos.nombre) hoja.getRange(rowIndex, 3).setValue(datos.nombre);
    if (datos.celular) hoja.getRange(rowIndex, 7).setValue(datos.celular);
    if (datos.correo) hoja.getRange(rowIndex, 10).setValue(datos.correo);
    if (datos.direccion) hoja.getRange(rowIndex, 8).setValue(datos.direccion);
    if (datos.barrio) hoja.getRange(rowIndex, 9).setValue(datos.barrio);
    if (datos.municipio) hoja.getRange(rowIndex, 29).setValue(datos.municipio);
    if (datos.profesion) hoja.getRange(rowIndex, 11).setValue(datos.profesion);
    if (datos.entidad) hoja.getRange(rowIndex, 12).setValue(datos.entidad);
    if (datos.cargo) hoja.getRange(rowIndex, 13).setValue(datos.cargo);
    if (datos.observaciones) hoja.getRange(rowIndex, 27).setValue(datos.observaciones);
    
    // ★ CORREGIDO: Col 40 = usuario+fecha combinados, Col 41 (comuna) NO se toca
    hoja.getRange(rowIndex, 40).setValue('ADMIN - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm'));
    
    return { success: true, message: 'Líder actualizado correctamente' };
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: GUARDAR SIMPATIZANTE
function guardarSimpatizante(datos) {
  try {
    Logger.log('=== GUARDANDO SIMPATIZANTE ===');
    
    var ss = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, message: 'Hoja de simpatizantes no encontrada' };
    }
    
    if (datos.esNuevo) {
      var nuevaFila = [
        datos.nombre || '',
        'CC (Cedula de ciudadanía)',
        datos.documento || '',
        datos.celular || '',
        datos.direccion || '',
        datos.barrio || '',
        datos.departamento || 'CALDAS',
        datos.municipio || 'MANIZALES',
        'Ninguna de las anteriores',
        datos.liderDocumento || '',
        datos.liderNombre || '',
        new Date()
      ];
      hoja.appendRow(nuevaFila);
    } else {
      var datosHoja = hoja.getDataRange().getValues();
      var filaEncontrada = -1;
      
      for (var i = 1; i < datosHoja.length; i++) {
        var docFila = datosHoja[i][2] ? datosHoja[i][2].toString().trim() : '';
        if (docFila === (datos.documentoOriginal || datos.documento).toString().trim()) {
          filaEncontrada = i + 1;
          break;
        }
      }
      
      if (filaEncontrada === -1) {
        return { success: false, message: 'Simpatizante no encontrado' };
      }
      
      hoja.getRange(filaEncontrada, 1).setValue(datos.nombre);
      hoja.getRange(filaEncontrada, 4).setValue(datos.celular);
      hoja.getRange(filaEncontrada, 8).setValue(datos.municipio);
    }
    
    return { success: true, message: datos.esNuevo ? 'Simpatizante agregado' : 'Simpatizante actualizado' };
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: ELIMINAR SIMPATIZANTE
function eliminarSimpatizante(documento) {
  try {
    Logger.log('=== ELIMINANDO SIMPATIZANTE: ' + documento + ' ===');
    
    var ss = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, message: 'Hoja no encontrada' };
    }
    
    var datos = hoja.getDataRange().getValues();
    var filaEliminar = -1;
    
    for (var i = 1; i < datos.length; i++) {
      var docFila = datos[i][2] ? datos[i][2].toString().trim() : '';
      if (docFila === documento.toString().trim()) {
        filaEliminar = i + 1;
        break;
      }
    }
    
    if (filaEliminar === -1) {
      return { success: false, message: 'Simpatizante no encontrado' };
    }
    
    hoja.deleteRow(filaEliminar);
    return { success: true, message: 'Simpatizante eliminado' };
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: ELIMINAR REGISTROS DUPLICADOS
function eliminarRegistrosDuplicados(indices) {
  try {
    Logger.log('=== ELIMINANDO DUPLICADOS ===');
    
    var ss = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja no encontrada' };
    }
    
    indices.sort(function(a, b) { return b - a; });
    
    var eliminados = 0;
    indices.forEach(function(rowIndex) {
      if (rowIndex >= 2) {
        try {
          hoja.deleteRow(rowIndex);
          eliminados++;
        } catch (e) {}
      }
    });
    
    return { success: true, message: 'Eliminados: ' + eliminados, eliminados: eliminados };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: AGREGAR NUEVO REGISTRO LLAMADA
function agregarNuevoRegistroLlamada(datos) {
  try {
    Logger.log('=== AGREGANDO NUEVO REGISTRO ===');
    
    var ss = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja no encontrada' };
    }
    
    var nuevaFila = new Array(41).fill('');
    nuevaFila[0] = new Date();
    nuevaFila[2] = datos.nombre || '';
    nuevaFila[3] = datos.tipoDocumento || 'CC';
    nuevaFila[4] = datos.documento || '';
    nuevaFila[6] = datos.celular || '';
    nuevaFila[7] = datos.direccion || '';
    nuevaFila[8] = datos.barrio || '';
    nuevaFila[9] = datos.correo || '';
    nuevaFila[11] = datos.entidad || '';
    nuevaFila[12] = datos.cargo || '';
    nuevaFila[28] = datos.municipio || '';
    nuevaFila[35] = datos.estadoLlamada || 'contactado';
    nuevaFila[36] = new Date();
    nuevaFila[37] = datos.usuarioLlamada || '';
    nuevaFila[38] = datos.notasLlamada || '';
    // ★ CORREGIDO: índice 39 = col AN(40) = usuario+fecha combinados
    nuevaFila[39] = (datos.usuarioLlamada || 'ADMIN') + ' - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');
    // ★ CORREGIDO: índice 40 = col AO(41) = Comuna (NO fecha)
    nuevaFila[40] = datos.comuna || '';
    
    hoja.appendRow(nuevaFila);
    
    return { success: true, message: 'Registro agregado', rowIndex: hoja.getLastRow() };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: OBTENER LÍDERES
function obtenerLideres() {
  try {
    var ss = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja || hoja.getLastRow() <= 1) {
      return [{ id: '1075215691', nombre: 'WILMER JAVIER CASTAÑEDA G' }];
    }
    
    var datos = hoja.getRange(2, 10, hoja.getLastRow() - 1, 2).getValues();
    var lideresMap = {};
    
    datos.forEach(function(fila) {
      var id = fila[0] ? fila[0].toString().trim() : null;
      var nombre = fila[1] ? fila[1].toString().trim().toUpperCase() : null;
      if (id && nombre && !lideresMap[id]) {
        lideresMap[id] = { id: id, nombre: nombre };
      }
    });
    
    var lideres = [];
    for (var key in lideresMap) {
      lideres.push(lideresMap[key]);
    }
    
    return lideres;
    
  } catch (error) {
    return [{ id: '1075215691', nombre: 'WILMER JAVIER CASTAÑEDA G' }];
  }
}

// FUNCIÓN: OBTENER RESUMEN LLAMADAS
function obtenerResumenLlamadas() {
  try {
    var resultado = obtenerDatosLlamadas();
    if (!resultado.success) return resultado;
    
    var datos = resultado.datos;
    var resumen = {
      total: datos.length,
      pendientes: datos.filter(function(d) { return !d.estadoLlamada || d.estadoLlamada === 'pendiente'; }).length,
      contactados: datos.filter(function(d) { return d.estadoLlamada === 'contactado'; }).length,
      noContesta: datos.filter(function(d) { return d.estadoLlamada === 'no_contesta'; }).length,
      callback: datos.filter(function(d) { return d.estadoLlamada === 'callback'; }).length
    };
    
    resumen.porcentajeAvance = resumen.total > 0 ? Math.round((resumen.contactados / resumen.total) * 100) : 0;
    
    return { success: true, resumen: resumen };
    
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// FUNCIÓN: SINCRONIZAR LÍDERES
function sincronizarLideres() {
  try {
    Logger.log('=== SINCRONIZANDO LÍDERES ===');
    
    var ssRegistros = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hojaLideres = ssRegistros.getSheetByName('Lideres');
    
    if (!hojaLideres) {
      return { success: false, message: 'Hoja Lideres no encontrada' };
    }
    
    var ssGT = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
    var hojaBD = ssGT.getSheetByName('BD-lideres');
    
    if (!hojaBD) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var datosLideres = hojaLideres.getDataRange().getValues();
    var datosBD = hojaBD.getDataRange().getValues();
    
    var existentes = {};
    for (var i = 1; i < datosBD.length; i++) {
      var doc = datosBD[i][4] ? datosBD[i][4].toString().trim() : '';
      if (doc) existentes[doc] = true;
    }
    
    var faltantes = [];
    for (var i = 1; i < datosLideres.length; i++) {
      var doc = datosLideres[i][4] ? datosLideres[i][4].toString().trim() : '';
      if (doc && !existentes[doc]) {
        var fila = datosLideres[i].slice(0, 41);
        while (fila.length < 41) fila.push('');
        fila[35] = 'pendiente';
        // ★ CORREGIDO: índice 39 = col AN(40) = usuario+fecha
        fila[39] = 'SINCRONIZACIÓN - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');
        // ★ CORREGIDO: índice 40 = col AO(41) = Comuna vacía (NO fecha)
        fila[40] = '';
        faltantes.push(fila);
      }
    }
    
    if (faltantes.length > 0) {
      var ultimaFila = hojaBD.getLastRow();
      hojaBD.getRange(ultimaFila + 1, 1, faltantes.length, 41).setValues(faltantes);
    }
    
    return { success: true, message: 'Sincronización completada', agregados: faltantes.length };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: PREVIA SINCRONIZAR
function previaSincronizarLideres() {
  try {
    var ssRegistros = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hojaLideres = ssRegistros.getSheetByName('Lideres');
    var ssGT = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
    var hojaBD = ssGT.getSheetByName('BD-lideres');
    
    if (!hojaLideres || !hojaBD) {
      return { success: false, message: 'Hojas no encontradas' };
    }
    
    var datosLideres = hojaLideres.getDataRange().getValues();
    var datosBD = hojaBD.getDataRange().getValues();
    
    var existentes = {};
    for (var i = 1; i < datosBD.length; i++) {
      var doc = datosBD[i][4] ? datosBD[i][4].toString().trim() : '';
      if (doc) existentes[doc] = true;
    }
    
    var faltantes = [];
    for (var i = 1; i < datosLideres.length; i++) {
      var doc = datosLideres[i][4] ? datosLideres[i][4].toString().trim() : '';
      var nombre = datosLideres[i][2] ? datosLideres[i][2].toString().trim() : '';
      if (doc && !existentes[doc]) {
        faltantes.push({ documento: doc, nombre: nombre });
      }
    }
    
    return {
      success: true,
      totalEnLideres: datosLideres.length - 1,
      totalEnBDLideres: datosBD.length - 1,
      faltantes: faltantes.length,
      detalleFaltantes: faltantes.slice(0, 20)
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// FUNCIÓN: DIAGNÓSTICO COMPLETO
function diagnosticoCompleto() {
  try {
    var resultado = { timestamp: new Date().toLocaleString(), tests: {} };
    
    try {
      var ss1 = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
      resultado.tests.simpatizantes = '✅ OK - ' + ss1.getSheets()[0].getLastRow() + ' filas';
    } catch(e) {
      resultado.tests.simpatizantes = '❌ ERROR';
    }
    
    try {
      var ss2 = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
      var hoja = ss2.getSheetByName('BD-lideres');
      resultado.tests.bdLideres = hoja ? '✅ OK - ' + hoja.getLastRow() + ' filas' : '⚠️ Hoja no encontrada';
    } catch(e) {
      resultado.tests.bdLideres = '❌ ERROR';
    }
    
    return resultado;
    
  } catch (error) {
    return { error: error.toString() };
  }
}

// FUNCIONES DE COMPATIBILIDAD
function obtenerDatosLlamadas() { return obtenerDatosLlamadasWrapper(); }

function obtenerEstadisticasLideres() { return obtenerEstadisticasOptimizadas(); }
function obtenerEstadisticasEmergencia() { return obtenerEstadisticasOptimizadas(); }
function buscarLiderDetallado(termino) { return buscarLiderOptimizado(termino); }
function enviarAlertasLideres() { return enviarReporteCompleto(); }
function probarEnvioAlertas() { return enviarReporteCompleto(); }
function limpiarCacheManual() { limpiarCache(); return { success: true, message: 'Cache limpiado' }; }

function testModuloLlamadas() {
  Logger.log('=== TEST MÓDULO LLAMADAS ===');
  var datos = obtenerDatosLlamadas();
  var resumen = obtenerResumenLlamadas();
  Logger.log('Datos: ' + datos.success + ', Total: ' + (datos.datos ? datos.datos.length : 0));
  return { success: true, totalRegistros: datos.datos ? datos.datos.length : 0, resumen: resumen.resumen };
}

// ================================================================
// FUNCIÓN: GENERAR PDF DE TODOS LOS LÍDERES
// ================================================================
function generarPDFTodosLideres(lideres) {
  try {
    Logger.log('=== GENERAR PDF TODOS LOS LÍDERES ===');
    Logger.log('Cantidad: ' + lideres.length);
    
    // Calcular estadísticas
    var totalSimp = 0;
    var conMeta = 0;
    lideres.forEach(function(l) {
      totalSimp += (l.simpatizantes || 0);
      if (l.simpatizantes >= 40) conMeta++;
    });
    
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
    html += 'body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }';
    html += 'h1 { color: #dc2626; font-size: 20px; border-bottom: 3px solid #dc2626; padding-bottom: 10px; margin-bottom: 20px; }';
    html += '.stats { display: flex; gap: 20px; margin-bottom: 25px; }';
    html += '.stat-box { background: #f3f4f6; padding: 15px 25px; border-radius: 10px; text-align: center; flex: 1; }';
    html += '.stat-number { font-size: 28px; font-weight: 700; color: #374151; }';
    html += '.stat-label { font-size: 11px; color: #6b7280; margin-top: 5px; }';
    html += 'table { width: 100%; border-collapse: collapse; margin-top: 15px; }';
    html += 'th { background: #dc2626; color: white; padding: 10px 8px; text-align: left; font-size: 10px; }';
    html += 'td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }';
    html += 'tr:nth-child(even) { background: #f9fafb; }';
    html += '.badge { padding: 3px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; }';
    html += '.badge-success { background: #dcfce7; color: #166534; }';
    html += '.badge-warning { background: #fef3c7; color: #92400e; }';
    html += '.badge-danger { background: #fee2e2; color: #991b1b; }';
    html += '.badge-info { background: #dbeafe; color: #1e40af; }';
    html += '.footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 9px; border-top: 1px solid #e5e7eb; padding-top: 15px; }';
    html += '</style></head><body>';
    
    html += '<h1>📋 Reporte de Líderes - Sistema 40 Caldas</h1>';
    
    // Estadísticas
    html += '<div class="stats">';
    html += '<div class="stat-box"><div class="stat-number">' + lideres.length + '</div><div class="stat-label">Total Líderes</div></div>';
    html += '<div class="stat-box"><div class="stat-number">' + totalSimp + '</div><div class="stat-label">Total Simpatizantes</div></div>';
    html += '<div class="stat-box"><div class="stat-number" style="color: #16a34a;">' + conMeta + '</div><div class="stat-label">Meta Cumplida</div></div>';
    html += '<div class="stat-box"><div class="stat-number" style="color: #dc2626;">' + (lideres.length - conMeta) + '</div><div class="stat-label">Sin Meta</div></div>';
    html += '</div>';
    
    // Tabla
    html += '<table><thead><tr>';
    html += '<th>#</th><th>Nombre</th><th>Documento</th><th>Celular</th><th>Entidad</th><th>Simp.</th><th>Estado</th>';
    html += '</tr></thead><tbody>';
    
    lideres.forEach(function(l, i) {
      var badgeClass = l.simpatizantes >= 40 ? 'badge-success' : l.simpatizantes >= 30 ? 'badge-info' : l.simpatizantes >= 15 ? 'badge-warning' : 'badge-danger';
      html += '<tr>';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td><strong>' + (l.nombre || '-') + '</strong></td>';
      html += '<td>' + (l.documento || '-') + '</td>';
      html += '<td>' + (l.celular || '-') + '</td>';
      html += '<td style="font-size:9px;">' + (l.entidad || '-') + '</td>';
      html += '<td><span class="badge ' + badgeClass + '">' + (l.simpatizantes || 0) + '/40</span></td>';
      html += '<td>' + (l.estado === 'contactado' ? '✅' : l.estado === 'pendiente' ? '⏳' : '📵') + '</td>';
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    html += '<div class="footer">';
    html += 'Generado el ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm') + ' | Sistema 40 Caldas';
    html += '</div>';
    
    html += '</body></html>';
    
    // Crear PDF
    var blob = Utilities.newBlob(html, 'text/html', 'reporte_lideres.html');
    var pdf = blob.getAs('application/pdf');
    pdf.setName('Reporte_Lideres_' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd_HHmm') + '.pdf');
    
    var folder = DriveApp.getRootFolder();
    var file = folder.createFile(pdf);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    Logger.log('PDF generado: ' + file.getUrl());
    
    return { success: true, url: file.getUrl() };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ================================================================
// FUNCIÓN: GENERAR EXCEL DE LÍDERES
// ================================================================
function generarExcelLideres(lideresData, titulo) {
  try {
    Logger.log('=== GENERAR EXCEL LÍDERES ===');
    Logger.log('Cantidad: ' + lideresData.length);
    
    if (!lideresData || lideresData.length === 0) {
      return { success: false, message: 'No hay datos para exportar' };
    }
    
    // Crear nuevo Spreadsheet
    var nombreArchivo = 'Lideres_40Caldas_' + (titulo || 'Reporte').replace(/[^a-zA-Z0-9]/g, '_') + '_' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd_HHmmss');
    var ss = SpreadsheetApp.create(nombreArchivo);
    var sheet = ss.getActiveSheet();
    sheet.setName('Líderes');
    
    // Definir encabezados
    var encabezados = [
      'N°', 'Nombre', 'Documento', 'Celular', 'Correo', 'Entidad', 
      'Municipio', 'Barrio', 'Comuna', 'Simpatizantes', 'Estado', 
      'Usuario Llamada', 'Fecha Llamada'
    ];
    
    // Escribir encabezados
    sheet.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    
    // Estilo de encabezados
    var headerRange = sheet.getRange(1, 1, 1, encabezados.length);
    headerRange.setBackground('#1a3353');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Preparar datos
    var datos = [];
    for (var i = 0; i < lideresData.length; i++) {
      var l = lideresData[i];
      datos.push([
        i + 1,
        l.nombre || '',
        l.documento || '',
        l.celular || '',
        l.correo || '',
        l.entidad || '',
        l.municipio || '',
        l.barrio || '',
        l.comuna || '',
        l.simpatizantes || 0,
        formatearEstadoExcel(l.estado),
        l.usuarioLlamada || '',
        l.fechaLlamada || ''
      ]);
    }
    
    // Escribir datos
    if (datos.length > 0) {
      sheet.getRange(2, 1, datos.length, encabezados.length).setValues(datos);
    }
    
    // Formato de columnas
    sheet.setColumnWidth(1, 40);   // N°
    sheet.setColumnWidth(2, 200);  // Nombre
    sheet.setColumnWidth(3, 100);  // Documento
    sheet.setColumnWidth(4, 100);  // Celular
    sheet.setColumnWidth(5, 180);  // Correo
    sheet.setColumnWidth(6, 150);  // Entidad
    sheet.setColumnWidth(7, 100);  // Municipio
    sheet.setColumnWidth(8, 120);  // Barrio
    sheet.setColumnWidth(9, 150);  // Comuna
    sheet.setColumnWidth(10, 90);  // Simpatizantes
    sheet.setColumnWidth(11, 100); // Estado
    sheet.setColumnWidth(12, 120); // Usuario
    sheet.setColumnWidth(13, 140); // Fecha
    
    // Congelar fila de encabezados
    sheet.setFrozenRows(1);
    
    // Agregar bordes
    var dataRange = sheet.getRange(1, 1, datos.length + 1, encabezados.length);
    dataRange.setBorder(true, true, true, true, true, true);
    
    // Alternar colores de filas y colorear simpatizantes
    for (var j = 0; j < datos.length; j++) {
      if (j % 2 === 1) {
        sheet.getRange(j + 2, 1, 1, encabezados.length).setBackground('#f8f9fa');
      }
      
      // Color por simpatizantes
      var simp = datos[j][9];
      var cell = sheet.getRange(j + 2, 10);
      if (simp >= 40) {
        cell.setBackground('#dcfce7').setFontColor('#166534');
      } else if (simp >= 30) {
        cell.setBackground('#dbeafe').setFontColor('#1e40af');
      } else if (simp >= 15) {
        cell.setBackground('#fef3c7').setFontColor('#92400e');
      } else {
        cell.setBackground('#fee2e2').setFontColor('#991b1b');
      }
    }
    
    // Agregar hoja de resumen
    var resumenSheet = ss.insertSheet('Resumen');
    
    var totalLideres = lideresData.length;
    var conMeta = lideresData.filter(function(l) { return (l.simpatizantes || 0) >= 40; }).length;
    var enAtencion = lideresData.filter(function(l) { var s = l.simpatizantes || 0; return s >= 15 && s < 30; }).length;
    var criticos = lideresData.filter(function(l) { return (l.simpatizantes || 0) < 15; }).length;
    
    var resumenDatos = [
      ['RESUMEN - ' + titulo, ''],
      ['', ''],
      ['Fecha de generación:', Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm:ss')],
      ['', ''],
      ['ESTADÍSTICAS GENERALES', ''],
      ['Total de Líderes:', totalLideres],
      ['Con Meta Cumplida (40+):', conMeta],
      ['En Atención (15-29):', enAtencion],
      ['Estado Crítico (<15):', criticos]
    ];
    
    resumenSheet.getRange(1, 1, resumenDatos.length, 2).setValues(resumenDatos);
    resumenSheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
    resumenSheet.getRange(5, 1).setFontWeight('bold');
    resumenSheet.setColumnWidth(1, 200);
    resumenSheet.setColumnWidth(2, 100);
    
    // Obtener URL del archivo
    var fileId = ss.getId();
    var url = 'https://docs.google.com/spreadsheets/d/' + fileId + '/export?format=xlsx';
    
    Logger.log('Excel generado: ' + nombreArchivo);
    
    return {
      success: true,
      url: url,
      fileId: fileId,
      fileName: nombreArchivo
    };
    
  } catch (error) {
    Logger.log('ERROR generando Excel: ' + error.toString());
    return { success: false, message: 'Error generando Excel: ' + error.toString() };
  }
}

function formatearEstadoExcel(estado) {
  var estados = {
    'pendiente': 'Pendiente',
    'contactado': 'Contactado',
    'no_contesta': 'No Contesta',
    'callback': 'Callback'
  };
  return estados[estado] || estado || 'Pendiente';
}
// ================================================================
// FUNCIÓN: AUTORIZAR PERMISOS
// Ejecutar esta función manualmente para autorizar todos los permisos
// ================================================================
function autorizarPermisos() {
  try {
    Logger.log('=== AUTORIZANDO PERMISOS ===');
    
    // Verificar usuario
    var usuario = Session.getActiveUser().getEmail();
    Logger.log('Usuario: ' + usuario);
    
    // Verificar permisos de correo
    var cuotaCorreo = MailApp.getRemainingDailyQuota();
    Logger.log('Cuota de correos restante: ' + cuotaCorreo);
    
    // Verificar permisos de Drive
    var carpetaRaiz = DriveApp.getRootFolder().getName();
    Logger.log('Drive OK - Carpeta raíz: ' + carpetaRaiz);
    
    // Verificar permisos de Spreadsheet
    var ss = SpreadsheetApp.openById('1PL1HJRdq38DL3kIPN74DW8-tyC2H_36yFT786VE9hzo');
    var nombreHoja = ss.getName();
    Logger.log('Spreadsheet OK: ' + nombreHoja);
    
    // Verificar Utilities
    var fechaActual = Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm:ss');
    Logger.log('Utilities OK - Fecha: ' + fechaActual);
    
    Logger.log('=== TODOS LOS PERMISOS AUTORIZADOS ===');
    
    return { 
      success: true, 
      message: 'Todos los permisos autorizados correctamente',
      usuario: usuario,
      cuotaCorreo: cuotaCorreo,
      fecha: fechaActual
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { 
      success: false, 
      message: 'Error autorizando permisos: ' + error.toString() 
    };
  }
}

// ================================================================
// FUNCIÓN: PRUEBA DE ENVÍO DE CORREO
// ================================================================
function pruebaEnvioCorreo() {
  try {
    var email = Session.getActiveUser().getEmail();
    
    MailApp.sendEmail({
      to: email,
      subject: '✅ Prueba Sistema 40 Caldas',
      htmlBody: '<h2>¡Funciona!</h2><p>Los permisos de correo están configurados correctamente.</p>'
    });
    
    Logger.log('Correo de prueba enviado a: ' + email);
    return { success: true, message: 'Correo enviado a ' + email };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function verificarDocumentoWrapper(numeroDoc) {
  try {
    Logger.log('=== VERIFICANDO DOCUMENTO: ' + numeroDoc + ' ===');
    
    // Validar entrada
    if (!numeroDoc || numeroDoc.toString().trim() === '') {
      Logger.log('Documento vacío');
      return false;
    }
    
    var numeroStr = numeroDoc.toString().trim();
    
    // Abrir el archivo de Registros/Simpatizantes
    var ss = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hoja = ss.getSheetByName('Registros');
    
    // Verificar que existe la hoja
    if (!hoja) {
      Logger.log('Hoja Registros no encontrada');
      return false;
    }
    
    var ultimaFila = hoja.getLastRow();
    
    // Si la hoja está vacía o solo tiene encabezados
    if (ultimaFila <= 1) {
      Logger.log('Hoja vacía, documento disponible');
      return false;
    }
    
    // Columna C (índice 3) contiene el Número de Documento
    var documentos = hoja.getRange(2, 3, ultimaFila - 1, 1).getValues();
    
    // Buscar el documento
    for (var i = 0; i < documentos.length; i++) {
      var docFila = documentos[i][0] ? documentos[i][0].toString().trim() : '';
      if (docFila === numeroStr) {
        Logger.log('Documento encontrado en fila: ' + (i + 2));
        return true; // EXISTE
      }
    }
    
    Logger.log('Documento NO existe - disponible para registro');
    return false; // NO EXISTE
    
  } catch (error) {
    Logger.log('ERROR en verificarDocumentoWrapper: ' + error.toString());
    return false;
  }
}


/**
 * Función de prueba para verificarDocumentoWrapper
 */
function testVerificarDocumentoWrapper() {
  Logger.log('=== TEST VERIFICAR DOCUMENTO ===');
  
  var resultado1 = verificarDocumentoWrapper('1018413132');
  Logger.log('Test documento existente: ' + resultado1);
  
  var resultado2 = verificarDocumentoWrapper('9999999999');
  Logger.log('Test documento nuevo: ' + resultado2);
  
  return { test1: resultado1, test2: resultado2 };
}

function guardarRegistroWrapper(datos) {
  try {
    Logger.log('=== GUARDAR REGISTRO SIMPATIZANTE ===');
    Logger.log('Datos recibidos: ' + JSON.stringify(datos));
    
    // Validar datos obligatorios
    if (!datos) {
      return { success: false, message: 'No se recibieron datos' };
    }
    
    if (!datos.nombreCompleto || !datos.numeroDocumento) {
      return { success: false, message: 'Nombre y documento son obligatorios' };
    }
    
    // Abrir el archivo de Registros
    var ss = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      Logger.log('ERROR: Hoja Registros no encontrada');
      return { success: false, message: 'Hoja Registros no encontrada' };
    }
    
    // Verificar si el documento ya existe
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila > 1) {
      var documentos = hoja.getRange(2, 3, ultimaFila - 1, 1).getValues();
      var docBuscar = datos.numeroDocumento.toString().trim();
      
      for (var i = 0; i < documentos.length; i++) {
        var docFila = documentos[i][0] ? documentos[i][0].toString().trim() : '';
        if (docFila === docBuscar) {
          Logger.log('Documento ya existe');
          return { success: false, message: 'Este documento ya está registrado' };
        }
      }
    }
    
    // Preparar la fila de datos
    // Estructura: A=Nombre, B=TipoDoc, C=NumDoc, D=Celular, E=Direccion, 
    //             F=Barrio, G=Depto, H=Municipio, I=HaSido, J=IDLider, K=NombreLider, L=FechaRegistro
    var nuevaFila = [
      datos.nombreCompleto ? datos.nombreCompleto.toString().toUpperCase().trim() : '',
      datos.tipoDocumento || 'CC',
      datos.numeroDocumento ? datos.numeroDocumento.toString().trim() : '',
      datos.numeroCelular ? datos.numeroCelular.toString().trim() : '',
      datos.direccion ? datos.direccion.toString().toUpperCase().trim() : '',
      datos.barrio ? datos.barrio.toString().toUpperCase().trim() : '',
      datos.departamento || 'CALDAS',
      datos.municipio || 'MANIZALES',
      datos.hasBeenType || 'Ninguna de las anteriores',
      datos.idLider ? datos.idLider.toString().trim() : '',
      datos.nombreLider ? datos.nombreLider.toString().toUpperCase().trim() : '',
      new Date() // Fecha de registro
    ];
    
    // Agregar la fila
    hoja.appendRow(nuevaFila);
    Logger.log('Registro guardado exitosamente');
    
    // Si el líder es nuevo, agregarlo a la lista de líderes
    if (datos.guardarNuevoLider && datos.idLider && datos.nombreLider) {
      Logger.log('Guardando nuevo líder...');
      try {
        agregarLiderSiNoExiste(datos.idLider, datos.nombreLider);
      } catch (e) {
        Logger.log('Error al guardar líder (no crítico): ' + e.toString());
      }
    }
    
    return { 
      success: true, 
      message: 'Registro guardado exitosamente',
      documento: datos.numeroDocumento,
      nombre: datos.nombreCompleto
    };
    
  } catch (error) {
    Logger.log('ERROR en guardarRegistroWrapper: ' + error.toString());
    return { success: false, message: 'Error al guardar: ' + error.toString() };
  }
}


/**
 * Función auxiliar para agregar líder si no existe
 * @param {string} idLider - Documento del líder
 * @param {string} nombreLider - Nombre del líder
 */
function agregarLiderSiNoExiste(idLider, nombreLider) {
  try {
    var ss = SpreadsheetApp.openById('1VcIyUC8bUs-ik5NljfUZYf7Ho3WnFBZi1UhEd1ixP4s');
    var hojaLideres = ss.getSheetByName('Lideres');
    
    if (!hojaLideres) {
      Logger.log('Hoja Lideres no encontrada, creándola...');
      hojaLideres = ss.insertSheet('Lideres');
      hojaLideres.appendRow(['ID', 'Nombre', 'Fecha Creación']);
    }
    
    // Verificar si ya existe
    var datos = hojaLideres.getDataRange().getValues();
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][0] && datos[i][0].toString().trim() === idLider.toString().trim()) {
        Logger.log('Líder ya existe');
        return;
      }
    }
    
    // Agregar nuevo líder
    hojaLideres.appendRow([
      idLider.toString().trim(),
      nombreLider.toString().toUpperCase().trim(),
      new Date()
    ]);
    
    Logger.log('Nuevo líder agregado: ' + nombreLider);
    
  } catch (error) {
    Logger.log('Error en agregarLiderSiNoExiste: ' + error.toString());
  }
}


/**
 * Función de prueba para guardarRegistroWrapper
 */
function testGuardarRegistroWrapper() {
  Logger.log('=== TEST GUARDAR REGISTRO ===');
  
  var datosTest = {
    nombreCompleto: 'USUARIO DE PRUEBA',
    tipoDocumento: 'CC',
    numeroDocumento: '9999999999',
    numeroCelular: '3001234567',
    direccion: 'CALLE PRUEBA 123',
    barrio: 'BARRIO TEST',
    departamento: 'CALDAS',
    municipio: 'MANIZALES',
    hasBeenType: 'Ninguna de las anteriores',
    idLider: '1075215691',
    nombreLider: 'WILMER JAVIER CASTAÑEDA G'
  };
  
  var resultado = guardarRegistroWrapper(datosTest);
  Logger.log('Resultado: ' + JSON.stringify(resultado));
  
  return resultado;
}

// ========================================================================
// FUNCIÓN: guardarSimpatizanteWrapper (NUEVA - wrapper para llamadas desde frontend)
// ========================================================================
function guardarSimpatizanteWrapper(datos) {
  try {
    console.log('=== GUARDAR SIMPATIZANTE WRAPPER ===');
    console.log('Datos recibidos:', JSON.stringify(datos));
    
    if (!datos || !datos.documento || !datos.nombre) {
      return { success: false, message: 'Datos incompletos: se requiere nombre y documento' };
    }
    
    const ss = SpreadsheetApp.openById(ID_REGISTROS);
    const hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, message: 'No se encontró la hoja "Registros"' };
    }
    
    // Verificar si es nuevo o actualización
    if (datos.esNuevo) {
      // Verificar si ya existe el documento
      const datosExistentes = hoja.getDataRange().getValues();
      const yaExiste = datosExistentes.some((fila, idx) => {
        if (idx === 0) return false; // Saltar encabezado
        return fila[COLUMNAS_SIMPATIZANTES.DOCUMENTO]?.toString().trim() === datos.documento.trim();
      });
      
      if (yaExiste) {
        return { success: false, message: 'Ya existe un simpatizante con este documento' };
      }
      
      // Agregar nuevo registro
      const nuevaFila = crearFilaSimpatizante(datos);
      hoja.appendRow(nuevaFila);
      
      console.log('Simpatizante agregado correctamente');
      return { success: true, message: 'Simpatizante agregado correctamente' };
      
    } else {
      // Actualizar registro existente
      return actualizarSimpatizanteEnHoja(hoja, datos);
    }
    
  } catch (error) {
    console.error('Error en guardarSimpatizanteWrapper:', error);
    return { success: false, message: error.toString() };
  }
}

// ========================================================================
// FUNCIÓN AUXILIAR: crearFilaSimpatizante
// ========================================================================
function crearFilaSimpatizante(datos) {
  const fechaActual = new Date().toLocaleDateString('es-CO');
  
  // Crear array con 22 columnas (A-V)
  const fila = new Array(22).fill('');
  
  // Columnas existentes (A-L)
  fila[COLUMNAS_SIMPATIZANTES.NOMBRE] = datos.nombre || '';
  fila[COLUMNAS_SIMPATIZANTES.TIPO_DOC] = datos.tipoDocumento || 'CC (Cedula de ciudadanía)';
  fila[COLUMNAS_SIMPATIZANTES.DOCUMENTO] = datos.documento || '';
  fila[COLUMNAS_SIMPATIZANTES.CELULAR] = datos.celular || '';
  fila[COLUMNAS_SIMPATIZANTES.DIRECCION] = datos.direccion || '';
  fila[COLUMNAS_SIMPATIZANTES.BARRIO] = datos.barrio || '';
  fila[COLUMNAS_SIMPATIZANTES.DEPARTAMENTO] = datos.departamento || 'CALDAS';
  fila[COLUMNAS_SIMPATIZANTES.MUNICIPIO] = datos.municipio || '';
  fila[COLUMNAS_SIMPATIZANTES.HA_SIDO] = datos.haSido || '';
  fila[COLUMNAS_SIMPATIZANTES.LIDER_DOC] = datos.liderDocumento || '';
  fila[COLUMNAS_SIMPATIZANTES.LIDER_NOMBRE] = datos.liderNombre || '';
  fila[COLUMNAS_SIMPATIZANTES.FECHA_REGISTRO] = fechaActual;
  
  // NUEVOS CAMPOS (M-V)
  fila[COLUMNAS_SIMPATIZANTES.PUESTO_VOTACION] = datos.puestoVotacion || '';
  fila[COLUMNAS_SIMPATIZANTES.MESA] = datos.mesa || '';
  fila[COLUMNAS_SIMPATIZANTES.CONTESTO] = datos.contesto || '';
  fila[COLUMNAS_SIMPATIZANTES.CONOCE_REFERENTE] = datos.conoceReferente || '';
  fila[COLUMNAS_SIMPATIZANTES.CONOCE_CANDIDATO] = datos.conoceCandidato || '';
  fila[COLUMNAS_SIMPATIZANTES.VOTARIA_CANDIDATO] = datos.votariaCandidato || '';
  fila[COLUMNAS_SIMPATIZANTES.SABE_VOTAR] = datos.sabeVotar || '';
  fila[COLUMNAS_SIMPATIZANTES.CONOCE_MESA_PUESTO] = datos.conoceMesaPuesto || '';
  fila[COLUMNAS_SIMPATIZANTES.INFO_WHATSAPP] = datos.infoWhatsapp || '';
  fila[COLUMNAS_SIMPATIZANTES.LISTADO_14_MAYO] = datos.listado14Mayo || '';
  
  return fila;
}

// ========================================================================
// FUNCIÓN AUXILIAR: actualizarSimpatizanteEnHoja
// ========================================================================
function actualizarSimpatizanteEnHoja(hoja, datos) {
  try {
    const documentoBuscar = datos.documentoOriginal || datos.documento;
    const todosLosDatos = hoja.getDataRange().getValues();
    
    let filaEncontrada = -1;
    
    for (let i = 1; i < todosLosDatos.length; i++) {
      const docFila = todosLosDatos[i][COLUMNAS_SIMPATIZANTES.DOCUMENTO]?.toString().trim();
      if (docFila === documentoBuscar.trim()) {
        filaEncontrada = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      return { success: false, message: 'No se encontró el simpatizante con documento: ' + documentoBuscar };
    }
    
    // Actualizar campos existentes (A-L)
    hoja.getRange(filaEncontrada, 1).setValue(datos.nombre || '');  // A
    hoja.getRange(filaEncontrada, 4).setValue(datos.celular || ''); // D
    hoja.getRange(filaEncontrada, 5).setValue(datos.direccion || ''); // E
    hoja.getRange(filaEncontrada, 6).setValue(datos.barrio || ''); // F
    hoja.getRange(filaEncontrada, 8).setValue(datos.municipio || ''); // H
    
    // ACTUALIZAR NUEVOS CAMPOS (M-V)
    hoja.getRange(filaEncontrada, 13).setValue(datos.puestoVotacion || ''); // M
    hoja.getRange(filaEncontrada, 14).setValue(datos.mesa || ''); // N
    hoja.getRange(filaEncontrada, 15).setValue(datos.contesto || ''); // O
    hoja.getRange(filaEncontrada, 16).setValue(datos.conoceReferente || ''); // P
    hoja.getRange(filaEncontrada, 17).setValue(datos.conoceCandidato || ''); // Q
    hoja.getRange(filaEncontrada, 18).setValue(datos.votariaCandidato || ''); // R
    hoja.getRange(filaEncontrada, 19).setValue(datos.sabeVotar || ''); // S
    hoja.getRange(filaEncontrada, 20).setValue(datos.conoceMesaPuesto || ''); // T
    hoja.getRange(filaEncontrada, 21).setValue(datos.infoWhatsapp || ''); // U
    hoja.getRange(filaEncontrada, 22).setValue(datos.listado14Mayo || ''); // V
    
    console.log('Simpatizante actualizado en fila:', filaEncontrada);
    return { success: true, message: 'Simpatizante actualizado correctamente' };
    
  } catch (error) {
    console.error('Error actualizando simpatizante:', error);
    return { success: false, message: error.toString() };
  }
}

// ========== OBTENER SIMPATIZANTES PAGINADO ==========
function obtenerSimpatizantesPaginado(pagina, porPagina, filtros) {
  try {
    Logger.log('=== OBTENER SIMPATIZANTES PAGINADO ===');
    Logger.log('Página: ' + pagina + ', Por página: ' + porPagina);
    
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, message: 'Hoja no encontrada', simpatizantes: [], total: 0 };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, simpatizantes: [], total: 0, pagina: 1, totalPaginas: 1 };
    }
    
    var totalRegistros = ultimaFila - 1;
    
    // Si hay filtros, necesitamos cargar todos y filtrar
    if (filtros && (filtros.termino || filtros.lider || filtros.estado || filtros.municipio)) {
      return obtenerSimpatizantesFiltrados(hoja, pagina, porPagina, filtros, totalRegistros);
    }
    
    // Sin filtros: paginación directa
    var totalPaginas = Math.ceil(totalRegistros / porPagina);
    pagina = Math.max(1, Math.min(pagina, totalPaginas));
    
    var filaInicio = 2 + ((pagina - 1) * porPagina);
    var filasALeer = Math.min(porPagina, ultimaFila - filaInicio + 1);
    
    if (filasALeer <= 0) {
      return { success: true, simpatizantes: [], total: totalRegistros, pagina: pagina, totalPaginas: totalPaginas };
    }
    
    var datos = hoja.getRange(filaInicio, 1, filasALeer, 22).getValues();
    var simpatizantes = procesarFilasSimpatizantes(datos, filaInicio);
    
    Logger.log('Simpatizantes en página: ' + simpatizantes.length + ' de ' + totalRegistros);
    
    return {
      success: true,
      simpatizantes: simpatizantes,
      total: totalRegistros,
      pagina: pagina,
      totalPaginas: totalPaginas,
      porPagina: porPagina
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), simpatizantes: [], total: 0 };
  }
}

// ========== OBTENER SIMPATIZANTES FILTRADOS (INTERNO) ==========
function obtenerSimpatizantesFiltrados(hoja, pagina, porPagina, filtros, totalRegistros) {
  try {
    Logger.log('Aplicando filtros...');
    
    // Cargar datos en bloques para evitar timeout
    var BLOQUE = 5000;
    var simpatizantesFiltrados = [];
    var ultimaFila = hoja.getLastRow();
    
    for (var inicio = 2; inicio <= ultimaFila; inicio += BLOQUE) {
      var fin = Math.min(inicio + BLOQUE - 1, ultimaFila);
      var cantidadFilas = fin - inicio + 1;
      
      var datos = hoja.getRange(inicio, 1, cantidadFilas, 22).getValues();
      
      for (var i = 0; i < datos.length; i++) {
        var fila = datos[i];
        if (!fila[2] && !fila[0]) continue;
        
        var cumpleFiltro = true;
        
        // Filtro por término (nombre, documento, celular)
        if (filtros.termino && filtros.termino.trim() !== '') {
          var termino = filtros.termino.toLowerCase();
          var nombre = (fila[0] || '').toString().toLowerCase();
          var documento = (fila[2] || '').toString().toLowerCase();
          var celular = (fila[3] || '').toString().toLowerCase();
          var liderNombre = (fila[10] || '').toString().toLowerCase();
          
          if (nombre.indexOf(termino) === -1 && 
              documento.indexOf(termino) === -1 && 
              celular.indexOf(termino) === -1 &&
              liderNombre.indexOf(termino) === -1) {
            cumpleFiltro = false;
          }
        }
        
        // Filtro por líder
        if (cumpleFiltro && filtros.lider && filtros.lider !== '') {
          var liderDoc = (fila[9] || '').toString();
          if (liderDoc !== filtros.lider) {
            cumpleFiltro = false;
          }
        }
        
        // Filtro por estado (contestó)
        if (cumpleFiltro && filtros.estado && filtros.estado !== '') {
          var contesto = (fila[14] || '').toString().toUpperCase();
          if (filtros.estado === 'SI' && contesto !== 'SI') cumpleFiltro = false;
          else if (filtros.estado === 'NO' && contesto !== 'NO') cumpleFiltro = false;
          else if (filtros.estado === 'PENDIENTE' && contesto !== '' && contesto !== 'PENDIENTE') cumpleFiltro = false;
        }
        
        // Filtro por municipio
        if (cumpleFiltro && filtros.municipio && filtros.municipio !== '') {
          var municipio = (fila[7] || '').toString();
          if (municipio !== filtros.municipio) {
            cumpleFiltro = false;
          }
        }
        
        if (cumpleFiltro) {
          simpatizantesFiltrados.push({
            nombre: fila[0] || '',
            documento: fila[2] ? String(fila[2]) : '',
            celular: fila[3] ? String(fila[3]) : '',
            municipio: fila[7] || '',
            liderDocumento: fila[9] ? String(fila[9]) : '',
            liderNombre: fila[10] || '',
            puestoVotacion: fila[12] || '',
            mesa: fila[13] ? String(fila[13]) : '',
            contesto: fila[14] || '',
            votariaCandidato: fila[17] || '',
            fila: inicio + i
          });
        }
      }
    }
    
    var totalFiltrados = simpatizantesFiltrados.length;
    var totalPaginas = Math.ceil(totalFiltrados / porPagina) || 1;
    pagina = Math.max(1, Math.min(pagina, totalPaginas));
    
    var inicioSlice = (pagina - 1) * porPagina;
    var finSlice = inicioSlice + porPagina;
    var simpatizantesPagina = simpatizantesFiltrados.slice(inicioSlice, finSlice);
    
    Logger.log('Filtrados: ' + totalFiltrados + ', Página: ' + pagina);
    
    return {
      success: true,
      simpatizantes: simpatizantesPagina,
      total: totalFiltrados,
      totalSinFiltro: totalRegistros,
      pagina: pagina,
      totalPaginas: totalPaginas,
      porPagina: porPagina
    };
    
  } catch (error) {
    Logger.log('ERROR en filtrado: ' + error.toString());
    return { success: false, message: error.toString(), simpatizantes: [], total: 0 };
  }
}

// ========== PROCESAR FILAS DE SIMPATIZANTES (AUXILIAR) ==========
function procesarFilasSimpatizantes(datos, filaInicio) {
  var simpatizantes = [];
  
  for (var i = 0; i < datos.length; i++) {
    var fila = datos[i];
    if (!fila[2] && !fila[0]) continue;
    
    simpatizantes.push({
      nombre: fila[0] || '',
      documento: fila[2] ? String(fila[2]) : '',
      celular: fila[3] ? String(fila[3]) : '',
      municipio: fila[7] || '',
      liderDocumento: fila[9] ? String(fila[9]) : '',
      liderNombre: fila[10] || '',
      puestoVotacion: fila[12] || '',
      mesa: fila[13] ? String(fila[13]) : '',
      contesto: fila[14] || '',
      votariaCandidato: fila[17] || '',
      fila: filaInicio + i
    });
  }
  
  return simpatizantes;
}

// ========== OBTENER ESTADÍSTICAS SIMPATIZANTES ==========
function obtenerEstadisticasSimpatizantesAuditoria() {
  try {
    Logger.log('=== OBTENER ESTADÍSTICAS SIMPATIZANTES ===');
    
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, total: 0, conPuesto: 0, contestaron: 0, votarian: 0 };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, total: 0, conPuesto: 0, contestaron: 0, votarian: 0 };
    }
    
    var total = 0;
    var conPuesto = 0;
    var contestaron = 0;
    var votarian = 0;
    
    // Procesar en bloques
    var BLOQUE = 5000;
    
    for (var inicio = 2; inicio <= ultimaFila; inicio += BLOQUE) {
      var fin = Math.min(inicio + BLOQUE - 1, ultimaFila);
      var cantidadFilas = fin - inicio + 1;
      
      // Solo columnas necesarias: M(13), O(15), R(18) - índices 12, 14, 17
      var datos = hoja.getRange(inicio, 1, cantidadFilas, 22).getValues();
      
      for (var i = 0; i < datos.length; i++) {
        var fila = datos[i];
        if (!fila[2] && !fila[0]) continue;
        
        total++;
        
        var puesto = (fila[12] || '').toString().trim();
        var contesto = (fila[14] || '').toString().toUpperCase().trim();
        var votaria = (fila[17] || '').toString().toUpperCase().trim();
        
        if (puesto !== '') conPuesto++;
        if (contesto === 'SI') contestaron++;
        if (votaria === 'SI') votarian++;
      }
    }
    
    Logger.log('Total: ' + total + ', ConPuesto: ' + conPuesto + ', Contestaron: ' + contestaron + ', Votarían: ' + votarian);
    
    return {
      success: true,
      total: total,
      conPuesto: conPuesto,
      contestaron: contestaron,
      votarian: votarian
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, total: 0, conPuesto: 0, contestaron: 0, votarian: 0, message: error.toString() };
  }
}

// ========== OBTENER LÍDERES PARA FILTRO ==========
function obtenerLideresParaFiltro() {
  try {
    Logger.log('=== OBTENER LÍDERES PARA FILTRO ===');
    
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, lideres: [] };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, lideres: [] };
    }
    
    var lideresMap = {};
    var BLOQUE = 5000;
    
    for (var inicio = 2; inicio <= ultimaFila; inicio += BLOQUE) {
      var fin = Math.min(inicio + BLOQUE - 1, ultimaFila);
      var cantidadFilas = fin - inicio + 1;
      
      // Solo columnas J y K (índices 9 y 10)
      var datos = hoja.getRange(inicio, 10, cantidadFilas, 2).getValues();
      
      for (var i = 0; i < datos.length; i++) {
        var liderDoc = datos[i][0] ? String(datos[i][0]).trim() : '';
        var liderNombre = datos[i][1] ? String(datos[i][1]).trim() : '';
        
        if (liderDoc && liderNombre && !lideresMap[liderDoc]) {
          lideresMap[liderDoc] = liderNombre;
        }
      }
    }
    
    var lideres = [];
    for (var doc in lideresMap) {
      lideres.push({ documento: doc, nombre: lideresMap[doc] });
    }
    
    // Ordenar por nombre
    lideres.sort(function(a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
    
    Logger.log('Líderes únicos: ' + lideres.length);
    
    return { success: true, lideres: lideres };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, lideres: [], message: error.toString() };
  }
}

// ========== OBTENER MUNICIPIOS PARA FILTRO ==========
function obtenerMunicipiosParaFiltro() {
  try {
    Logger.log('=== OBTENER MUNICIPIOS PARA FILTRO ===');
    
    var ss = SpreadsheetApp.openById(ID_REGISTROS);
    var hoja = ss.getSheetByName('Registros');
    
    if (!hoja) {
      return { success: false, municipios: [] };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, municipios: [] };
    }
    
    var municipiosSet = {};
    var BLOQUE = 5000;
    
    for (var inicio = 2; inicio <= ultimaFila; inicio += BLOQUE) {
      var fin = Math.min(inicio + BLOQUE - 1, ultimaFila);
      var cantidadFilas = fin - inicio + 1;
      
      // Solo columna H (índice 7, columna 8)
      var datos = hoja.getRange(inicio, 8, cantidadFilas, 1).getValues();
      
      for (var i = 0; i < datos.length; i++) {
        var mun = datos[i][0] ? String(datos[i][0]).trim() : '';
        if (mun && !municipiosSet[mun]) {
          municipiosSet[mun] = true;
        }
      }
    }
    
    var municipios = Object.keys(municipiosSet).sort();
    Logger.log('Municipios únicos: ' + municipios.length);
    
    return { success: true, municipios: municipios };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, municipios: [], message: error.toString() };
  }
}
function testBuscarLider() {
  var resultado = buscarLiderOptimizado('75099110');
  Logger.log('Resultado: ' + JSON.stringify(resultado).substring(0, 500));
  Logger.log('Success: ' + resultado.success);
  if (resultado.lider) {
    Logger.log('Líder: ' + resultado.lider.nombre);
    Logger.log('Simpatizantes: ' + resultado.lider.simpatizantes);
  } else {
    Logger.log('Mensaje: ' + resultado.message);
  }
}
// ============================================================================
// FUNCIÓN DE TEST - DIAGNÓSTICO DE COMUNAS
// Agregar al final de Code.gs y ejecutar desde Apps Script
// ============================================================================

function testComunas() {
  try {
    Logger.log('=== TEST DIAGNÓSTICO DE COMUNAS ===');
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      Logger.log('ERROR: Hoja BD-lideres no encontrada');
      return;
    }
    
    var ultimaFila = hoja.getLastRow();
    Logger.log('Total filas: ' + ultimaFila);
    
    // ★ CORREGIDO: Columna AO (41) es comuna, no 42 (AP)
    var datosComuna = hoja.getRange(2, 41, ultimaFila - 1, 1).getValues();
    
    var conteo = {};
    var ejemplos = {};
    
    for (var i = 0; i < datosComuna.length; i++) {
      var comuna = datosComuna[i][0] ? String(datosComuna[i][0]).trim() : '(VACÍO)';
      
      if (!conteo[comuna]) {
        conteo[comuna] = 0;
        ejemplos[comuna] = i + 2;
      }
      conteo[comuna]++;
    }
    
    Logger.log('');
    Logger.log('=== VALORES ÚNICOS DE COMUNA (Columna AO) ===');
    
    var ordenado = Object.keys(conteo).sort(function(a, b) {
      return conteo[b] - conteo[a];
    });
    
    for (var j = 0; j < ordenado.length; j++) {
      var valor = ordenado[j];
      Logger.log('"' + valor + '": ' + conteo[valor] + ' registros (ej: fila ' + ejemplos[valor] + ')');
    }
    
    Logger.log('');
    Logger.log('=== PRIMEROS 10 REGISTROS CON COMUNA ===');
    
    // ★ CORREGIDO: 41 columnas, no 42
    var datosCompletos = hoja.getRange(2, 1, Math.min(20, ultimaFila - 1), 41).getValues();
    var mostrados = 0;
    
    for (var k = 0; k < datosCompletos.length && mostrados < 10; k++) {
      var nombre = datosCompletos[k][2] || '';
      // ★ CORREGIDO: índice 40, no 41
      var comunaVal = datosCompletos[k][40] || '(vacío)';
      
      if (comunaVal && comunaVal !== '(vacío)') {
        Logger.log('Fila ' + (k + 2) + ': ' + nombre + ' -> Comuna: "' + comunaVal + '"');
        mostrados++;
      }
    }
    
    Logger.log('');
    Logger.log('=== TEST FINALIZADO ===');
    
    return {
      success: true,
      totalRegistros: ultimaFila - 1,
      valoresUnicos: conteo
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}


// ============================================================================
// FUNCIÓN PARA LLAMAR DESDE EL FRONTEND (HTML)
// ============================================================================

function diagnosticoComunasWrapper() {
  try {
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    var ultimaFila = hoja.getLastRow();
    // ★ CORREGIDO: Columna AO (41) es comuna, no 42 (AP)
    var datosComuna = hoja.getRange(2, 41, ultimaFila - 1, 1).getValues();
    
    var conteo = {};
    
    for (var i = 0; i < datosComuna.length; i++) {
      var comuna = datosComuna[i][0] ? String(datosComuna[i][0]).trim() : '(VACÍO)';
      conteo[comuna] = (conteo[comuna] || 0) + 1;
    }
    
    return {
      success: true,
      total: ultimaFila - 1,
      comunas: conteo
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
function previaNormalizarDeportes() {
  try {
    Logger.log('=== PREVIA NORMALIZACIÓN DE DEPORTES ===');
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, message: 'No hay registros', cambios: [], resumen: {} };
    }
    
    // Leer columna X (24) = Deporte y columna C (3) = Nombre, columna E (5) = Documento
    var datos = hoja.getRange(2, 1, ultimaFila - 1, 42).getValues();
    
    var cambios = [];
    var valoresOriginales = {};
    var valoresNormalizados = {};
    
    for (var i = 0; i < datos.length; i++) {
      var nombre = datos[i][2] ? String(datos[i][2]).trim() : '';
      var documento = datos[i][4] ? String(datos[i][4]).trim() : '';
      var deporteOriginal = datos[i][23] ? String(datos[i][23]).trim() : '';
      
      if (!deporteOriginal || deporteOriginal === '') continue;
      
      // Contar valor original
      var origKey = deporteOriginal.toUpperCase();
      valoresOriginales[origKey] = (valoresOriginales[origKey] || 0) + 1;
      
      var deporteNormalizado = normalizarDeporte(deporteOriginal);
      
      // Contar valor normalizado
      valoresNormalizados[deporteNormalizado] = (valoresNormalizados[deporteNormalizado] || 0) + 1;
      
      if (deporteOriginal !== deporteNormalizado) {
        cambios.push({
          fila: i + 2,
          nombre: nombre,
          documento: documento,
          original: deporteOriginal,
          normalizado: deporteNormalizado
        });
      }
    }
    
    // Ordenar valores originales por frecuencia
    var distribucionOriginal = [];
    for (var key in valoresOriginales) {
      distribucionOriginal.push({ valor: key, cantidad: valoresOriginales[key] });
    }
    distribucionOriginal.sort(function(a, b) { return b.cantidad - a.cantidad; });
    
    var distribucionNormalizada = [];
    for (var key2 in valoresNormalizados) {
      distribucionNormalizada.push({ valor: key2, cantidad: valoresNormalizados[key2] });
    }
    distribucionNormalizada.sort(function(a, b) { return b.cantidad - a.cantidad; });
    
    Logger.log('Total cambios necesarios: ' + cambios.length);
    Logger.log('Valores únicos originales: ' + distribucionOriginal.length);
    Logger.log('Valores únicos normalizados: ' + distribucionNormalizada.length);
    
    return {
      success: true,
      totalRegistros: ultimaFila - 1,
      totalConDeporte: Object.keys(valoresOriginales).length > 0 ? 
        distribucionOriginal.reduce(function(s, v) { return s + v.cantidad; }, 0) : 0,
      cambiosNecesarios: cambios.length,
      cambios: cambios.slice(0, 100), // Máximo 100 para no saturar
      distribucionOriginal: distribucionOriginal,
      distribucionNormalizada: distribucionNormalizada
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Aplica la normalización de deportes en la base de datos
 */
function aplicarNormalizacionDeportes() {
  try {
    Logger.log('=== APLICANDO NORMALIZACIÓN DE DEPORTES ===');
    var inicio = new Date().getTime();
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, message: 'No hay registros para normalizar', cambios: 0 };
    }
    
    // Leer columna X (24) = Deporte
    var deportes = hoja.getRange(2, 24, ultimaFila - 1, 1).getValues();
    
    var cambios = 0;
    var deportesNormalizados = [];
    var hayCambios = false;
    
    for (var i = 0; i < deportes.length; i++) {
      var deporteOriginal = deportes[i][0] ? String(deportes[i][0]).trim() : '';
      
      if (!deporteOriginal || deporteOriginal === '') {
        deportesNormalizados.push([deporteOriginal]);
        continue;
      }
      
      var deporteNormalizado = normalizarDeporte(deporteOriginal);
      deportesNormalizados.push([deporteNormalizado]);
      
      if (deporteOriginal !== deporteNormalizado) {
        cambios++;
        hayCambios = true;
      }
    }
    
    // Escribir todos los valores normalizados de una vez (más eficiente)
    if (hayCambios && deportesNormalizados.length > 0) {
      hoja.getRange(2, 24, deportesNormalizados.length, 1).setValues(deportesNormalizados);
      Logger.log('Valores escritos en la hoja');
    }
    
    var fin = new Date().getTime();
    
    Logger.log('Normalización completada. Cambios: ' + cambios);
    
    return {
      success: true,
      message: 'Normalización completada exitosamente',
      cambios: cambios,
      totalProcesados: deportes.length,
      tiempoMs: fin - inicio
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Función auxiliar que normaliza un valor individual de deporte
 * @param {string} deporte - Valor original del deporte
 * @returns {string} - Valor normalizado
 */
function normalizarDeporte(deporte) {
  if (!deporte || deporte === '') return '';
  
  // Paso 1: Limpiar espacios y convertir a mayúsculas
  var valor = deporte.toString().trim().toUpperCase();
  
  // Paso 2: Eliminar espacios múltiples
  valor = valor.replace(/\s+/g, ' ');
  
  // Paso 3: Eliminar caracteres especiales innecesarios al inicio/final
  valor = valor.replace(/^[,.\-;:]+|[,.\-;:]+$/g, '').trim();
  
  // Paso 4: Diccionario de normalización (variantes comunes → valor estándar)
  var diccionario = {
    // Fútbol
    'FUTBOL': 'FÚTBOL', 'FUTBALL': 'FÚTBOL', 'FURBOL': 'FÚTBOL', 'FULBOL': 'FÚTBOL',
    'FUBOL': 'FÚTBOL', 'FUTBOOL': 'FÚTBOL', 'FUTOL': 'FÚTBOL', 'FOOTBALL': 'FÚTBOL',
    'MICRO FUTBOL': 'MICROFÚTBOL', 'MICRO FÚTBOL': 'MICROFÚTBOL', 'MICROFUTBOL': 'MICROFÚTBOL',
    'MICRO': 'MICROFÚTBOL', 'FUTBOL SALA': 'FÚTBOL SALA', 'FUTSAL': 'FÚTBOL SALA',
    'FUTBOL DE SALON': 'FÚTBOL SALA', 'FÚTBOL DE SALÓN': 'FÚTBOL SALA',
    
    // Baloncesto
    'BASQUETBOL': 'BALONCESTO', 'BASQUET': 'BALONCESTO', 'BASKETBALL': 'BALONCESTO',
    'BASKET': 'BALONCESTO', 'BASQUETBALL': 'BALONCESTO', 'BASQUETT': 'BALONCESTO',
    'BALONCCESTO': 'BALONCESTO', 'BALOCESTO': 'BALONCESTO',
    
    // Voleibol
    'VOLEYBOL': 'VOLEIBOL', 'VOLLEYBALL': 'VOLEIBOL', 'VOLEY': 'VOLEIBOL',
    'VOLIBOL': 'VOLEIBOL', 'VOLLEY': 'VOLEIBOL', 'BOLEIBOL': 'VOLEIBOL',
    'BOLEYVOL': 'VOLEIBOL', 'VOLEIBALL': 'VOLEIBOL',
    
    // Ciclismo
    'CICLIMO': 'CICLISMO', 'BICICLETA': 'CICLISMO', 'CICILISMO': 'CICLISMO',
    'BICI': 'CICLISMO', 'CICLSMO': 'CICLISMO', 'CYCLING': 'CICLISMO',
    'CICLO MONTAÑISMO': 'CICLOMONTAÑISMO', 'CICLO MONTANISMO': 'CICLOMONTAÑISMO',
    'CICLOMONTANISMO': 'CICLOMONTAÑISMO', 'MTB': 'CICLOMONTAÑISMO',
    
    // Natación
    'NATACION': 'NATACIÓN', 'NATACIÒN': 'NATACIÓN', 'NATCION': 'NATACIÓN',
    'SWIMMING': 'NATACIÓN', 'NADACION': 'NATACIÓN',
    
    // Atletismo
    'ATLETIMO': 'ATLETISMO', 'ATLESTISMO': 'ATLETISMO',
    
    // Gimnasio / Gym
    'GYM': 'GIMNASIO', 'GIMNACIA': 'GIMNASIO', 'GYMNASIA': 'GIMNASIO',
    'GIMNACIO': 'GIMNASIO', 'GYMASIO': 'GIMNASIO', 'PESAS': 'GIMNASIO',
    'CROSSFIT': 'CROSSFIT', 'CROSS FIT': 'CROSSFIT',
    
    // Caminata / Senderismo
    'CAMINATAS': 'CAMINATA', 'SENDERISMO': 'CAMINATA', 'TREKKING': 'CAMINATA',
    'HIKING': 'CAMINATA', 'CAMINAR': 'CAMINATA',
    
    // Trotar / Running
    'TROTE': 'TROTAR', 'RUNNING': 'TROTAR', 'CORRER': 'TROTAR',
    
    // Artes marciales
    'KARATE': 'KARATE', 'JUDO': 'JUDO', 'TAEKWONDO': 'TAEKWONDO',
    'TAEKUONDO': 'TAEKWONDO', 'TAE KWON DO': 'TAEKWONDO', 'TAIKONDO': 'TAEKWONDO',
    'ARTES MARCIALES': 'ARTES MARCIALES', 'BOXEO': 'BOXEO', 'BOX': 'BOXEO',
    'KICK BOXING': 'KICKBOXING', 'KICK-BOXING': 'KICKBOXING', 'MMA': 'ARTES MARCIALES MIXTAS',
    
    // Tenis
    'TENNIS': 'TENIS', 'TENIS DE MESA': 'TENIS DE MESA', 'PING PONG': 'TENIS DE MESA',
    'PINGPONG': 'TENIS DE MESA',
    
    // Patinaje
    'PATINAR': 'PATINAJE', 'SKATING': 'PATINAJE',
    
    // Ninguno
    'NINGUNO': 'NINGUNO', 'NINGUNA': 'NINGUNO', 'NO': 'NINGUNO',
    'NO PRACTICA': 'NINGUNO', 'N/A': 'NINGUNO', 'NA': 'NINGUNO',
    'NO APLICA': 'NINGUNO', 'NINGUN': 'NINGUNO', 'NADA': 'NINGUNO',
    'NO PRACTICO': 'NINGUNO', 'NO PRÁCTICO': 'NINGUNO', 'SEDENTARIO': 'NINGUNO',
    
    // Yoga / Pilates
    'YOGA': 'YOGA', 'PILATES': 'PILATES',
    
    // Otros
    'BILLAR': 'BILLAR', 'AJEDREZ': 'AJEDREZ', 'SQUASH': 'SQUASH',
    'GOLF': 'GOLF', 'BÉISBOL': 'BÉISBOL', 'BEISBOL': 'BÉISBOL', 'BASEBALL': 'BÉISBOL',
    'SOFTBOL': 'SOFTBOL', 'SOFTBALL': 'SOFTBOL',
    'EQUITACIÓN': 'EQUITACIÓN', 'EQUITACION': 'EQUITACIÓN', 'CABALGATA': 'EQUITACIÓN',
    'ESCALADA': 'ESCALADA', 'RUGBY': 'RUGBY'
  };
  
  // Paso 5: Verificar coincidencia exacta primero
  if (diccionario[valor]) {
    return diccionario[valor];
  }
  
  // Paso 6: Si contiene múltiples deportes separados por coma, slash, "y", normalizar cada uno
  var separadores = /[,\/;]+|\s+y\s+|\s+e\s+/i;
  if (separadores.test(valor)) {
    var partes = valor.split(separadores);
    var partesNormalizadas = [];
    
    for (var i = 0; i < partes.length; i++) {
      var parte = partes[i].trim();
      if (parte === '') continue;
      
      if (diccionario[parte]) {
        partesNormalizadas.push(diccionario[parte]);
      } else {
        // Aplicar correcciones de tildes básicas
        partesNormalizadas.push(corregirTildesDeporte(parte));
      }
    }
    
    // Eliminar duplicados
    var unicos = [];
    var vistos = {};
    for (var j = 0; j < partesNormalizadas.length; j++) {
      if (!vistos[partesNormalizadas[j]]) {
        vistos[partesNormalizadas[j]] = true;
        unicos.push(partesNormalizadas[j]);
      }
    }
    
    return unicos.join(', ');
  }
  
  // Paso 7: Correcciones de tildes para valores no encontrados en diccionario
  return corregirTildesDeporte(valor);
}

/**
 * Corrige tildes comunes en nombres de deportes
 */
function corregirTildesDeporte(valor) {
  var correcciones = {
    'FUTBOL': 'FÚTBOL',
    'NATACION': 'NATACIÓN',
    'EQUITACION': 'EQUITACIÓN',
    'BASQUETBOL': 'BALONCESTO'
  };
  
  return correcciones[valor] || valor;
}


// ========== 2. AUDITORÍA DE CAMPOS VACÍOS DE LÍDERES ==========

/**
 * Obtiene el reporte de campos vacíos por líder
 * Retorna líderes con información incompleta y qué campos les falta
 * @param {string} filtroClasificacion - Opcional: 'critico', 'incompleto', 'bueno', 'todos'
 * @returns {Object} Resultado con líderes y campos vacíos
 */
function obtenerCamposVaciosLideres(filtroClasificacion) {
  try {
    Logger.log('=== AUDITORÍA DE CAMPOS VACÍOS ===');
    var inicio = new Date().getTime();
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, message: 'No hay registros', lideres: [], resumen: {} };
    }
    
    // ★ CORREGIDO: 41 columnas (A-AO), no 42
    var datos = hoja.getRange(2, 1, ultimaFila - 1, 41).getValues();
    
    var camposAuditables = [
      { indice: 2,  columna: 'C',  nombre: 'Nombre',              clave: 'nombre',            requerido: true },
      { indice: 4,  columna: 'E',  nombre: 'Documento',           clave: 'documento',         requerido: true },
      { indice: 5,  columna: 'F',  nombre: 'Fecha Nacimiento',    clave: 'fechaNacimiento',   requerido: false },
      { indice: 6,  columna: 'G',  nombre: 'Celular',             clave: 'celular',           requerido: true },
      { indice: 7,  columna: 'H',  nombre: 'Dirección',           clave: 'direccion',         requerido: false },
      { indice: 8,  columna: 'I',  nombre: 'Barrio',              clave: 'barrio',            requerido: false },
      { indice: 9,  columna: 'J',  nombre: 'Correo',              clave: 'correo',            requerido: false },
      { indice: 10, columna: 'K',  nombre: 'Profesión',           clave: 'profesion',         requerido: false },
      { indice: 11, columna: 'L',  nombre: 'Entidad',             clave: 'entidad',           requerido: false },
      { indice: 12, columna: 'M',  nombre: 'Cargo',               clave: 'cargo',             requerido: false },
      { indice: 13, columna: 'N',  nombre: 'Tipo Vinculación',    clave: 'tipoVinculacion',   requerido: false },
      { indice: 20, columna: 'U',  nombre: 'Estudios',            clave: 'estudios',          requerido: false },
      { indice: 21, columna: 'V',  nombre: 'Número Hijos',        clave: 'numeroHijos',       requerido: false },
      { indice: 23, columna: 'X',  nombre: 'Deporte',             clave: 'deporte',           requerido: false },
      { indice: 28, columna: 'AC', nombre: 'Municipio',           clave: 'municipio',         requerido: false },
      // ★ CORREGIDO: índice 40 = columna AO (no 41 = AP)
      { indice: 40, columna: 'AO', nombre: 'Comuna',              clave: 'comuna',            requerido: false }
    ];
    
    var totalCampos = camposAuditables.length;
    var lideres = [];
    var conteoGlobalVacios = {};
    
    camposAuditables.forEach(function(c) {
      conteoGlobalVacios[c.clave] = 0;
    });
    
    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      var nombre = fila[2] ? String(fila[2]).trim() : '';
      var documento = fila[4] ? String(fila[4]).trim() : '';
      
      if (!nombre && !documento) continue;
      
      var camposVacios = [];
      var camposLlenos = 0;
      
      for (var j = 0; j < camposAuditables.length; j++) {
        var campo = camposAuditables[j];
        var valor = fila[campo.indice] ? String(fila[campo.indice]).trim() : '';
        
        if (!valor || valor === '' || valor === '0' || valor === 'undefined' || valor === 'null') {
          camposVacios.push({
            campo: campo.nombre,
            clave: campo.clave,
            columna: campo.columna,
            requerido: campo.requerido
          });
          conteoGlobalVacios[campo.clave]++;
        } else {
          camposLlenos++;
        }
      }
      
      if (camposVacios.length === 0) continue;
      
      var porcentajeCompletado = Math.round((camposLlenos / totalCampos) * 100);
      var clasificacion = '';
      
      if (porcentajeCompletado >= 80) {
        clasificacion = 'bueno';
      } else if (porcentajeCompletado >= 50) {
        clasificacion = 'incompleto';
      } else {
        clasificacion = 'critico';
      }
      
      if (filtroClasificacion && filtroClasificacion !== 'todos' && filtroClasificacion !== clasificacion) {
        continue;
      }
      
      lideres.push({
        idx: i + 2,
        nombre: nombre || '(SIN NOMBRE)',
        documento: documento || '(SIN DOCUMENTO)',
        celular: fila[6] ? String(fila[6]).trim() : '',
        entidad: fila[11] ? String(fila[11]).trim() : '',
        camposVacios: camposVacios,
        cantidadVacios: camposVacios.length,
        cantidadLlenos: camposLlenos,
        porcentajeCompletado: porcentajeCompletado,
        clasificacion: clasificacion
      });
    }
    
    lideres.sort(function(a, b) {
      return b.cantidadVacios - a.cantidadVacios;
    });
    
    var resumenCampos = [];
    for (var k = 0; k < camposAuditables.length; k++) {
      var c = camposAuditables[k];
      resumenCampos.push({
        campo: c.nombre,
        clave: c.clave,
        vacios: conteoGlobalVacios[c.clave],
        porcentajeVacio: datos.length > 0 ? Math.round((conteoGlobalVacios[c.clave] / datos.length) * 100) : 0,
        requerido: c.requerido
      });
    }
    
    resumenCampos.sort(function(a, b) { return b.vacios - a.vacios; });
    
    var totalLideres = datos.filter(function(f) { return f[2] || f[4]; }).length;
    var lideresCompletos = totalLideres - lideres.length;
    var criticos = lideres.filter(function(l) { return l.clasificacion === 'critico'; }).length;
    var incompletos = lideres.filter(function(l) { return l.clasificacion === 'incompleto'; }).length;
    var buenos = lideres.filter(function(l) { return l.clasificacion === 'bueno'; }).length;
    
    var fin = new Date().getTime();
    
    Logger.log('Auditoría completada. Líderes con campos vacíos: ' + lideres.length);
    
    return {
      success: true,
      lideres: lideres.slice(0, 200),
      totalLideres: totalLideres,
      lideresConVacios: lideres.length,
      lideresCompletos: lideresCompletos,
      resumenCampos: resumenCampos,
      resumenClasificacion: {
        criticos: criticos,
        incompletos: incompletos,
        buenos: buenos,
        completos: lideresCompletos
      },
      tiempoMs: fin - inicio
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza un campo específico de un líder
 * @param {number} rowIndex - Índice de fila en la hoja (base 1)
 * @param {string} clave - Clave del campo a actualizar
 * @param {string} valor - Nuevo valor
 * @returns {Object} Resultado de la operación
 */
function actualizarCampoLider(rowIndex, clave, valor) {
  try {
    Logger.log('=== ACTUALIZAR CAMPO LÍDER ===');
    Logger.log('Fila: ' + rowIndex + ', Campo: ' + clave + ', Valor: ' + valor);
    
    if (!rowIndex || rowIndex < 2) {
      return { success: false, message: 'Índice de fila inválido' };
    }
    
    if (!clave) {
      return { success: false, message: 'Campo no especificado' };
    }
    
    var mapeoColumnas = {
      'nombre':          3,
      'documento':       5,
      'fechaNacimiento': 6,
      'celular':         7,
      'direccion':       8,
      'barrio':          9,
      'correo':          10,
      'profesion':       11,
      'entidad':         12,
      'cargo':           13,
      'tipoVinculacion': 14,
      'estudios':        21,
      'numeroHijos':     22,
      'deporte':         24,
      'municipio':       29,
      // ★ CORREGIDO: comuna en columna 41 (AO), no 42 (AP)
      'comuna':          41
    };
    
    var columna = mapeoColumnas[clave];
    if (!columna) {
      return { success: false, message: 'Campo no reconocido: ' + clave };
    }
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var valorFinal = valor;
    if (clave === 'deporte' && valor) {
      valorFinal = normalizarDeporte(valor);
    }
    
    hoja.getRange(rowIndex, columna).setValue(valorFinal);
    
    // ★ CORREGIDO: Auditoría solo en col 40 (AN), col 41 (AO) = Comuna NO se sobrescribe
    hoja.getRange(rowIndex, 40).setValue('ADMIN-AUDITORIA - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm'));
    
    Logger.log('Campo actualizado exitosamente');
    
    return {
      success: true,
      message: 'Campo "' + clave + '" actualizado correctamente',
      fila: rowIndex,
      campo: clave,
      valor: valorFinal
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza múltiples campos de un líder de una vez
 * @param {number} rowIndex - Índice de fila
 * @param {Object} campos - Objeto con clave:valor de los campos a actualizar
 * @returns {Object} Resultado de la operación
 */
function actualizarMultiplesCamposLider(rowIndex, campos) {
  try {
    Logger.log('=== ACTUALIZAR MÚLTIPLES CAMPOS ===');
    Logger.log('Fila: ' + rowIndex + ', Campos: ' + JSON.stringify(campos));
    
    if (!rowIndex || rowIndex < 2) {
      return { success: false, message: 'Índice de fila inválido' };
    }
    
    if (!campos || Object.keys(campos).length === 0) {
      return { success: false, message: 'No se proporcionaron campos para actualizar' };
    }
    
    var mapeoColumnas = {
      'nombre':          3,
      'documento':       5,
      'fechaNacimiento': 6,
      'celular':         7,
      'direccion':       8,
      'barrio':          9,
      'correo':          10,
      'profesion':       11,
      'entidad':         12,
      'cargo':           13,
      'tipoVinculacion': 14,
      'estudios':        21,
      'numeroHijos':     22,
      'deporte':         24,
      'municipio':       29,
      // ★ CORREGIDO: comuna en columna 41 (AO), no 42 (AP)
      'comuna':          41
    };
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var actualizados = [];
    var errores = [];
    
    for (var clave in campos) {
      if (!campos.hasOwnProperty(clave)) continue;
      
      var columna = mapeoColumnas[clave];
      if (!columna) {
        errores.push('Campo no reconocido: ' + clave);
        continue;
      }
      
      var valor = campos[clave];
      
      if (clave === 'deporte' && valor) {
        valor = normalizarDeporte(valor);
      }
      
      if (clave !== 'correo' && clave !== 'fechaNacimiento' && clave !== 'numeroHijos' && typeof valor === 'string') {
        valor = valor.toUpperCase().trim();
      }
      
      hoja.getRange(rowIndex, columna).setValue(valor);
      actualizados.push(clave);
    }
    
    // ★ CORREGIDO: Auditoría solo en col 40 (AN), col 41 (AO) = Comuna NO se sobrescribe
    hoja.getRange(rowIndex, 40).setValue('ADMIN-AUDITORIA - ' + Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm'));
    
    Logger.log('Campos actualizados: ' + actualizados.join(', '));
    
    return {
      success: true,
      message: 'Se actualizaron ' + actualizados.length + ' campo(s)',
      actualizados: actualizados,
      errores: errores
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene los datos completos de un líder para el formulario de edición
 * @param {number} rowIndex - Índice de fila
 * @returns {Object} Datos del líder con todos los campos auditables
 */
function obtenerLiderParaEdicion(rowIndex) {
  try {
    Logger.log('=== OBTENER LÍDER PARA EDICIÓN - Fila: ' + rowIndex + ' ===');
    
    if (!rowIndex || rowIndex < 2) {
      return { success: false, message: 'Índice de fila inválido' };
    }
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    // ★ CORREGIDO: 41 columnas (A-AO), no 42
    var fila = hoja.getRange(rowIndex, 1, 1, 41).getValues()[0];
    
    var fechaNac = '';
    if (fila[5]) {
      try {
        var f = new Date(fila[5]);
        if (!isNaN(f.getTime())) {
          fechaNac = Utilities.formatDate(f, 'America/Bogota', 'yyyy-MM-dd');
        }
      } catch(e) {
        fechaNac = String(fila[5]);
      }
    }
    
    var lider = {
      idx: rowIndex,
      nombre: fila[2] ? String(fila[2]).trim() : '',
      documento: fila[4] ? String(fila[4]).trim() : '',
      fechaNacimiento: fechaNac,
      celular: fila[6] ? String(fila[6]).trim() : '',
      direccion: fila[7] ? String(fila[7]).trim() : '',
      barrio: fila[8] ? String(fila[8]).trim() : '',
      correo: fila[9] ? String(fila[9]).trim() : '',
      profesion: fila[10] ? String(fila[10]).trim() : '',
      entidad: fila[11] ? String(fila[11]).trim() : '',
      cargo: fila[12] ? String(fila[12]).trim() : '',
      tipoVinculacion: fila[13] ? String(fila[13]).trim() : '',
      estudios: fila[20] ? String(fila[20]).trim() : '',
      numeroHijos: fila[21] ? String(fila[21]).trim() : '',
      deporte: fila[23] ? String(fila[23]).trim() : '',
      municipio: fila[28] ? String(fila[28]).trim() : '',
      // ★ CORREGIDO: índice 40 = columna AO (no 41 = AP)
      comuna: fila[40] ? String(fila[40]).trim() : ''
    };
    
    var camposVacios = [];
    for (var clave in lider) {
      if (clave === 'idx') continue;
      if (!lider[clave] || lider[clave] === '') {
        camposVacios.push(clave);
      }
    }
    
    lider.camposVacios = camposVacios;
    lider.porcentajeCompletado = Math.round(((Object.keys(lider).length - 2 - camposVacios.length) / (Object.keys(lider).length - 2)) * 100);
    
    Logger.log('Líder obtenido: ' + lider.nombre + ', Campos vacíos: ' + camposVacios.length);
    
    return { success: true, lider: lider };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


// ========== FUNCIONES DE TEST ==========

function testPreviaNormalizarDeportes() {
  Logger.log('=== TEST PREVIA NORMALIZACIÓN ===');
  var resultado = previaNormalizarDeportes();
  Logger.log('Success: ' + resultado.success);
  Logger.log('Total con deporte: ' + resultado.totalConDeporte);
  Logger.log('Cambios necesarios: ' + resultado.cambiosNecesarios);
  if (resultado.distribucionOriginal) {
    Logger.log('Distribución original:');
    resultado.distribucionOriginal.slice(0, 10).forEach(function(d) {
      Logger.log('  "' + d.valor + '": ' + d.cantidad);
    });
  }
  if (resultado.cambios && resultado.cambios.length > 0) {
    Logger.log('Primeros cambios:');
    resultado.cambios.slice(0, 5).forEach(function(c) {
      Logger.log('  ' + c.nombre + ': "' + c.original + '" → "' + c.normalizado + '"');
    });
  }
  return resultado;
}

function testAuditoriaCamposVacios() {
  Logger.log('=== TEST AUDITORÍA CAMPOS VACÍOS ===');
  var resultado = obtenerCamposVaciosLideres('todos');
  Logger.log('Success: ' + resultado.success);
  Logger.log('Total líderes: ' + resultado.totalLideres);
  Logger.log('Con campos vacíos: ' + resultado.lideresConVacios);
  Logger.log('Completos: ' + resultado.lideresCompletos);
  
  if (resultado.resumenCampos) {
    Logger.log('Campos más vacíos:');
    resultado.resumenCampos.slice(0, 5).forEach(function(c) {
      Logger.log('  ' + c.campo + ': ' + c.vacios + ' vacíos (' + c.porcentajeVacio + '%)');
    });
  }
  
  if (resultado.lideres && resultado.lideres.length > 0) {
    Logger.log('Líderes más incompletos:');
    resultado.lideres.slice(0, 3).forEach(function(l) {
      Logger.log('  ' + l.nombre + ' (' + l.documento + '): ' + l.cantidadVacios + ' campos vacíos, ' + l.porcentajeCompletado + '% completo');
      Logger.log('    Falta: ' + l.camposVacios.map(function(c) { return c.campo; }).join(', '));
    });
  }
  
  return resultado;
}

// ================================================================
// TRIGGER AUTOMÁTICO - NORMALIZACIÓN AL GUARDAR/EDITAR LÍDERES
// Agregar al final del archivo Code.gs existente
// ================================================================

/**
 * Trigger que se ejecuta automáticamente cuando se edita la hoja BD-lideres
 * Normaliza el campo de deporte si fue modificado
 * @param {Object} e - Evento de edición
 */
function onEditBDLideres(e) {
  try {
    // Verificar que el evento existe
    if (!e || !e.range) return;
    
    var hoja = e.range.getSheet();
    var nombreHoja = hoja.getName();
    
    // Solo procesar si es la hoja BD-lideres
    if (nombreHoja !== 'BD-lideres') return;
    
    var fila = e.range.getRow();
    var columna = e.range.getColumn();
    
    // Ignorar fila de encabezados
    if (fila < 2) return;
    
    // Columna X (24) = Deporte - normalizar automáticamente
    if (columna === 24) {
      var valorOriginal = e.range.getValue();
      if (valorOriginal && valorOriginal !== '') {
        var valorNormalizado = normalizarDeporte(String(valorOriginal));
        if (valorOriginal !== valorNormalizado) {
          e.range.setValue(valorNormalizado);
          Logger.log('Deporte normalizado automáticamente: "' + valorOriginal + '" → "' + valorNormalizado + '"');
        }
      }
    }
    
    // También puedes agregar normalización para otros campos aquí
    // Por ejemplo, convertir a mayúsculas ciertos campos
    var columnasAMayusculas = [3, 7, 8, 9, 11, 12, 13]; // Nombre, Dirección, Barrio, etc.
    if (columnasAMayusculas.indexOf(columna) !== -1) {
      var valor = e.range.getValue();
      if (valor && typeof valor === 'string') {
        var valorMayus = valor.toUpperCase().trim();
        if (valor !== valorMayus) {
          e.range.setValue(valorMayus);
        }
      }
    }
    
  } catch (error) {
    Logger.log('Error en onEditBDLideres: ' + error.toString());
  }
}

/**
 * Función para instalar el trigger de edición automática
 * EJECUTAR UNA SOLA VEZ desde el editor de Apps Script
 */
function instalarTriggerEdicion() {
  // Eliminar triggers anteriores del mismo tipo para evitar duplicados
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onEditBDLideres') {
      ScriptApp.deleteTrigger(triggers[i]);
      Logger.log('Trigger anterior eliminado');
    }
  }
  
  // Crear nuevo trigger
  ScriptApp.newTrigger('onEditBDLideres')
    .forSpreadsheet(ID_SEGUIMIENTO_GT)
    .onEdit()
    .create();
  
  Logger.log('✅ Trigger de edición instalado correctamente');
  return { success: true, message: 'Trigger instalado. La normalización ahora es automática.' };
}

/**
 * Función para desinstalar el trigger si ya no se necesita
 */
function desinstalarTriggerEdicion() {
  var triggers = ScriptApp.getProjectTriggers();
  var eliminados = 0;
  
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onEditBDLideres') {
      ScriptApp.deleteTrigger(triggers[i]);
      eliminados++;
    }
  }
  
  Logger.log('Triggers eliminados: ' + eliminados);
  return { success: true, message: 'Se eliminaron ' + eliminados + ' trigger(s)' };
}


// ================================================================
// WRAPPER PARA FUNCIONES DE GUARDADO EXISTENTES
// Usar estas funciones en lugar de las originales para normalización automática
// ================================================================

/**
 * Guarda datos de líder CON normalización automática
 * Llama a esta función desde el frontend en lugar de la original
 * @param {Object} datos - Datos del líder a guardar
 * @returns {Object} Resultado de la operación
 */
function guardarLiderConNormalizacion(datos) {
  try {
    // Normalizar deporte antes de guardar
    if (datos.deporte) {
      datos.deporte = normalizarDeporte(datos.deporte);
    }
    
    // Convertir campos de texto a mayúsculas
    var camposAMayusculas = ['nombre', 'direccion', 'barrio', 'profesion', 'entidad', 'cargo', 'municipio', 'comuna'];
    for (var i = 0; i < camposAMayusculas.length; i++) {
      var campo = camposAMayusculas[i];
      if (datos[campo] && typeof datos[campo] === 'string') {
        datos[campo] = datos[campo].toUpperCase().trim();
      }
    }
    
    // Llamar a la función original de guardado
    // NOTA: Reemplaza 'guardarLider' por el nombre de tu función original
    if (typeof guardarLider === 'function') {
      return guardarLider(datos);
    } else if (typeof guardarNuevoLider === 'function') {
      return guardarNuevoLider(datos);
    } else {
      return { success: false, message: 'Función de guardado no encontrada' };
    }
    
  } catch (error) {
    Logger.log('Error en guardarLiderConNormalizacion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza datos de líder CON normalización automática
 * @param {number} rowIndex - Índice de fila
 * @param {Object} campos - Campos a actualizar
 * @returns {Object} Resultado de la operación
 */
function actualizarLiderConNormalizacion(rowIndex, campos) {
  try {
    // Normalizar deporte si está presente
    if (campos.deporte) {
      campos.deporte = normalizarDeporte(campos.deporte);
    }
    
    // Convertir campos de texto a mayúsculas
    var camposAMayusculas = ['nombre', 'direccion', 'barrio', 'profesion', 'entidad', 'cargo', 'municipio', 'comuna'];
    for (var i = 0; i < camposAMayusculas.length; i++) {
      var campo = camposAMayusculas[i];
      if (campos[campo] && typeof campos[campo] === 'string') {
        campos[campo] = campos[campo].toUpperCase().trim();
      }
    }
    
    // Usar la función existente de actualización múltiple
    return actualizarMultiplesCamposLider(rowIndex, campos);
    
  } catch (error) {
    Logger.log('Error en actualizarLiderConNormalizacion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// FUNCIÓN onChange PARA CAMBIOS PROGRAMÁTICOS
// Detecta cambios hechos por código (no solo edición manual)
// ================================================================

/**
 * Trigger onChange - Detecta cualquier cambio en la hoja (incluyendo programáticos)
 * @param {Object} e - Evento de cambio
 */
function onChangeBDLideres(e) {
  try {
    if (!e) return;
    
    // Solo procesar cambios de tipo EDIT o INSERT_ROW
    if (e.changeType !== 'EDIT' && e.changeType !== 'INSERT_ROW') return;
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (!hoja) return;
    
    // Para cambios de tipo INSERT_ROW, normalizar la última fila
    if (e.changeType === 'INSERT_ROW') {
      var ultimaFila = hoja.getLastRow();
      if (ultimaFila > 1) {
        var deporte = hoja.getRange(ultimaFila, 24).getValue();
        if (deporte && deporte !== '') {
          var deporteNormalizado = normalizarDeporte(String(deporte));
          if (deporte !== deporteNormalizado) {
            hoja.getRange(ultimaFila, 24).setValue(deporteNormalizado);
            Logger.log('Deporte normalizado en nueva fila: ' + deporteNormalizado);
          }
        }
      }
    }
    
  } catch (error) {
    Logger.log('Error en onChangeBDLideres: ' + error.toString());
  }
}

/**
 * Instalar trigger onChange (para cambios programáticos)
 * EJECUTAR UNA SOLA VEZ
 */
function instalarTriggerCambio() {
  // Eliminar triggers anteriores
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onChangeBDLideres') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Crear nuevo trigger
  ScriptApp.newTrigger('onChangeBDLideres')
    .forSpreadsheet(ID_SEGUIMIENTO_GT)
    .onChange()
    .create();
  
  Logger.log('✅ Trigger onChange instalado correctamente');
  return { success: true, message: 'Trigger onChange instalado' };
}


// ================================================================
// INSTALAR TODOS LOS TRIGGERS DE UNA VEZ
// ================================================================

/**
 * Instala ambos triggers (onEdit y onChange) de una sola vez
 * EJECUTAR UNA SOLA VEZ desde el editor de Apps Script
 */
function instalarTodosLosTriggers() {
  var resultados = [];
  
  try {
    // Instalar trigger onEdit
    instalarTriggerEdicion();
    resultados.push('✅ Trigger onEdit instalado');
  } catch (e) {
    resultados.push('❌ Error en trigger onEdit: ' + e.toString());
  }
  
  try {
    // Instalar trigger onChange
    instalarTriggerCambio();
    resultados.push('✅ Trigger onChange instalado');
  } catch (e) {
    resultados.push('❌ Error en trigger onChange: ' + e.toString());
  }
  
  Logger.log(resultados.join('\n'));
  
  return {
    success: true,
    message: 'Proceso completado',
    detalles: resultados
  };
}

/**
 * Ver todos los triggers activos del proyecto
 */
function verTriggersActivos() {
  var triggers = ScriptApp.getProjectTriggers();
  var info = [];
  
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    info.push({
      funcion: t.getHandlerFunction(),
      tipo: t.getEventType().toString(),
      id: t.getUniqueId()
    });
  }
  
  Logger.log('Triggers activos: ' + JSON.stringify(info, null, 2));
  return info;
}
// ================================================================
// ELIMINAR LÍDER COMPLETO - AUTOMÁTICO DESDE ADMIN
// Agregar al final del archivo Code.gs existente
// 
// ORDEN: 1) BD-lideres → 2) Registros (simpatizantes)
// 
// Esta función REEMPLAZA a eliminarLiderWrapper para que
// automáticamente elimine también los simpatizantes
// ================================================================

/**
 * FUNCIÓN PRINCIPAL - Reemplaza eliminarLiderWrapper
 * Se ejecuta automáticamente desde el admin cuando se elimina un líder
 * 
 * ORDEN:
 * 1. Elimina el líder de BD-lideres
 * 2. Elimina todos sus simpatizantes de Registros
 * 
 * @param {string} documento - Documento del líder a eliminar
 * @returns {Object} Resultado con detalles de la eliminación
 */
function eliminarLiderWrapper(documento) {
  try {
    Logger.log('=== ELIMINAR LÍDER EN CASCADA ===');
    Logger.log('Documento: ' + documento);
    
    if (!documento) {
      return { success: false, message: 'Documento no proporcionado' };
    }
    
    var simpatizantesEliminados = 0;
    
    // 1. Eliminar simpatizantes
    try {
      var ssRegistro = SpreadsheetApp.openById(ID_HOJA_REGISTRO);
      var hojaRegistro = ssRegistro.getSheetByName('Registros');
      
      if (hojaRegistro && hojaRegistro.getLastRow() > 1) {
        var datosReg = hojaRegistro.getRange(2, 1, hojaRegistro.getLastRow() - 1, 1).getValues();
        for (var i = datosReg.length - 1; i >= 0; i--) {
          if (String(datosReg[i][0]).trim() === String(documento).trim()) {
            hojaRegistro.deleteRow(i + 2);
            simpatizantesEliminados++;
          }
        }
        Logger.log('Simpatizantes eliminados: ' + simpatizantesEliminados);
      }
    } catch(e) {
      Logger.log('Error eliminando simpatizantes: ' + e.toString());
    }
    
    // 2. Eliminar líder de BD-lideres
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    var liderEliminado = false;
    
    if (hoja && hoja.getLastRow() > 1) {
      var docs = hoja.getRange(2, 5, hoja.getLastRow() - 1, 1).getValues();
      for (var j = docs.length - 1; j >= 0; j--) {
        if (String(docs[j][0]).trim() === String(documento).trim()) {
          hoja.deleteRow(j + 2);
          liderEliminado = true;
          Logger.log('Líder eliminado fila: ' + (j + 2));
        }
      }
    }
    
    // 3. Eliminar de hoja Lideres (si existe)
    try {
      var hojaLideres = ss.getSheetByName('Lideres');
      if (hojaLideres && hojaLideres.getLastRow() > 1) {
        var docsL = hojaLideres.getRange(2, 1, hojaLideres.getLastRow() - 1, 1).getValues();
        for (var k = docsL.length - 1; k >= 0; k--) {
          if (String(docsL[k][0]).trim() === String(documento).trim()) {
            hojaLideres.deleteRow(k + 2);
          }
        }
      }
    } catch(e) {
      Logger.log('Error eliminando de hoja Lideres: ' + e.toString());
    }
    
    if (liderEliminado) {
      return { 
        success: true, 
        message: 'Líder eliminado correctamente',
        simpatizantesEliminados: simpatizantesEliminados
      };
    } else {
      return { success: false, message: 'No se encontró el líder con documento ' + documento };
    }
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}



/**
 * Vista previa de eliminación (sin eliminar nada)
 * Para mostrar confirmación al admin antes de eliminar
 * @param {string} documento - Documento del líder
 * @returns {Object} Información de lo que se eliminaría
 */
function previsualizarEliminacionLider(documento) {
  try {
    var resultado = {
      success: false,
      lider: {},
      simpatizantes: [],
      totalSimpatizantes: 0
    };
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hoja = ss.getSheetByName('BD-lideres');
    
    if (hoja && hoja.getLastRow() > 1) {
      var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 41).getValues();
      
      for (var i = 0; i < datos.length; i++) {
        if (String(datos[i][4]).trim() === String(documento).trim()) {
          resultado.lider = {
            nombre: datos[i][2] || '',
            documento: String(datos[i][4]).trim(),
            celular: datos[i][6] || '',
            entidad: datos[i][11] || '',
            comuna: datos[i][40] || ''
          };
          resultado.success = true;
          break;
        }
      }
    }
    
    try {
      var ssReg = SpreadsheetApp.openById(ID_HOJA_REGISTRO);
      var hojaReg = ssReg.getSheetByName('Registros');
      
      if (hojaReg && hojaReg.getLastRow() > 1) {
        var datosReg = hojaReg.getRange(2, 1, hojaReg.getLastRow() - 1, 6).getValues();
        for (var j = 0; j < datosReg.length; j++) {
          if (String(datosReg[j][0]).trim() === String(documento).trim()) {
            resultado.simpatizantes.push({
              nombre: datosReg[j][2] || datosReg[j][1] || '',
              documento: datosReg[j][3] || '',
              celular: datosReg[j][4] || ''
            });
          }
        }
        resultado.totalSimpatizantes = resultado.simpatizantes.length;
      }
    } catch(e) {
      Logger.log('Error buscando simpatizantes: ' + e.toString());
    }
    
    return resultado;
    
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}


// ================================================================
// TEST
// ================================================================

function testPrevisualizarEliminacion() {
  var docPrueba = '1075215691'; // Cambiar por documento real
  var resultado = previsualizarEliminacionLider(docPrueba);
  
  Logger.log('Líder: ' + (resultado.lider ? resultado.lider.nombre : 'No encontrado'));
  Logger.log('Simpatizantes: ' + resultado.totalSimpatizantes);
  Logger.log('Mensaje: ' + resultado.mensaje);
  
  return resultado;
}

function previsualizarSimpatizantesHuerfanos() {
  try {
    Logger.log('=== PREVISUALIZAR SIMPATIZANTES HUÉRFANOS ===');
    var inicio = new Date().getTime();
    
    // 1. Obtener todos los documentos de líderes activos en BD-lideres
    var ssLideres = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ssLideres.getSheetByName('BD-lideres');
    
    if (!hojaLideres) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var datosLideres = hojaLideres.getDataRange().getValues();
    var lideresActivos = {};
    
    // Crear mapa de líderes activos (documento -> nombre)
    for (var i = 1; i < datosLideres.length; i++) {
      var doc = datosLideres[i][4] ? String(datosLideres[i][4]).trim() : '';
      var nombre = datosLideres[i][2] ? String(datosLideres[i][2]).trim() : '';
      if (doc) {
        lideresActivos[doc] = nombre;
      }
    }
    
    Logger.log('Líderes activos en BD-lideres: ' + Object.keys(lideresActivos).length);
    
    // 2. Revisar simpatizantes en Registros
    var ssRegistros = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaRegistros = ssRegistros.getSheetByName('Registros');
    
    if (!hojaRegistros) {
      return { success: false, message: 'Hoja Registros no encontrada' };
    }
    
    var ultimaFila = hojaRegistros.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, message: 'No hay simpatizantes en Registros', huerfanos: 0 };
    }
    
    var datosRegistros = hojaRegistros.getRange(2, 1, ultimaFila - 1, 11).getValues();
    
    // 3. Identificar simpatizantes huérfanos
    var huerfanosPorLider = {};  // documento líder inexistente -> array de simpatizantes
    var totalHuerfanos = 0;
    var totalSimpatizantes = 0;
    
    for (var j = 0; j < datosRegistros.length; j++) {
      var fila = datosRegistros[j];
      var nombreSimp = fila[0] ? String(fila[0]).trim() : '';
      var docSimp = fila[2] ? String(fila[2]).trim() : '';
      var liderDoc = fila[9] ? String(fila[9]).trim() : '';
      var liderNombre = fila[10] ? String(fila[10]).trim() : '';
      
      // Saltar filas vacías
      if (!nombreSimp && !docSimp) continue;
      
      totalSimpatizantes++;
      
      // Si tiene líder asignado pero el líder NO existe en BD-lideres
      if (liderDoc && !lideresActivos[liderDoc]) {
        totalHuerfanos++;
        
        if (!huerfanosPorLider[liderDoc]) {
          huerfanosPorLider[liderDoc] = {
            nombreLider: liderNombre || 'Sin nombre',
            simpatizantes: []
          };
        }
        
        huerfanosPorLider[liderDoc].simpatizantes.push({
          fila: j + 2,
          nombre: nombreSimp,
          documento: docSimp
        });
      }
    }
    
    // 4. Preparar resumen
    var resumenLideres = [];
    for (var docLider in huerfanosPorLider) {
      resumenLideres.push({
        documentoLider: docLider,
        nombreLider: huerfanosPorLider[docLider].nombreLider,
        cantidadSimpatizantes: huerfanosPorLider[docLider].simpatizantes.length,
        simpatizantes: huerfanosPorLider[docLider].simpatizantes.slice(0, 10) // Máximo 10 ejemplos
      });
    }
    
    // Ordenar por cantidad de simpatizantes (mayor primero)
    resumenLideres.sort(function(a, b) {
      return b.cantidadSimpatizantes - a.cantidadSimpatizantes;
    });
    
    var fin = new Date().getTime();
    
    Logger.log('');
    Logger.log('========== RESUMEN ==========');
    Logger.log('Total simpatizantes en Registros: ' + totalSimpatizantes);
    Logger.log('Simpatizantes HUÉRFANOS: ' + totalHuerfanos);
    Logger.log('Líderes inexistentes con simpatizantes: ' + resumenLideres.length);
    Logger.log('');
    
    if (resumenLideres.length > 0) {
      Logger.log('Detalle por líder inexistente:');
      for (var k = 0; k < Math.min(20, resumenLideres.length); k++) {
        var r = resumenLideres[k];
        Logger.log('  - ' + r.nombreLider + ' (' + r.documentoLider + '): ' + r.cantidadSimpatizantes + ' simpatizantes');
      }
      if (resumenLideres.length > 20) {
        Logger.log('  ... y ' + (resumenLideres.length - 20) + ' líderes más');
      }
    }
    
    Logger.log('');
    Logger.log('Tiempo de ejecución: ' + (fin - inicio) + ' ms');
    Logger.log('');
    Logger.log('⚠️ NOTA: Esta función NO eliminó nada.');
    Logger.log('Para eliminar, ejecute: eliminarSimpatizantesHuerfanos()');
    
    return {
      success: true,
      totalSimpatizantes: totalSimpatizantes,
      totalHuerfanos: totalHuerfanos,
      lideresInexistentes: resumenLideres.length,
      detalle: resumenLideres.slice(0, 50), // Máximo 50 para no saturar
      tiempoMs: fin - inicio
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


/**
 * PASO 2: ELIMINAR - Ejecutar después de previsualizar
 * ⚠️ ESTA FUNCIÓN SÍ ELIMINA DATOS - EJECUTAR CON PRECAUCIÓN
 * Elimina todos los simpatizantes cuyos líderes ya no existen
 */
function eliminarSimpatizantesHuerfanos() {
  try {
    Logger.log('=== ELIMINAR SIMPATIZANTES HUÉRFANOS ===');
    Logger.log('⚠️ ADVERTENCIA: Esta función ELIMINARÁ datos');
    var inicio = new Date().getTime();
    
    // 1. Obtener todos los documentos de líderes activos en BD-lideres
    var ssLideres = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ssLideres.getSheetByName('BD-lideres');
    
    if (!hojaLideres) {
      return { success: false, message: 'Hoja BD-lideres no encontrada' };
    }
    
    var datosLideres = hojaLideres.getDataRange().getValues();
    var lideresActivos = {};
    
    for (var i = 1; i < datosLideres.length; i++) {
      var doc = datosLideres[i][4] ? String(datosLideres[i][4]).trim() : '';
      if (doc) {
        lideresActivos[doc] = true;
      }
    }
    
    Logger.log('Líderes activos: ' + Object.keys(lideresActivos).length);
    
    // 2. Identificar filas a eliminar en Registros
    var ssRegistros = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaRegistros = ssRegistros.getSheetByName('Registros');
    
    if (!hojaRegistros) {
      return { success: false, message: 'Hoja Registros no encontrada' };
    }
    
    var ultimaFila = hojaRegistros.getLastRow();
    if (ultimaFila <= 1) {
      return { success: true, message: 'No hay simpatizantes para procesar', eliminados: 0 };
    }
    
    var datosRegistros = hojaRegistros.getRange(2, 1, ultimaFila - 1, 11).getValues();
    
    var filasAEliminar = [];
    var lideresAfectados = {};
    
    for (var j = 0; j < datosRegistros.length; j++) {
      var fila = datosRegistros[j];
      var nombreSimp = fila[0] ? String(fila[0]).trim() : '';
      var docSimp = fila[2] ? String(fila[2]).trim() : '';
      var liderDoc = fila[9] ? String(fila[9]).trim() : '';
      var liderNombre = fila[10] ? String(fila[10]).trim() : '';
      
      // Saltar filas vacías
      if (!nombreSimp && !docSimp) continue;
      
      // Si tiene líder asignado pero el líder NO existe en BD-lideres
      if (liderDoc && !lideresActivos[liderDoc]) {
        filasAEliminar.push(j + 2); // +2 porque empezamos en fila 2
        
        if (!lideresAfectados[liderDoc]) {
          lideresAfectados[liderDoc] = {
            nombre: liderNombre,
            cantidad: 0
          };
        }
        lideresAfectados[liderDoc].cantidad++;
      }
    }
    
    Logger.log('Simpatizantes huérfanos encontrados: ' + filasAEliminar.length);
    Logger.log('Líderes inexistentes afectados: ' + Object.keys(lideresAfectados).length);
    
    if (filasAEliminar.length === 0) {
      Logger.log('✅ No hay simpatizantes huérfanos para eliminar');
      return {
        success: true,
        message: 'No hay simpatizantes huérfanos',
        eliminados: 0
      };
    }
    
    // 3. Eliminar filas de abajo hacia arriba
    filasAEliminar.sort(function(a, b) { return b - a; });
    
    var eliminados = 0;
    var errores = 0;
    
    Logger.log('Iniciando eliminación de ' + filasAEliminar.length + ' registros...');
    
    for (var k = 0; k < filasAEliminar.length; k++) {
      try {
        hojaRegistros.deleteRow(filasAEliminar[k]);
        eliminados++;
        
        // Log de progreso cada 100 registros
        if (eliminados % 100 === 0) {
          Logger.log('  Eliminados: ' + eliminados + ' de ' + filasAEliminar.length);
        }
      } catch (e) {
        errores++;
        Logger.log('Error eliminando fila ' + filasAEliminar[k] + ': ' + e.toString());
      }
    }
    
    var fin = new Date().getTime();
    
    // 4. Resumen final
    Logger.log('');
    Logger.log('========== RESULTADO FINAL ==========');
    Logger.log('✅ Simpatizantes eliminados: ' + eliminados);
    if (errores > 0) {
      Logger.log('⚠️ Errores: ' + errores);
    }
    Logger.log('');
    Logger.log('Detalle por líder eliminado:');
    for (var docL in lideresAfectados) {
      Logger.log('  - ' + lideresAfectados[docL].nombre + ' (' + docL + '): ' + lideresAfectados[docL].cantidad + ' simpatizantes');
    }
    Logger.log('');
    Logger.log('Tiempo de ejecución: ' + (fin - inicio) + ' ms');
    
    return {
      success: true,
      message: 'Limpieza completada',
      eliminados: eliminados,
      errores: errores,
      lideresAfectados: Object.keys(lideresAfectados).length,
      tiempoMs: fin - inicio
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


/**
 * FUNCIÓN DE SEGURIDAD - Crear respaldo antes de eliminar
 * Opcional: Ejecutar antes de eliminarSimpatizantesHuerfanos()
 * Crea una copia de los simpatizantes huérfanos en una hoja nueva
 */
function respaldarSimpatizantesHuerfanos() {
  try {
    Logger.log('=== RESPALDANDO SIMPATIZANTES HUÉRFANOS ===');
    
    // 1. Obtener líderes activos
    var ssLideres = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ssLideres.getSheetByName('BD-lideres');
    
    var datosLideres = hojaLideres.getDataRange().getValues();
    var lideresActivos = {};
    
    for (var i = 1; i < datosLideres.length; i++) {
      var doc = datosLideres[i][4] ? String(datosLideres[i][4]).trim() : '';
      if (doc) lideresActivos[doc] = true;
    }
    
    // 2. Identificar huérfanos
    var ssRegistros = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaRegistros = ssRegistros.getSheetByName('Registros');
    
    var ultimaFila = hojaRegistros.getLastRow();
    var datosRegistros = hojaRegistros.getRange(1, 1, ultimaFila, 12).getValues(); // Incluir encabezados
    
    var huerfanos = [datosRegistros[0]]; // Encabezados
    
    for (var j = 1; j < datosRegistros.length; j++) {
      var fila = datosRegistros[j];
      var liderDoc = fila[9] ? String(fila[9]).trim() : '';
      
      if (liderDoc && !lideresActivos[liderDoc]) {
        huerfanos.push(fila);
      }
    }
    
    if (huerfanos.length <= 1) {
      Logger.log('No hay huérfanos para respaldar');
      return { success: true, message: 'No hay huérfanos', registros: 0 };
    }
    
    // 3. Crear hoja de respaldo
    var nombreRespaldo = 'RESPALDO_Huerfanos_' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd_HHmmss');
    var hojaRespaldo = ssRegistros.insertSheet(nombreRespaldo);
    
    hojaRespaldo.getRange(1, 1, huerfanos.length, huerfanos[0].length).setValues(huerfanos);
    
    // Formato de encabezados
    hojaRespaldo.getRange(1, 1, 1, huerfanos[0].length).setBackground('#1a3353').setFontColor('#ffffff').setFontWeight('bold');
    hojaRespaldo.setFrozenRows(1);
    
    Logger.log('✅ Respaldo creado: ' + nombreRespaldo);
    Logger.log('Registros respaldados: ' + (huerfanos.length - 1));
    
    return {
      success: true,
      message: 'Respaldo creado: ' + nombreRespaldo,
      registros: huerfanos.length - 1,
      hoja: nombreRespaldo
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
function obtenerDatosLlamadasPaginado(pagina) {
  try {
    pagina = pagina || 1;
    var POR_PAGINA = 200;
    
    Logger.log('=== DATOS LLAMADAS PAGINADO - Página: ' + pagina + ' ===');
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ss.getSheetByName('BD-lideres');
    
    if (!hojaLideres || hojaLideres.getLastRow() <= 1) {
      return { success: true, datos: [], total: 0, pagina: 1, totalPaginas: 1 };
    }
    
    var ultimaFila = hojaLideres.getLastRow();
    var totalFilas = ultimaFila - 1;
    var totalPaginas = Math.ceil(totalFilas / POR_PAGINA);
    pagina = Math.max(1, Math.min(pagina, totalPaginas));
    
    // Contar simpatizantes UNA VEZ (objeto ligero, solo números)
    var conteoSimpatizantes = {};
    try {
      var ssRegistro = SpreadsheetApp.openById(ID_HOJA_REGISTRO);
      var hojaRegistro = ssRegistro.getSheetByName('Registros');
      if (hojaRegistro && hojaRegistro.getLastRow() > 1) {
        var datosReg = hojaRegistro.getRange(2, 10, hojaRegistro.getLastRow() - 1, 1).getValues();
        for (var j = 0; j < datosReg.length; j++) {
          var docL = datosReg[j][0] ? String(datosReg[j][0]).trim() : '';
          if (docL) {
            conteoSimpatizantes[docL] = (conteoSimpatizantes[docL] || 0) + 1;
          }
        }
      }
    } catch(e) {}
    
    // Leer solo las filas de esta página
    var filaInicio = 2 + ((pagina - 1) * POR_PAGINA);
    var filasALeer = Math.min(POR_PAGINA, ultimaFila - filaInicio + 1);
    
    if (filasALeer <= 0) {
      return { success: true, datos: [], total: totalFilas, pagina: pagina, totalPaginas: totalPaginas };
    }
    
    var datos = hojaLideres.getRange(filaInicio, 1, filasALeer, 41).getValues();
    var resultado = [];
    
    for (var i = 0; i < datos.length; i++) {
      var fila = datos[i];
      var doc = fila[4] ? String(fila[4]).trim() : '';
      if (!doc) continue;
      
      var cantSimp = conteoSimpatizantes[doc] || 0;
      
      resultado.push({
        idx: filaInicio + i,
        nombre: fila[2] ? String(fila[2]).trim() : '',
        tipoDocumento: fila[3] ? String(fila[3]).trim() : '',
        documento: doc,
        fechaNacimiento: fila[5] || '',
        celular: fila[6] ? String(fila[6]).trim() : '',
        direccion: fila[7] ? String(fila[7]).trim() : '',
        barrio: fila[8] ? String(fila[8]).trim() : '',
        correo: fila[9] ? String(fila[9]).trim() : '',
        profesion: fila[10] ? String(fila[10]).trim() : '',
        entidad: fila[11] ? String(fila[11]).trim() : '',
        cargo: fila[12] ? String(fila[12]).trim() : '',
        tipoVinculacion: fila[13] ? String(fila[13]).trim() : '',
        horarios: fila[14] ? String(fila[14]).trim() : '',
        salario: fila[15] ? String(fila[15]).trim() : '',
        comoSeSiente: fila[16] ? String(fila[16]).trim() : '',
        conoceJuanFelipe: fila[17] ? String(fila[17]).trim() : '',
        liderBarrio: fila[18] ? String(fila[18]).trim() : '',
        expectativasProyecto: fila[19] ? String(fila[19]).trim() : '',
        estudios: fila[20] ? String(fila[20]).trim() : '',
        numeroHijos: fila[21] ? String(fila[21]).trim() : '',
        deporte: fila[23] ? String(fila[23]).trim() : '',
        tieneVehiculo: fila[24] ? String(fila[24]).trim() : '',
        observaciones: fila[26] ? String(fila[26]).trim() : '',
        nombreReferido: fila[27] ? String(fila[27]).trim() : '',
        municipio: fila[28] ? String(fila[28]).trim() : '',
        numeroNinos: fila[29] ? String(fila[29]).trim() : '',
        numeroNinas: fila[30] ? String(fila[30]).trim() : '',
        tipoVehiculo: fila[31] ? String(fila[31]).trim() : '',
        placaVehiculo: fila[32] ? String(fila[32]).trim() : '',
        liderNoListado: fila[34] ? String(fila[34]).trim() : '',
        estadoLlamada: fila[35] ? String(fila[35]).trim() : 'pendiente',
        fechaLlamada: fila[36] || '',
        usuarioLlamada: fila[37] ? String(fila[37]).trim() : '',
        notasLlamada: fila[38] ? String(fila[38]).trim() : '',
        usuarioModifico: fila[39] ? String(fila[39]).trim() : '',
        comuna: fila[40] ? String(fila[40]).trim() : '',
        cantidadSimpatizantes: cantSimp,
        metaCumplida: cantSimp >= 40,
        origen: 'BD-lideres'
      });
    }
    
    Logger.log('Página ' + pagina + '/' + totalPaginas + ' - Registros: ' + resultado.length);
    
    return {
      success: true,
      datos: resultado,
      total: totalFilas,
      pagina: pagina,
      totalPaginas: totalPaginas
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), datos: [] };
  }
}


function obtenerDatosLlamadasLigero() {
  try {
    Logger.log('=== OBTENER DATOS LLAMADAS LIGERO ===');
    
    var ss = SpreadsheetApp.openById(ID_SEGUIMIENTO_GT);
    var hojaLideres = ss.getSheetByName('BD-lideres');
    
    if (!hojaLideres || hojaLideres.getLastRow() <= 1) {
      return { success: true, datos: [], total: 0 };
    }
    
    var ultimaFila = hojaLideres.getLastRow();
    var datos = hojaLideres.getRange(2, 1, ultimaFila - 1, 41).getValues();
    
    // Contar simpatizantes
    var conteo = {};
    try {
      var ssReg = SpreadsheetApp.openById(ID_HOJA_REGISTRO);
      var hojaReg = ssReg.getSheetByName('Registros');
      if (hojaReg && hojaReg.getLastRow() > 1) {
        var dReg = hojaReg.getRange(2, 10, hojaReg.getLastRow() - 1, 1).getValues();
        for (var j = 0; j < dReg.length; j++) {
          var dl = dReg[j][0] ? String(dReg[j][0]).trim() : '';
          if (dl) conteo[dl] = (conteo[dl] || 0) + 1;
        }
      }
    } catch(e) {}
    
    var resultado = [];
    
    for (var i = 0; i < datos.length; i++) {
      var f = datos[i];
      var doc = f[4] ? String(f[4]).trim() : '';
      if (!doc) continue;
      
      var cs = conteo[doc] || 0;
      
      // SOLO campos para tabla + filtros + operaciones básicas
     resultado.push({
        idx: i + 2,
        nombre: f[2] ? String(f[2]).trim() : '',
        tipoDocumento: f[3] ? String(f[3]).trim() : '',
        documento: doc,
        fechaNacimiento: f[5] ? String(f[5]).trim() : '',
        celular: f[6] ? String(f[6]).trim() : '',
        direccion: f[7] ? String(f[7]).trim() : '',
        barrio: f[8] ? String(f[8]).trim() : '',
        correo: f[9] ? String(f[9]).trim() : '',
        profesion: f[10] ? String(f[10]).trim() : '',
        entidad: f[11] ? String(f[11]).trim() : '',
        cargo: f[12] ? String(f[12]).trim() : '',
        tipoVinculacion: f[13] ? String(f[13]).trim() : '',
        horarios: f[14] ? String(f[14]).trim() : '',
        salario: f[15] ? String(f[15]).trim() : '',
        comoSeSiente: f[16] ? String(f[16]).trim() : '',
        conoceJuanFelipe: f[17] ? String(f[17]).trim() : '',
        liderBarrio: f[18] ? String(f[18]).trim() : '',
        expectativasProyecto: f[19] ? String(f[19]).trim() : '',
        estudios: f[20] ? String(f[20]).trim() : '',
        numeroHijos: f[21] ? String(f[21]).trim() : '',
        deporte: f[23] ? String(f[23]).trim() : '',
        tieneVehiculo: f[24] ? String(f[24]).trim() : '',
        observaciones: f[26] ? String(f[26]).trim() : '',
        nombreReferido: f[27] ? String(f[27]).trim() : '',
        municipio: f[28] ? String(f[28]).trim() : '',
        numeroNinos: f[29] ? String(f[29]).trim() : '',
        numeroNinas: f[30] ? String(f[30]).trim() : '',
        tipoVehiculo: f[31] ? String(f[31]).trim() : '',
        placaVehiculo: f[32] ? String(f[32]).trim() : '',
        liderNoListado: f[34] ? String(f[34]).trim() : '',
        estadoLlamada: f[35] ? String(f[35]).trim() : 'pendiente',
        fechaLlamada: f[36] ? Utilities.formatDate(new Date(f[36]), 'America/Bogota', 'yyyy-MM-dd') : '',
        usuarioLlamada: f[37] ? String(f[37]).trim() : '',
        notasLlamada: f[38] ? String(f[38]).trim() : '',
        usuarioModifico: f[39] ? String(f[39]).trim() : '',
        comuna: f[40] ? String(f[40]).trim() : '',
        cantidadSimpatizantes: cs,
        metaCumplida: cs >= 40,
        origen: 'BD-lideres'
      });
      
     }
    Logger.log('Total registros ligeros: ' + resultado.length);
    
    return {
      success: true,
      datos: resultado,
      total: resultado.length
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), datos: [] };
  }
}