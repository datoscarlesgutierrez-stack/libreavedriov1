# Propuesta de Arquitectura: Gestión de Contacto y Sistema de Pedidos con Google Sheets y Google Forms

Este documento detalla la viabilidad, arquitectura técnica y operativa para gestionar las consultas de **Contacto** y el flujo completo de **Pedidos, Facturación y Seguimiento** en **Granja Libreavedrio**, combinando la estética de la web con la sencillez de una hoja de cálculo (Google Sheets / Excel) sin obligar a los usuarios a iniciar sesión en Google.

---

## 1. Google Forms y Contacto: Respuestas a tus dudas

### ¿Es posible gestionar el formulario con Google manteniendo el 100% de la estética actual?
**Sí, absolutamente.** No es necesario incrustar un `<iframe>` de Google Forms (que rompería la estética artesanal de la web). 

Existen dos formas técnicas de hacerlo manteniendo la maquetación HTML/CSS intacta:

1. **Método A: Envío directo en segundo plano al endpoint de Google Forms (`form action="https://docs.google.com/forms/d/e/.../formResponse"`)**
   - Se crea un Google Form privado con los mismos campos (Nombre, Email, Teléfono, Canal preferido, Mensaje).
   - Se obtienen los identificadores internos de cada campo (los llamados `entry.123456789`).
   - El formulario de nuestra web hace un `fetch(POST)` en segundo plano con `mode: 'no-cors'`.
   - **Resultado:** Los datos entran al instante en la hoja de cálculo de Google vinculada.

2. **Método B (Recomendado): Google Apps Script Web App (Webhook propio)**
   - Creas una hoja de cálculo de Google Sheets ("Consultas Libreavedrio").
   - Añades un script de 15 líneas en *Extensiones > Apps Script* que recibe un JSON por `doPost(e)`.
   - El script guarda la fila en la hoja y te envía un aviso a tu correo si lo deseas.
   - **Ventaja:** Cero problemas con cuentas de usuario, control total de validación y confirmación en tiempo real.

### ¿Obliga Google a que el usuario tenga o inicie sesión con cuenta de Google?
**No, siempre que se configure adecuadamente:**
- En la configuración de Google Forms, la casilla *"Limitar a 1 respuesta"* debe estar **desactivada**. Si se activa, Google exige login. Al dejarla desactivada, **cualquier persona puede rellenar el formulario** sin tener cuenta de Google ni iniciar sesión.
- Si usas el **Método B (Apps Script)**, el usuario ni siquiera interactúa con Google: su navegador simplemente envía los datos a una URL segura y anónima.

### ¿Y si el cliente quiere modificar su consulta?
En lugar de forzar al usuario a iniciar sesión en Google para editar una respuesta anterior (que es lo que causa rechazo):
- En un modelo de trato directo y cercano como Libreavedrio, las modificaciones se gestionan por el **canal preferido elegido** (WhatsApp, Telegram, Signal o Email).
- Se le indica al usuario en la pantalla de éxito: *"Si necesitas cambiar algo de tu consulta, puedes escribirnos directamente respondiendo al email de confirmación o por WhatsApp/Telegram"*.

---

## 2. Sistema de Pedidos Sencillo y Ágil (Sin Tienda Compleja)

Para un proyecto artesanal y de confianza como Libreavedrio, montar un e-commerce complejo (tipo WooCommerce o Shopify) añade costes, comisiones bancarias y fricción innecesaria. Lo óptimo es un **Formulario de Pedido Directo** conectado a un **Google Sheets estructurado como panel de control (ERP ligero)**.

### A. Estructura del Formulario de Pedido en la Web
El formulario de `pedidos.html` se divide en tres bloques muy visuales y sencillos:

```
┌────────────────────────────────────────────────────────┐
│ 1. TUS DATOS (Alta Rápida de Cliente)                 │
│    • Nombre y Apellidos / Razón Social                 │
│    • NIF / CIF (opcional para particulares, obligatorio│
│      si necesita factura)                              │
│    • Dirección de entrega (Calle, Portal, CP, Población│
│    • Teléfono de contacto                              │
│    • Correo electrónico                               │
│    • Canal de notificación preferido                   │
├────────────────────────────────────────────────────────┤
│ 2. TU ENCARGO DE HUEVOS ECOLÓGICOS                     │
│    • Tipo de producto (Docenas Código 0, Estuches)     │
│    • Cantidad                                          │
│    • Frecuencia: [Pedido puntual] o [Suscripción/Grupo]│
│    • Notas de entrega (horarios preferidos, etc.)      │
├────────────────────────────────────────────────────────┤
│ 3. PAGO Y CONDICIONES                                  │
│    • Método preferido: [Transferencia Bancaria] [Bizum]│
│      o [Efectivo contra entrega]                       │
│    • Check: "Deseo recibir factura oficial" (Sí/No)    │
│    • Aceptación de política de privacidad              │
└────────────────────────────────────────────────────────┘
```

