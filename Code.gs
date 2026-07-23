/**
 * Google Apps Script para Tienda de Ropa Online
 * 
 * Este script actúa como el backend de la tienda, gestionando la lectura de productos,
 * el registro de pedidos en Google Sheets y el envío automático de recibos por correo electrónico.
 * 
 * Instrucciones de despliegue:
 * 1. Crea un nuevo Google Sheet.
 * 2. Ve a 'Extensiones' > 'Apps Script'.
 * 3. Borra cualquier código existente y pega este archivo completo.
 * 4. Guarda el proyecto (clic en el icono de guardar).
 * 5. Haz clic en 'Implementar' > 'Nueva implementación'.
 * 6. Elige tipo 'Aplicación web'.
 * 7. Configura:
 *    - Descripción: "Backend Tienda de Ropa"
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquiera" (IMPORTANTE para permitir compras públicas)
 * 8. Haz clic en 'Implementar', autoriza los permisos necesarios de Gmail y Sheets.
 * 9. Copia la 'URL de la aplicación web' y pégala en la variable 'API_URL' del frontend.
 */

// Nombre de las hojas
var HOJA_PRODUCTOS = "Productos";
var HOJA_PEDIDOS = "Pedidos";
var HOJA_GALERIA = "Galeria";

// URL por defecto del Logo de la marca (en caso de que quieras cambiarlo)
var LOGO_URL = "https://i.postimg.cc/RCtsxP9K/IMG-2590-JPG.jpg";

/**
 * Maneja las peticiones GET para obtener productos y galería.
 */
