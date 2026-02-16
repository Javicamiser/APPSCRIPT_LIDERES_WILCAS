// ============================================================================
// GeovisualAdmin.gs
// ============================================================================

var PUESTOS_COORD = {
  'UNIVERSIDAD DE CALDAS':              { lat: 5.0594, lng: -75.4943 },
  'UNIVERSIDAD NACIONAL':               { lat: 5.0562, lng: -75.4905 },
  'UNIVERSIDAD AUTONOMA':               { lat: 5.0618, lng: -75.4873 },
  'UNIVERSIDAD DE MANIZALES':           { lat: 5.0585, lng: -75.4965 },
  'UNIVERSIDAD CATOLICA':               { lat: 5.0670, lng: -75.5110 },
  'FACULTAD CIENCIAS SALUD':            { lat: 5.0602, lng: -75.4935 },
  'FACULTAD INGENIERIA':                { lat: 5.0570, lng: -75.4910 },
  'COLISEO MENOR':                      { lat: 5.0635, lng: -75.5068 },
  'COLISEO MAYOR':                      { lat: 5.0630, lng: -75.5072 },
  'PALACIO EXPOSICIONES':               { lat: 5.0625, lng: -75.5065 },
  'EXPOFERIAS':                         { lat: 5.0628, lng: -75.5060 },
  'CENTRO COMERCIAL FUNDADORES':        { lat: 5.0685, lng: -75.5155 },
  'NORMAL SUPERIOR':                    { lat: 5.0680, lng: -75.5130 },
  'INSTITUTO MANIZALES':                { lat: 5.0690, lng: -75.5165 },
  'GRAN COLOMBIA':                      { lat: 5.0660, lng: -75.5100 },
  'LICEO ISABEL LA CATOLICA':           { lat: 5.0700, lng: -75.5145 },
  'COLEGIO DE CRISTO':                  { lat: 5.0675, lng: -75.5150 },
  'SAN AGUSTIN':                        { lat: 5.0695, lng: -75.5125 },
  'SIETE DE AGOSTO':                    { lat: 5.0710, lng: -75.5140 },
  'TECNOLOGICO':                        { lat: 5.0650, lng: -75.5085 },
  'ANDRES BELLO':                       { lat: 5.0665, lng: -75.5190 },
  'PERPETUO SOCORRO':                   { lat: 5.0688, lng: -75.5170 },
  'MARISCAL SUCRE':                     { lat: 5.0672, lng: -75.5138 },
  'MARCO FIDEL SUAREZ':                 { lat: 5.0660, lng: -75.5120 },
  'CHIPRE':                             { lat: 5.0590, lng: -75.5280 },
  'SAN JORGE':                          { lat: 5.0610, lng: -75.5250 },
  'ADOLFO HOYOS':                       { lat: 5.0600, lng: -75.5240 },
  'VILLA DEL PILAR':                    { lat: 5.0605, lng: -75.5225 },
  'BOSQUES DEL NORTE':                  { lat: 5.0760, lng: -75.5035 },
  'CIUDADELA DEL NORTE':                { lat: 5.0745, lng: -75.5020 },
  'JEAN PIAGET':                        { lat: 5.0770, lng: -75.5010 },
  'FE Y ALEGRIA':                       { lat: 5.0780, lng: -75.5000 },
  'ARANJUEZ':                           { lat: 5.0730, lng: -75.5050 },
  'MALTERIA':                           { lat: 5.0800, lng: -75.4980 },
  'SAN PIO X':                          { lat: 5.0755, lng: -75.5045 },
  'LEONARDO DA VINCI':                  { lat: 5.0715, lng: -75.4960 },
  'LEONARDO DAVINCI':                   { lat: 5.0715, lng: -75.4960 },
  'SAN CAYETANO':                       { lat: 5.0770, lng: -75.5025 },
  'PALOGRANDE':                         { lat: 5.0600, lng: -75.4985 },
  'MALABAR':                            { lat: 5.0555, lng: -75.5010 },
  'LA ASUNCION':                        { lat: 5.0615, lng: -75.4990 },
  'EUCLIDES JARAMILLO':                 { lat: 5.0580, lng: -75.4970 },
  'LA SULTANA':                         { lat: 5.0520, lng: -75.4850 },
  'LA ENEA':                            { lat: 5.0460, lng: -75.4680 },
  'LA LINDA':                           { lat: 5.0510, lng: -75.4810 },
  'ESTAMBUL':                           { lat: 5.0535, lng: -75.4870 },
  'TESORITO':                           { lat: 5.0500, lng: -75.4780 },
  'LUSITANIA':                          { lat: 5.0480, lng: -75.4720 },
  'ALTA SUIZA':                         { lat: 5.0640, lng: -75.4920 },
  'CERRO DE ORO':                       { lat: 5.0630, lng: -75.4950 },
  'LA CAROLA':                          { lat: 5.0650, lng: -75.5020 },
  'VILLA CARMENZA':                     { lat: 5.0648, lng: -75.5005 },
  'LA FUENTE':                          { lat: 5.0625, lng: -75.5200 },
  'LA MACARENA':                        { lat: 5.0550, lng: -75.5180 },
  'BAJO CORINTO':                       { lat: 5.0545, lng: -75.5170 },
  'CAMEGUADUA':                         { lat: 5.0540, lng: -75.5160 },
  'VILLAMARIA':                         { lat: 5.0430, lng: -75.5120 },
  'CHINCHINA':                          { lat: 4.9840, lng: -75.6040 },
  'NEIRA':                              { lat: 5.1700, lng: -75.5270 },
  'PALESTINA':                          { lat: 5.0450, lng: -75.6270 },
  'ANSERMA':                            { lat: 5.2380, lng: -75.7850 },
  'RIOSUCIO':                           { lat: 5.4220, lng: -75.7040 },
  'SUPIA':                              { lat: 5.4530, lng: -75.6490 },
  'LA DORADA':                          { lat: 5.4530, lng: -74.6670 },
  'AGUADAS':                            { lat: 5.6110, lng: -75.4570 },
  'PACORA':                             { lat: 5.5260, lng: -75.4610 },
  'SALAMINA':                           { lat: 5.4070, lng: -75.4890 },
  'ARANZAZU':                           { lat: 5.2680, lng: -75.4860 },
  'FILADELFIA':                         { lat: 5.2980, lng: -75.5620 },
  'LA MERCED':                          { lat: 5.3680, lng: -75.5770 },
  'MARMATO':                            { lat: 5.4830, lng: -75.5980 },
  'PENSILVANIA':                        { lat: 5.3860, lng: -75.1600 },
  'MARQUETALIA':                        { lat: 5.3010, lng: -75.0590 },
  'MARULANDA':                          { lat: 5.2850, lng: -75.2530 },
  'MANZANARES':                         { lat: 5.2520, lng: -75.1560 },
  'SAMANA':                             { lat: 5.4180, lng: -74.9900 },
  'VICTORIA':                           { lat: 5.3190, lng: -74.9380 },
  'BELALCAZAR':                         { lat: 5.0150, lng: -75.8130 },
  'VITERBO':                            { lat: 5.0680, lng: -75.8740 },
  'RISARALDA':                          { lat: 5.1500, lng: -75.7730 },
  'SAN JOSE':                           { lat: 5.0835, lng: -75.7890 }
};

