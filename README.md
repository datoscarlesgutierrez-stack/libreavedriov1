# Libreavedrio - Web Multisección y Modular

Sitio web oficial de **Granja Libreavedrio**, proyecto de avicultura ecológica y sostenible en la Sierra Norte de Madrid.

Diseñado y maquetado con una arquitectura frontend ligera, accesible y responsive basada en **Vite**, **HTML5 semántico**, **CSS nativo con design tokens** y **JavaScript vanilla**.

---

## 📁 Estructura del Proyecto

- `index.html`: Portada con slider hero, manifiesto y accesos principales.
- `historia.html`: Historia y orígenes del proyecto.
- `principios.html`: Manifiesto y principios ideológicos (bienestar animal, sostenibilidad real, soberanía alimentaria).
- `granja.html`: Visión general de las instalaciones.
- `granja-nave.html`: Nave de descanso y puesta.
- `granja-parque.html`: Parque exterior arbolado.
- `granja-embalaje.html`: Centro de clasificación y envasado.
- `granja-compostera.html`: Sistema de compostaje e integración con huertas ecológicas.
- `granja-huevos.html`: Información sobre el producto y marcado código 0.
- `pedidos.html`: Estado de pedidos y apertura comercial.
- `contacto.html`: Formulario directo de contacto y pedidos artesanales.
- `src/`:
  - `config.css`: Variables globales (paleta de colores, tipografías, alturas de cabecera y márgenes de scroll).
  - `style.css`: Hojas de estilos modulares y componentes visuales.
  - `main.js`: Lógica interactiva (menús desplegables, sticky header, scroll y utilidades).
- `public/`: Archivos estáticos, imágenes, iconos y `CNAME`.

---

## 🛠️ Instalación y Desarrollo Local

Requisitos: Node.js (versión 18 o superior).

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local de desarrollo con recarga en caliente
npm run dev

# 3. Compilar para producción (genera la carpeta dist/)
npm run build
```

---

## 🚀 Cómo Realizar Cambios y Desplegarlos en GitHub Pages

Para realizar modificaciones futuras y asegurar que se publiquen correctamente en el dominio en vivo:

### 1. Hacer cambios y probar en local
Modifica los archivos necesarios en HTML, CSS o JS y verifica el resultado en local con `npm run dev`.

### 2. Desplegar la nueva versión compilada
El sitio en producción se publica mediante la herramienta `gh-pages` a partir de la carpeta `dist/`. Ejecuta:

```bash
npm run deploy
```

Este comando ejecuta automáticamente:
1. `npm run build` (compila assets, genera todas las páginas HTML y copia el archivo `CNAME`).
2. Sube la compilación a la rama `gh-pages` en el repositorio remoto.

### 3. Guardar el código fuente en el repositorio
Para registrar los cambios en la rama principal (`main`):

```bash
git add .
git commit -m "feat: descripción de tus cambios"
git push origin main
```

---

## 🌐 Configuración de Dominio Personalizado y HTTPS

- Dominio configurado: `granjalibreavedrio.es` y `www.granjalibreavedrio.es`.
- El archivo `public/CNAME` contiene el dominio raíz para persistir la configuración tras cada build.
- **HTTPS gratuito**: GitHub Pages emite certificados SSL automáticamente vía Let's Encrypt. Una vez completada la verificación DNS en los servidores de GitHub, la opción **Enforce HTTPS** queda disponible para su activación en *Settings > Pages*.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**, una licencia de código abierto permisiva que permite su uso, modificación, distribución y reutilización libre para proyectos personales o comerciales.

---

## 👨‍💻 Desarrollo Web

- **Carles Gutiérrez**: [Consultoría y Desarrollo Web](https://carlesgutierrez.github.io/consultoria-digital/)