function doGet(e) {
  try {
    inicializarHojasSiNoExisten();
    
    var db = SpreadsheetApp.getActiveSpreadsheet();
    
    // Leer Productos
    var sheetProductos = db.getSheetByName(HOJA_PRODUCTOS);
    var dataProductos = sheetProductos.getDataRange().getValues();
    var headersProductos = dataProductos[0];
    var productos = [];
    
    for (var i = 1; i < dataProductos.length; i++) {
      var row = dataProductos[i];
      var prod = {};
      for (var j = 0; j < headersProductos.length; j++) {
        var key = headersProductos[j].toString().trim();
        var val = row[j];
        
        // Formatear campos específicos
        if (key === "ID" || key === "Stock") {
          prod[key] = Number(val);
        } else if (key === "Precio") {
          prod[key] = Number(val);
        } else if (key === "Talles disponibles") {
          prod[key] = val.toString().split(",").map(function(s) { return s.trim(); }).filter(Boolean);
        } else if (key === "URLs de imágenes") {
          prod[key] = val.toString().split(",").map(function(s) { return s.trim(); }).filter(Boolean);
        } else {
          prod[key] = val;
        }
      }
      if (prod.ID) {
        productos.push(prod);
      }
    }
    
    // Leer Galería
    var sheetGaleria = db.getSheetByName(HOJA_GALERIA);
    var dataGaleria = sheetGaleria.getDataRange().getValues();
    var headersGaleria = dataGaleria[0];
    var galeria = [];
    
    for (var i = 1; i < dataGaleria.length; i++) {
      var row = dataGaleria[i];
      var item = {};
      for (var j = 0; j < headersGaleria.length; j++) {
        var key = headersGaleria[j].toString().trim();
        var val = row[j];
        if (key === "ID" || key === "Producto asociado (ID)" || key === "Orden") {
          item[key] = Number(val);
        } else {
          item[key] = val;
        }
      }
      if (item.ID) {
        galeria.push(item);
      }
    }
    
    var response = {
      success: true,
      productos: productos,
      galeria: galeria
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Maneja las peticiones POST para guardar pedidos y enviar recibos por correo.
 */
function doPost(e) {
  try {
    inicializarHojasSiNoExisten();
    
    var postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter;
    }
    
    if (!postData) {
      throw new Error("No se recibieron datos en el cuerpo de la petición.");
    }
    
    var db = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPedidos = db.getSheetByName(HOJA_PEDIDOS);
    
    var fecha = new Date();
    var idPedido = "PED-" + fecha.getTime();
    var cliente = postData.cliente || "";
    var gmail = postData.gmail || "";
    var telefono = postData.telefono || "";
    var metodoEntrega = postData.metodoEntrega || "";
    var datosEntregaStr = JSON.stringify(postData.datosEntrega || {});
    var total = Number(postData.total || 0);
    
    // Formatear los productos comprados para la celda de la planilla
    var productosArray = postData.productos || [];
    var productosFormateados = productosArray.map(function(p) {
      return p.nombre + " (Talle: " + p.talle + ", Cantidad: " + p.cantidad + ", Subtotal: $" + (p.precio * p.cantidad) + ")";
    }).join("\n");
    
    // Escribir en la hoja "Pedidos"
    // Columnas: Fecha, ID Pedido, Cliente, Gmail, Teléfono, Método Entrega, Datos Entrega, Productos, Total
    sheetPedidos.appendRow([
      fecha,
      idPedido,
      cliente,
      gmail,
      telefono,
      metodoEntrega,
      datosEntregaStr,
      productosFormateados,
      total
    ]);
    
    // Descontar stock opcionalmente si se encuentra en la hoja Productos
    try {
      actualizarStock(productosArray);
    } catch(stockErr) {
      console.log("Error actualizando stock: " + stockErr.toString());
    }
    
    // Enviar correo de recibo si se ingresó un correo electrónico
    if (gmail && gmail.indexOf("@") !== -1) {
      enviarMailRecibo(gmail, idPedido, postData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      idPedido: idPedido,
      message: "Pedido guardado con éxito y mail enviado."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Descuenta la cantidad vendida del stock de cada producto.
 */
function actualizarStock(productosComprados) {
  var db = SpreadsheetApp.getActiveSpreadsheet();
  var sheetProductos = db.getSheetByName(HOJA_PRODUCTOS);
  var data = sheetProductos.getDataRange().getValues();
  
  for (var i = 0; i < productosComprados.length; i++) {
    var comprado = productosComprados[i];
    for (var r = 1; r < data.length; r++) {
      var prodId = Number(data[r][0]); // Columna ID
      if (prodId === Number(comprado.id)) {
        var stockActual = Number(data[r][6]); // Columna Stock (índice 6)
        if (!isNaN(stockActual)) {
          var nuevoStock = Math.max(0, stockActual - comprado.cantidad);
          sheetProductos.getCell(r + 1, 7).setValue(nuevoStock); // Guardar en la celda correspondiente
        }
        break;
      }
    }
  }
}

/**
 * Construye y envía el correo de confirmación de compra formateado en HTML.
 */
function enviarMailRecibo(destinatario, idPedido, data) {
  var cliente = data.cliente || "Cliente";
  var metodoEntrega = data.metodoEntrega || "";
  var datosEntrega = data.datosEntrega || {};
  var productos = data.productos || [];
  var total = Number(data.total || 0);
  
  // Detalle de la entrega según el método
  var entregaHtml = "";
  if (metodoEntrega === "Retiro en tienda") {
    entregaHtml = "<strong>Método:</strong> Retiro en Sucursal Central<br>" +
                  "<strong>Teléfono de contacto:</strong> " + (data.telefono || "-") + "<br>" +
                  "<strong>Retira:</strong> " + cliente;
  } else if (metodoEntrega === "Retiro vía Andreani") {
    entregaHtml = "<strong>Método:</strong> Envío a Sucursal Andreani<br>" +
                  "<strong>DNI:</strong> " + (datosEntrega.dni || "-") + "<br>" +
                  "<strong>Provincia:</strong> " + (datosEntrega.provincia || "-") + "<br>" +
                  "<strong>Localidad:</strong> " + (datosEntrega.localidad || "-") + "<br>" +
                  "<strong>Código Postal:</strong> " + (datosEntrega.cp || "-") + "<br>" +
                  "<strong>Sucursal Andreani:</strong> " + (datosEntrega.sucursal || "Estándar") + "<br>" +
                  "<strong>Teléfono de contacto:</strong> " + (data.telefono || "-");
  } else {
    entregaHtml = "<strong>Método:</strong> Envío a Domicilio<br>" +
                  "<strong>Dirección:</strong> " + (datosEntrega.direccion || "-") + " " + (datosEntrega.pisoDepto || "") + "<br>" +
                  "<strong>Localidad:</strong> " + (datosEntrega.localidad || "-") + "<br>" +
                  "<strong>Código Postal:</strong> " + (datosEntrega.cp || "-") + "<br>" +
                  "<strong>Comentarios adicionales:</strong> " + (datosEntrega.comentarios || "Ninguno") + "<br>" +
                  "<strong>Teléfono de contacto:</strong> " + (data.telefono || "-");
  }

  // Filas de productos
  var filasProductosHtml = "";
  for (var i = 0; i < productos.length; i++) {
    var item = productos[i];
    filasProductosHtml += 
      '<tr style="border-bottom: 1px solid #e9d5ff;">' +
        '<td style="padding: 12px 0; font-family: sans-serif; font-size: 14px; color: #1e1b4b;">' +
          '<strong>' + item.nombre + '</strong><br>' +
          '<span style="font-size: 12px; color: #6b21a8;">Talle: ' + item.talle + '</span>' +
        '</td>' +
        '<td style="padding: 12px 0; text-align: center; font-family: sans-serif; font-size: 14px; color: #1e1b4b;">' + item.cantidad + '</td>' +
        '<td style="padding: 12px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #1e1b4b;">$' + item.precio.toLocaleString("es-AR") + '</td>' +
        '<td style="padding: 12px 0; text-align: right; font-family: sans-serif; font-size: 14px; font-weight: bold; color: #7c3aed;">$' + (item.precio * item.cantidad).toLocaleString("es-AR") + '</td>' +
      '</tr>';
  }

  // Cuerpo del Correo en HTML
  var htmlBody = 
    '<div style="background-color: #fcfaff; padding: 20px; font-family: sans-serif;">' +
      '<table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #f3e8ff; overflow: hidden; border-collapse: collapse; width: 100%;">' +
        // Cabecera con Degradado Violeta
        '<thead>' +
          '<tr>' +
            '<th style="background: linear-gradient(135deg, #7c3aed, #4c1d95); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">' +
              '<img src="' + LOGO_URL + '" alt="Logo de la Marca" style="max-height: 80px; border-radius: 8px; margin-bottom: 10px; display: inline-block; border: 2px solid #ffffff;">' +
              '<h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 300;">¡Gracias por tu compra!</h1>' +
              '<p style="color: #ddd6fe; margin: 5px 0 0; font-size: 14px;">Pedido: ' + idPedido + '</p>' +
            '</th>' +
          '</tr>' +
        '</thead>' +
        // Contenido
        '<tbody>' +
          '<tr>' +
            '<td style="padding: 30px;">' +
              '<h2 style="color: #1e1b4b; font-size: 18px; margin-top: 0; border-bottom: 2px solid #f3e8ff; padding-bottom: 8px;">Hola, ' + cliente + ' 👋</h2>' +
              '<p style="color: #4c1d95; font-size: 14px; line-height: 1.6;">' +
                'Recibimos tu pedido correctamente y ya estamos preparando todo. A continuación, te compartimos el detalle de tu compra y los pasos a seguir.' +
              '</p>' +
              
              // Tabla de productos
              '<table style="width: 100%; border-collapse: collapse; margin: 25px 0;">' +
                '<thead>' +
                  '<tr style="border-bottom: 2px solid #f3e8ff; text-align: left; color: #6b21a8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">' +
                    '<th style="padding-bottom: 10px; font-weight: 600;">Producto</th>' +
                    '<th style="padding-bottom: 10px; text-align: center; font-weight: 600;">Cant.</th>' +
                    '<th style="padding-bottom: 10px; text-align: right; font-weight: 600;">Precio</th>' +
                    '<th style="padding-bottom: 10px; text-align: right; font-weight: 600;">Subtotal</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' +
                  filasProductosHtml +
                '</tbody>' +
                '<tfoot>' +
                  '<tr>' +
                    '<td colspan="2" style="padding-top: 15px;"></td>' +
                    '<td style="padding-top: 15px; text-align: right; font-family: sans-serif; font-size: 16px; font-weight: bold; color: #1e1b4b;">Total:</td>' +
                    '<td style="padding-top: 15px; text-align: right; font-family: sans-serif; font-size: 18px; font-weight: bold; color: #7c3aed;">$' + total.toLocaleString("es-AR") + '</td>' +
                  '</tr>' +
                '</tfoot>' +
              '</table>' +
              
              // Datos de entrega
              '<div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">' +
                '<h3 style="color: #6b21a8; margin-top: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Datos de Entrega</h3>' +
                '<p style="color: #1e1b4b; font-size: 14px; line-height: 1.6; margin: 0;">' + entregaHtml + '</p>' +
              '</div>' +
              
              // Datos de Pago (Transferencia)
              '<div style="background-color: #faf5ff; border: 1px dashed #c084fc; border-radius: 8px; padding: 20px; text-align: center;">' +
                '<h3 style="color: #7c3aed; margin-top: 0; font-size: 15px; text-transform: uppercase;">💳 Información para Transferencia</h3>' +
                '<p style="color: #1e1b4b; font-size: 14px; margin: 8px 0;">Para completar el pedido, realiza la transferencia bancaria al siguiente Alias:</p>' +
                '<p style="background-color: #ffffff; display: inline-block; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 16px; color: #7c3aed; border: 1px solid #e9d5ff; margin: 5px 0;">' +
                  'versatile.indumentaria' +
                '</p>' +
                '<p style="color: #6b21a8; font-size: 12px; margin: 8px 0 0;">Una vez transferido, envíanos el comprobante por WhatsApp para despachar tu compra de inmediato.</p>' +
              '</div>' +
              
              '<p style="color: #4c1d95; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 30px;">' +
                'Si tienes dudas con tu pedido, puedes contactarnos respondiendo a este mail o escribiéndonos a nuestro WhatsApp.' +
              '</p>' +
            '</td>' +
          '</tr>' +
          // Pie de Página
          '<tr>' +
            '<td style="background-color: #f3e8ff; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">' +
              '<p style="color: #6b21a8; font-size: 12px; margin: 0;">&copy; ' + new Date().getFullYear() + ' VersatileShoop. Todos los derechos reservados.</p>' +
              '<p style="color: #7c3aed; font-size: 12px; margin: 5px 0 0;">Desarrollado con ❤️ con Google Sheets Backend.</p>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>' +
    '</div>';

  MailApp.sendEmail({
    to: destinatario,
    subject: "Confirmación de Compra - Pedido " + idPedido + " 🛍️",
    htmlBody: htmlBody
  });
}

/**
 * Crea las hojas necesarias y añade datos de ejemplo si las hojas están vacías.
 */
function inicializarHojasSiNoExisten() {
  var db = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Hoja Productos
  var sheetProductos = db.getSheetByName(HOJA_PRODUCTOS);
  if (!sheetProductos) {
    sheetProductos = db.insertSheet(HOJA_PRODUCTOS);
    var headers = ["ID", "Nombre", "Precio", "Talles disponibles", "URLs de imágenes", "Categoría", "Stock"];
    sheetProductos.appendRow(headers);
    sheetProductos.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e9d5ff").setHorizontalAlignment("center");
    
    // Cargar productos de ejemplo
    var productosEjemplo = [
      [1, "Remera Oversize Violet", 18900, "S, M, L, XL", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80", "Remeras", 15],
      [2, "Remera Básica Algodón", 14500, "M, L, XL", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80", "Remeras", 20],
      [3, "Jean Recto Classic", 32000, "38, 40, 42, 44, 46", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", "Pantalones", 10],
      [4, "Chino Pants Beige", 29500, "38, 40, 42, 44", "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=600&q=80", "Pantalones", 12],
      [5, "Zapatillas Urban White", 58000, "39, 40, 41, 42, 43, 44", "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", "Zapatillas", 8],
      [6, "Zapatillas Sport Tech", 64000, "40, 41, 42, 43", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", "Zapatillas", 6],
      [7, "Gorro de Lana Invierno", 9800, "Único", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80", "Gorras", 25],
      [8, "Gorra Trucker Vintage", 11500, "Único", "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=600&q=80", "Gorras", 18],
      [9, "Campera Puffer Premium", 72000, "S, M, L, XL", "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80", "Abrigos", 5],
      [10, "Tapado Camel Elegante", 89000, "M, L", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80", "Abrigos", 4],
      [11, "Perfume Noir Intense", 38000, "100ml", "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80", "Perfumes", 10],
      [12, "Perfume Amber Cologne", 35000, "100ml", "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80", "Perfumes", 12],
      [13, "Billetera Cuero Minimal", 12500, "Único", "https://images.unsplash.com/photo-1627124718133-b8c199f365bc?auto=format&fit=crop&w=600&q=80", "Accesorios", 15],
      [14, "Anillo Plata 925", 8500, "18, 20, 22", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80", "Accesorios", 30]
    ];
    for (var i = 0; i < productosEjemplo.length; i++) {
      sheetProductos.appendRow(productosEjemplo[i]);
    }
  }
  
  // 2. Hoja Pedidos
  var sheetPedidos = db.getSheetByName(HOJA_PEDIDOS);
  if (!sheetPedidos) {
    sheetPedidos = db.insertSheet(HOJA_PEDIDOS);
    var headers = ["Fecha", "ID Pedido", "Cliente", "Gmail", "Teléfono", "Método Entrega", "Datos Entrega", "Productos", "Total"];
    sheetPedidos.appendRow(headers);
    sheetPedidos.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e9d5ff").setHorizontalAlignment("center");
  }
  
  // 3. Hoja Galería
  var sheetGaleria = db.getSheetByName(HOJA_GALERIA);
  if (!sheetGaleria) {
    sheetGaleria = db.insertSheet(HOJA_GALERIA);
    var headers = ["ID", "URL de imagen", "Producto asociado (ID)", "Orden"];
    sheetGaleria.appendRow(headers);
    sheetGaleria.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e9d5ff").setHorizontalAlignment("center");
    
    // Cargar galerías de ejemplo
    var galeriaEjemplos = [
      [1, "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80", 1, 1],
      [2, "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80", 1, 2],
      [3, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", 3, 1],
      [4, "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=600&q=80", 4, 1],
      [5, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", 5, 1],
      [6, "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", 6, 1]
    ];
    for (var i = 0; i < galeriaEjemplos.length; i++) {
      sheetGaleria.appendRow(galeriaEjemplos[i]);
    }
  }
}