var CENTRO_MZL = { lat: 5.0689, lng: -75.5174 };

// Mapeo barrio → comuna (replica del frontend para usar en backend)
var GEO_BARRIOS_COMUNA = {
  'Atardeceres': ['CHIPRE','LA FRANCIA','CAMPOHERMOSO','SAN JORGE','MORROGACHO','SACATIN','VILLA PILAR','BELLA MONTAÑA','RESIDENCIAS MANIZALES'],
  'San Jose': ['SAN JOSE','COLON','LAS DELICIAS','AVANZADA','SAN IGNACIO','GALAN','ESTRADA','RINCON SANTO','HOYO FRIO','TACHUELO','CAMINO DEL MEDIO'],
  'Cumanday': ['CENTRO','LOS AGUSTINOS','FUNDADORES','SAN JOAQUIN','VERSALLES','GONZALEZ','PALOGRANDE'],
  'La Estacion': ['LA ESTACION','SAN RAFAEL','LLERAS','PERALONSO','OLIMPICO','MALHABAR','LA RAMBLA','LOS CEDROS','RESIDENCIAS PARK'],
  'Ciudadela del Norte': ['CIUDADELA DEL NORTE','BOSQUES DEL NORTE','SAN CAYETANO','VILLAHERMOSA','SINAI','PERALONSO','ARANJUEZ','SOLFERINO','FATIMA','MALTERIA','EL CARIBE','BOSCONIA','VILLAPILAR NUEVO'],
  'Cerro de Oro': ['CERRO DE ORO','MALABAR','ALTA SUIZA','VIVEROS','EL SOL','LAURELES','MILAN','PALERMO','BAJA SUIZA','LA LEONORA','SAN MARCEL','VILLA DEL RIO'],
  'Tesorito': ['TESORITO','LA ENEA','LA SULTANA','LUSITANIA','SAN MARCEL','BOSQUES DEL NORTE II','JUANCHITO'],
  'Palogrande': ['PALOGRANDE','BELEN','ESTRELLA','LOS ROSALES','MILAN','ARBOLEDA','LA CAMELIA','EL TREBOL','SANCANCIO','BATALLON','COLSEGUROS'],
  'Universitaria': ['UNIVERSITARIA','LA CAROLA','LA ASUNCION','EL TRIANGULO','VILLA CARMENZA','MINITAS','ARANJUEZ'],
  'La Fuente': ['LA FUENTE','LA SUIZA','EL NEVADO','PERSIA','ARRAYANES','BAJO TABLAZO','PORVENIR','MALABAR BAJO'],
  'La Macarena': ['LA MACARENA','CAMEGUADUA','BAJO CORINTO','LINDARAJA','LOS ALCAZARES','SAN SEBASTIAN','CEMENTERIO','BAJA LEONORA','NOGALES','LA PAZ']
};