---

## 3. Estructura del Google Sheets (El "Excel" de Control)

Una única hoja de cálculo con **4 pestañas** interconectadas resuelve pedidos, clientes, inventario básico y contabilidad mensual sin coste:

```
[ Google Sheets: Granja Libreavedrio - Panel de Control ]
  ├── 📑 Pestaña 1: "PEDIDOS_ACTIVOS" (Seguimiento del día a día)
  ├── 📑 Pestaña 2: "HISTÓRICO_Y_CONTABILIDAD" (Balance mensual)
  ├── 📑 Pestaña 3: "CLIENTES" (Directorio para facturación/tiquets)
  └── 📑 Pestaña 4: "AJUSTES" (Precios unitarios, estados, rutas)
```

### Detalle de Pestaña 1: `PEDIDOS_ACTIVOS` (Pipeline de Trabajo)
Cada fila es un pedido que entra automáticamente desde la web con fecha y hora. Incluye columnas desplegables con colores:

| ID Pedido | Fecha | Cliente | Teléfono | Canal | Cantidad (Docenas) | Total (€) | Estado Pedido | Estado Pago | Método Pago | Factura? | Notas Entrega |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| #1001 | 05/02 | María García | 612... | WhatsApp | 4 docenas | 18,00 € | 🟢 **Nuevo** | 🔴 Pendiente | Bizum | Sí (NIF...) | Dejar en portería |
| #1002 | 05/02 | Grupo Aoslos | 633... | Telegram | 15 docenas | 67,50 € | 🟡 **En preparación**| 🟢 Pagado | Transferencia | Sí | Miércoles tarde |
| #1003 | 04/02 | Carlos Pérez | 655... | Email | 2 docenas | 9,00 € | 🔵 **En reparto** | 🟢 Pagado | Efectivo | Ticket | Llamar al timbre 2ºB |
| #1004 | 03/02 | Bar Sierra | 677... | WhatsApp | 10 docenas | 45,00 € | ⚪ **Entregado** | 🟢 Pagado | Transferencia | Factura #27-01 | Entregar antes de 11h |

#### Estados del Pedido (menú desplegable en la celda):
1. 🟢 **Nuevo** (recién entrado por la web).
2. 🟡 **En preparación** (seleccionando y embalando en la granja).
3. 🔵 **En reparto / En camino** (en la furgoneta de reparto).
4. ⚪ **Entregado** (finalizado).
5. ❌ **Cancelado**.

#### Estados del Pago:
- 🔴 **Pendiente**
- 🟢 **Pagado** (verificado en cuenta o cobrado en mano)

---

## 4. Flujo de Notificaciones y Trato Directo al Cliente

Para mantener el trato humano y cercano que caracteriza a Libreavedrio:

```
[ Cliente envía formulario en la web ]
                   │
                   ▼
[ Google Sheets registra fila + Genera ID ]
                   │
                   ▼
[ 1. Notificación inmediata al cliente ]
  • Email automático de confirmación con el resumen y los datos bancarios / Bizum para el abono.
  • Enlace directo a WhatsApp / Telegram de Miguel para cualquier duda o cambio.
                   │
                   ▼
[ 2. Actualización de estados por Miguel / Keila ]
  • Al cambiar el desplegable a "En reparto": se puede pulsar un botón o enviar una plantilla de mensaje en 1 clic:
    "¡Hola María! Tus huevos de Libreavedrio van de camino hoy entre las 16h y las 19h."
                   │
                   ▼
[ 3. Entrega y cobro ]
  • Si paga en efectivo: se marca "Pagado".
  • Si es transferencia: se verifica y se archiva el pedido al histórico.
```

---

## 5. Facturación, Tiquets y Cuentas del Mes

### A. Directorio de Clientes (`CLIENTES`)
- Los datos de NIF/CIF, dirección fiscal y nombre se guardan automáticamente.
- Cuando un cliente repite, la hoja autocompleta sus datos de facturación mediante su número de teléfono o email.

### B. Emisión de Facturas y Tiquets
- **Plantilla de Factura en Google Sheets o Docs:** Una plantilla vinculada que toma los datos de la fila del pedido con solo introducir el número de pedido (ej. `#1001`) y genera un PDF listo para imprimir o enviar por email/WhatsApp.
- El PDF incluye el logo de Libreavedrio, datos fiscales de la granja, desglose de base imponible e IVA superreducido (4% para huevos).

