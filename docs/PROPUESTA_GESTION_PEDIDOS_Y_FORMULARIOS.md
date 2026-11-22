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

## 6. Próximos Pasos Recomendados (Roadmap hacia Feb 2027)

1. **Fase 1 (Actual - Contacto):**
   - El formulario actual funciona con Formspree (fiable y gratuito para empezar).
   - Cuando se desee, se puede conectar un Google Apps Script para volcar los contactos a Google Sheets sin coste ni límites.

2. **Fase 2 (Finales 2026 - Pruebas de Pedidos):**
   - Diseñar la hoja de Google Sheets "Panel de Control Libreavedrio" con las 4 pestañas y menús desplegables de colores.
   - Probar el script de recepción de pedidos.

3. **Fase 3 (Enero 2027 - Lanzamiento de Pedidos):**
   - Sustituir el aviso "PRONTO" de `pedidos.html` por el formulario maquetado de 3 bloques.
   - Enlazar la hoja de pedidos y configurar las plantillas de mensajes directos para WhatsApp/Email.