function geoComunaPorBarrio(barrio) {
  if (!barrio) return '';
  var b = String(barrio).trim().toUpperCase()
    .replace(/Á/g,'A').replace(/É/g,'E').replace(/Í/g,'I').replace(/Ó/g,'O').replace(/Ú/g,'U').replace(/Ñ/g,'N');
  for (var comuna in GEO_BARRIOS_COMUNA) {
    var barrios = GEO_BARRIOS_COMUNA[comuna];
    for (var i = 0; i < barrios.length; i++) {
      if (barrios[i] === b || b.indexOf(barrios[i]) !== -1) return comuna;
    }
  }
  return '';
}


/**
 * Obtiene datos agrupados por puesto de votación.
 * @param {string} filtroLiderDoc — Si se pasa, solo muestra simpatizantes de ese líder.
 */
function obtenerDatosGeovisual(filtroLiderDoc) {
  try {
    Logger.log('=== GEOVISUAL: CARGANDO | Filtro líder: ' + (filtroLiderDoc || 'NINGUNO') + ' ===');
    var puestosMap = {};
    var totalSimp = 0, totalLid = 0;
    var liderFiltro = filtroLiderDoc ? String(filtroLiderDoc).trim() : '';
    var nombreLiderEncontrado = '';

    // ── 1) SIMPATIZANTES ──
    var ssReg = SpreadsheetApp.openById(ID_REGISTROS);
    var hojaReg = ssReg.getSheetByName('Registros');
    if (hojaReg) {
      var ultFila = hojaReg.getLastRow();
      if (ultFila > 1) {
        var numCols = Math.min(Math.max(hojaReg.getLastColumn(), 13), 22);
        var datosReg = hojaReg.getRange(2, 1, ultFila - 1, numCols).getValues();
        for (var i = 0; i < datosReg.length; i++) {
          var r = datosReg[i];
          var nombre = r[0] ? String(r[0]).trim() : '';
          if (!nombre) continue;

          // Filtro por líder
          if (liderFiltro) {
            var lDoc = r[9] ? String(r[9]).trim() : '';
            if (lDoc !== liderFiltro) continue;
            if (!nombreLiderEncontrado && r[10]) nombreLiderEncontrado = String(r[10]).trim();
          }

          var puesto = (numCols > 12 && r[12]) ? String(r[12]).trim() : '';
          if (!puesto) continue;

          var barrio = r[5] ? String(r[5]).trim() : '';
          var comuna = geoComunaPorBarrio(barrio);
          var municipio = r[7] ? String(r[7]).trim() : '';
          var pKey = puesto.toUpperCase();

          if (!puestosMap[pKey]) {
            puestosMap[pKey] = { original: puesto, personas: [], comuna: comuna, municipio: municipio };
          }
          if (!puestosMap[pKey].comuna && comuna) puestosMap[pKey].comuna = comuna;
          puestosMap[pKey].personas.push({ nombre: nombre, rol: 'Simpatizante' });
          totalSimp++;
        }
      }
    }
    Logger.log('Simpatizantes con puesto: ' + totalSimp);

    // ── 2) LÍDERES (solo si NO hay filtro por líder) ──
    if (!liderFiltro) {
      var hojasIntento = [
        { id: ID_SEGUIMIENTO_GT, nombre: 'BD-lideres' },
        { id: ID_SEGUIMIENTO_GT, nombre: 'BD-Lideres' },
        { id: ID_SEGUIMIENTO_GT, nombre: 'Lideres' },
        { id: ID_REGISTROS, nombre: 'Lideres' }
      ];
      for (var h = 0; h < hojasIntento.length; h++) {
        try {
          var ss = SpreadsheetApp.openById(hojasIntento[h].id);
          var hoja = ss.getSheetByName(hojasIntento[h].nombre);
          if (!hoja) continue;
          var uf = hoja.getLastRow();
          if (uf <= 1) continue;
          var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
          var colP = -1, colN = -1, colB = -1;
          for (var c = 0; c < headers.length; c++) {
            var hd = String(headers[c]).toUpperCase().trim();
            if (hd.indexOf('PUESTO') !== -1 && hd.indexOf('VOTA') !== -1) colP = c;
            if (colN === -1 && hd.indexOf('NOMBRE') !== -1) colN = c;
            if (colB === -1 && hd.indexOf('BARRIO') !== -1) colB = c;
          }
          if (colN === -1) colN = 0;
          var datosL = hoja.getRange(2, 1, uf - 1, hoja.getLastColumn()).getValues();
          for (var j = 0; j < datosL.length; j++) {
            var l = datosL[j];
            var nomL = l[colN] ? String(l[colN]).trim() : '';
            if (!nomL) continue;
            var puestoL = (colP !== -1 && l[colP]) ? String(l[colP]).trim() : '';
            if (!puestoL) continue;
            var pKeyL = puestoL.toUpperCase();
            var barrioL = (colB !== -1 && l[colB]) ? String(l[colB]).trim() : '';
            var comunaL = geoComunaPorBarrio(barrioL);
            if (!puestosMap[pKeyL]) puestosMap[pKeyL] = { original: puestoL, personas: [], comuna: comunaL, municipio: '' };
            if (!puestosMap[pKeyL].comuna && comunaL) puestosMap[pKeyL].comuna = comunaL;
            puestosMap[pKeyL].personas.push({ nombre: nomL, rol: 'Líder' });
            totalLid++;
          }
          Logger.log('Líderes: ' + totalLid);
          break;
        } catch (e) { Logger.log('No accesible: ' + hojasIntento[h].nombre); }
      }
    }

    // ── 3) ASIGNAR COORDENADAS ──
    var puestos = [];
    var sinCoord = 0, offsetIdx = 0;

    for (var key in puestosMap) {
      var data = puestosMap[key];
      var coord = buscarCoordPuesto(key);
      var geoExacto = true;

      if (!coord) {
        geoExacto = false;
        sinCoord++;
        offsetIdx++;
        var angulo = (offsetIdx * 137.508) * Math.PI / 180;
        var radio = 0.0015 + (offsetIdx * 0.00008);
        if (radio > 0.008) radio = 0.008;
        coord = { lat: CENTRO_MZL.lat + radio * Math.cos(angulo), lng: CENTRO_MZL.lng + radio * Math.sin(angulo) };
      }

      var personasEnviar = data.personas.length > 200 ? data.personas.slice(0, 200) : data.personas;
      var nLid = 0, nSimp = 0;
      for (var p = 0; p < data.personas.length; p++) {
        if (data.personas[p].rol === 'Líder') nLid++; else nSimp++;
      }

      puestos.push({
        puesto: data.original || key,
        lat: coord.lat, lng: coord.lng,
        geoExacto: geoExacto,
        comuna: data.comuna || '',
        municipio: data.municipio,
        total: data.personas.length,
        lideres: nLid, simpatizantes: nSimp,
        personas: personasEnviar
      });
    }

    puestos.sort(function(a, b) { return b.total - a.total; });
    Logger.log('GEOVISUAL: ' + puestos.length + ' puestos | ' + sinCoord + ' sin coord');

    return {
      success: true, puestos: puestos,
      filtroActivo: liderFiltro ? true : false,
      nombreLider: nombreLiderEncontrado,
      stats: { totalPuestos: puestos.length, totalSimpatizantes: totalSimp, totalLideres: totalLid, totalPersonas: totalSimp + totalLid, sinCoordenadas: sinCoord }
    };
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { success: false, message: error.toString(), puestos: [], stats: {} };
  }
}