### C. Contabilidad Mensual en 1 Pantalla (`HISTÓRICO_Y_CONTABILIDAD`)
La pestaña de resumen mensual calcula automáticamente mediante fórmulas simples (`SUMIFS`):
- **Total docenas vendidas en el mes.**
- **Total recaudación bruta (€).**
- **Desglose por método de cobro:**
  - Transferencia bancaria: `X €`
  - Bizum: `X €`
  - Efectivo en mano: `X €`
- **Total pendiente de cobro:** `X €` (alertas de pedidos entregados no pagados).
- Listo para enviar al gestor fiscal al final de cada trimestre sin ordenar papeles sueltos.

---

## 6. Hacienda y Veri*factu en España: ¿Cómo resolverlo GRATIS y sin software de terceros?

### ¿Qué exige la normativa Veri*factu / Reglamento SIF?
El reglamento derivado de la Ley Antifraude (Real Decreto 1007/2023) exige que los sistemas informáticos de facturación garanticen la integridad, inalterabilidad y trazabilidad de los registros de facturación, remitiéndolos a la Agencia Tributaria (modalidad **VERI*FACTU**) o generando registros seguros con código QR.

### ¿Dispone Hacienda de una plataforma web pública y gratuita?
**Sí, rotundamente.** La Agencia Estatal de Administración Tributaria (AEAT) ha habilitado formalmente en su Sede Electrónica la **«Aplicación de facturación de la AEAT»**.

Esta herramienta oficial está diseñada específicamente para autónomos y pequeñas empresas con el objetivo expreso de **evitar que tengan que contratar obligatoriamente un software de pago** o servicios privados de suscripción.

### Características clave del servicio público de la AEAT:
1. **100% Gratuito y Oficial:** No requiere cuotas mensuales, licencias ni intermediarios.
2. **Cumplimiento automático de VERI*FACTU:** Cada factura emitida desde el portal web de la AEAT queda registrada de forma inmediata y automática en los servidores de Hacienda, cumpliendo al 100% todas las exigencias legales.
3. **Sin límite de facturación:** No hay límite de número de facturas que se pueden emitir al mes o al año.
4. **Generación automática de PDF y QR:** La propia plataforma de la AEAT genera la factura en formato PDF oficial con su código QR reglamentario y datos de verificación para enviársela al cliente.
5. **Identificación estándar:** Se accede con **Certificado Electrónico**, **DNI electrónico** o sistema **Cl@ve** (del titular o del representante apoderado).

### ¿Qué limitaciones tiene la aplicación de la AEAT frente a tu día a día?
* **Facturas Nominativas (con destinatario identificado):** La herramienta pública está pensada para facturas completas nominativas (donde pones el NIF/CIF o NIE del cliente o comercio).
* **Venta directa / Tiques (Factura simplificada sin datos de cliente):** Si vendes directamente en la granja o en mercadillos a particulares sin pedirles su DNI, Hacienda no tiene un TPV de caja en esa web. Para ventas minoristas sin NIF, se registran en tu libro diario de ingresos de la granja (en la pestaña `HISTÓRICO_Y_CONTABILIDAD`) y, si el cliente pide factura o es un grupo de consumo/restaurante/tienda, se emite directamente en la aplicación de la AEAT.

### ¿Cómo integrarlo con el flujo de Libreavedrio?
Es la combinación perfecta de agilidad y coste cero:
1. **Tu Excel / Google Sheets** te da el control diario de pedidos, preparación, entregas y pagos.
2. Cuando un cliente particular o empresa solicite factura oficial (o para facturar a tiendas/restaurantes):
   - Entras en la Sede de la AEAT con tu Cl@ve o Certificado.
   - Copias los datos fiscales del cliente (que ya tienes guardados en la pestaña `CLIENTES` de tu hoja).
   - Emites la factura en 1 minuto en la web de Hacienda y descargas el PDF con QR oficial para enviárselo por WhatsApp o Email.

---

## 7. Esquema de Sincronización: Del Pedido en la Web a Hacienda (Paso a Paso)

Para que todo el circuito funcione como un reloj y sin duplicar trabajo, la sincronización entre tu web, tu Google Sheets y el portal de Hacienda se articula en **3 niveles de automatización progresivos**:

```
[ PASO 1: ENTRADA ] ──► [ PASO 2: CONTROL Y PREPARACIÓN ] ──► [ PASO 3: FACTURACIÓN HACIENDA ]
Cliente pide en web       Tu Google Sheets ("ERP Ligero")      Portal AEAT (Veri*factu)
(contacto / pedidos)      • Estados con colores                 • Emisión oficial 0 €
                          • Alertas cobro / entrega             • PDF con código QR
```

### Detalle del Flujo de Sincronización:

#### 1. Sincronización de Datos del Cliente y Pedido (Web ➔ Google Sheets)
* **Automática e instantánea:** Cuando el cliente rellena el formulario en la web, el script guarda automáticamente en la pestaña `CLIENTES` los datos fiscales (Nombre/Razón Social, NIF/CIF, Dirección) y en `PEDIDOS_ACTIVOS` los datos del encargo (Docenas, Fecha, Importe, Método de pago).
* **Identificador común:** Cada encargo tiene un identificador (ejemplo: `PED-2027-014`). Este identificador será el que luego uses como referencia o concepto de tu factura en Hacienda.

#### 2. Casillas de Sincronización en tu Hoja de Cálculo
En la pestaña `PEDIDOS_ACTIVOS`, se añaden tres columnas específicas para tener todo sincronizado a golpe de vista:

| ID Pedido | Cliente | Total (€) | Estado Pedido | Estado Cobro | ¿Requiere Factura? | Nº Factura AEAT | Enlace PDF Factura |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| #1001 | Tienda Eco Sierra | 90,00 € | ⚪ Entregado | 🟢 Pagado | **SÍ** | `FAC-2027-003` | [Ver PDF AEAT ↗] |
| #1002 | María Gómez (Part.) | 18,00 € | ⚪ Entregado | 🟢 Pagado | **NO** (Tiquet) | *— (Libro ventas)* | *—* |
| #1003 | Rest. El Pinar | 135,00 € | 🟡 En prep. | 🔴 Pendiente | **SÍ** | *(Pendiente)* | *(Subir tras emitir)* |

#### 3. El Momento de la Emisión en la AEAT
* **¿Cuándo se emite?:** Las facturas para empresas, tiendas o grupos de consumo se emiten habitualmente en el momento de la entrega o a final de mes agrupadas.
* **Proceso de emisión (2 minutos):**
  1. Abres la **Aplicación de facturación de la AEAT**.
  2. Si el cliente ya es habitual, la propia aplicación de la AEAT te permite guardarlo en su libreta de clientes interna para no tener que teclear su NIF dos veces.
  3. Introduces el número de docenas y el importe.
  4. La AEAT genera el número oficial (ej. `FAC-2027-003`), envía el registro a los servidores de Hacienda con Veri*factu y te descarga el PDF con el QR oficial.
* **Cierre del ciclo en Google Sheets:**
  - En tu hoja de cálculo pegas el número oficial emitido (`FAC-2027-003`) y arrastras el PDF a tu carpeta de Google Drive vinculada (o le pegas el link).
  - Al marcarla como facturada, la fila se archiva automáticamente en la contabilidad del trimestre.

#### 4. Ventajas de esta Sincronización:
* **Cero discrepancias contables:** Lo que tienes registrado en tu Google Sheets coincide céntimo a céntimo con lo registrado en la Agencia Tributaria.
* **Coste mensual cero:** No pagas 20 € o 40 € al mes a plataformas de software privadas por funciones que la web de la AEAT y Google Sheets hacen gratis.
* **Tranquilidad ante inspecciones:** Cada factura emitida desde la AEAT cuenta con el sello y registro oficial inalterable de Veri*factu desde el primer segundo.

---

### Enlaces y rutas oficiales de consulta en la AEAT:
* **Portal Principal SIF y VERI\*FACTU (Sede Electrónica AEAT):**  
  [https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html)
* **Acceso directo al trámite «Acceso a la Aplicación de facturación de la AEAT»:**  
  Ruta en la Sede: `Inicio > IVA > Sistemas Informáticos de Facturación (SIF) y VERI*FACTU > Acceso a la Aplicación de facturación de la AEAT`.
* **Guía y Manual de Usuario oficial de la Aplicación de Facturación:**  
  Disponible en el bloque de ayuda del portal anterior (sección *Manuales y Guías prácticas*).
* **Preguntas Frecuentes de la AEAT sobre SIF y Veri\*factu:**  
  [Preguntas Frecuentes SIF en la Sede de la AEAT](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html)

---

## 8. Próximos Pasos Recomendados (Roadmap hacia Feb 2027)

1. **Fase 1 (Actual - Contacto):**
   - El formulario actual funciona con Formspree (fiable y gratuito para empezar).
   - Cuando se desee, se puede conectar un Google Apps Script para volcar los contactos a Google Sheets sin coste ni límites.

2. **Fase 2 (Finales 2026 - Pruebas de Pedidos):**
   - Diseñar la hoja de Google Sheets "Panel de Control Libreavedrio" con las 4 pestañas y menús desplegables de colores.
   - Probar el script de recepción de pedidos.

3. **Fase 3 (Enero 2027 - Lanzamiento de Pedidos):**
   - Sustituir el aviso "PRONTO" de `pedidos.html` por el formulario maquetado de 3 bloques.
   - Enlazar la hoja de pedidos y configurar las plantillas de mensajes directos para WhatsApp/Email.