function buscarCoordPuesto(puestoRaw) {
  if (!puestoRaw) return null;
  var p = puestoRaw.toUpperCase().trim();
  if (PUESTOS_COORD[p]) return PUESTOS_COORD[p];
  var limpio = p.replace(/^\d+\s*[-–]\s*/, '');
  var partes = limpio.split(/\s*[-–]\s*(?=CRA\b|CLL\b|CALLE\b|CARRERA\b|KR\b|CL\b|DG\b|TV\b|AV\b|AVENIDA\b|DIAGONAL\b|TRANSVERSAL\b)/);
  if (partes.length > 0) limpio = partes[0].trim();
  limpio = limpio.replace(/\s+(CRA|CLL|CALLE|CARRERA|KR|CL)\s+\d+.*$/i, '').trim();
  var sinPrefijo = limpio
    .replace(/^I\.?\s*E\.?\s*/i, '').replace(/^INST\.?\s*EDUC\.?\s*/i, '')
    .replace(/^INSTITUCION\s*EDUCATIVA\s*/i, '').replace(/^COLEGIO\s*/i, '')
    .replace(/^COL\.?\s*/i, '').replace(/^SD\s+\w+\s*/i, '').replace(/^SEDE\s+\w+\s*/i, '')
    .replace(/\s+DE\s+MANIZALES$/i, '').replace(/\s+SEDE\s+\w+$/i, '').trim();
  var sinAcento = geoQuitarAcentos(sinPrefijo);
  if (PUESTOS_COORD[limpio]) return PUESTOS_COORD[limpio];
  if (PUESTOS_COORD[sinPrefijo]) return PUESTOS_COORD[sinPrefijo];
  if (PUESTOS_COORD[sinAcento]) return PUESTOS_COORD[sinAcento];
  for (var cl in PUESTOS_COORD) { if (cl.length < 4) continue; if (limpio.indexOf(cl) !== -1 || sinPrefijo.indexOf(cl) !== -1 || sinAcento.indexOf(cl) !== -1) return PUESTOS_COORD[cl]; }
  for (var cl2 in PUESTOS_COORD) { if (cl2.length < 5) continue; if (p.indexOf(cl2) !== -1) return PUESTOS_COORD[cl2]; }
  var genericas = ['SEDE','PRINCIPAL','EDUCATIVA','INSTITUCION','NACIONAL','MUNICIPAL','DEPARTAMENTAL','UNIV','CALDAS','MANIZALES','URBANA','RURAL'];
  var palabras = sinPrefijo.split(/[\s.]+/);
  for (var i = 0; i < palabras.length; i++) { var pal = palabras[i]; if (pal.length < 4 || genericas.indexOf(pal) !== -1) continue; for (var cl3 in PUESTOS_COORD) { if (cl3.indexOf(pal) !== -1) return PUESTOS_COORD[cl3]; } }
  return null;
}

function geoQuitarAcentos(str) {
  if (!str) return '';
  var m = {'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','á':'a','é':'e','í':'i','ó':'o','ú':'u','Ñ':'N','ñ':'n','Ü':'U','ü':'u'};
  var r = '';
  for (var i = 0; i < str.length; i++) r += m[str[i]] || str[i];
  return r;
}