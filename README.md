# Libreavedrio - Granja Avícola Ecológica

Este proyecto es la página web oficial de **Libreavedrio**, una granja avícola ecológica situada en la Sierra Norte de Madrid. La web está diseñada para ser una landing page moderna, responsive y fácil de configurar, que refleja los valores de sostenibilidad y bienestar animal de la granja.

## 📁 Estructura del Proyecto

El proyecto sigue una estructura limpia y modular para facilitar su mantenimiento:

-   `index.html`: Punto de entrada principal de la aplicación. Contiene la estructura semántica de la landing page.
-   `src/`: Directorio con el código fuente del sitio.
    -   `config.css`: Archivo central de configuración de estilos mediante variables CSS (design tokens).
    -   `style.css`: Estilos principales y componentes del sitio (layout, secciones, formularios, etc.).
    -   `main.js`: Lógica principal en JavaScript (interacciones, desplazamiento suave, validación y envío de formularios).
-   `public/`: Contiene los recursos estáticos como imágenes (`images/`), iconos (`favicon.png`) y utilidades gráficas (`marker.svg`).

## 🛠️ Configuración de Estilos (`src/config.css`)

El archivo `src/config.css` funciona como el **panel de control visual** de la web. Aquí se definen las variables globales de CSS que permiten cambiar la apariencia del sitio de forma centralizada.

### Propiedades Disponibles:

#### 🎨 Colores
-   `--color-bg`: Color de fondo principal (crema suave).
-   `--color-text`: Color de texto principal (gris oscuro/negro).
-   `--color-marker`: Color para elementos decorativos tipo "rotulador".
-   `--color-accent`: Color de acento (naranja tierra).
-   `--color-secondary`: Color de fondo secundario para secciones alternas.
-   `--color-nav-bg`: Fondo de la barra de navegación.

#### 🖋️ Tipografía
-   `--font-heading`: Fuente utilizada para títulos (`Montserrat`).
-   `--font-body`: Fuente utilizada para el cuerpo de texto (`Open Sans`).

#### 📏 Espaciado y Dimensiones
-   `--spacing-section`: Espaciado vertical entre secciones.
-   `--spacing-container`: Margen lateral interno de los contenedores.
-   `--width-container`: Ancho máximo del contenido (1000px).
-   `--header-height`: Altura fija del header para cálculos de posicionamiento.

#### 🏷️ Logo y Elementos Específicos
-   `--width-logo-wrapper`: Controla el tamaño del contenedor del logo en la sección Hero.
-   `--logo-subtitle-letter-spacing`: Ajusta el espaciado entre letras del subtítulo del logo para alineación perfecta.
-   `--bezier-stroke-width`: Grosor de las líneas curvas (separadores bezier) entre secciones.

#### 🖱️ Interacción y Scroll
-   `--scroll-offset`: Margen superior que se deja al saltar a una sección mediante el menú, evitando que el header tape el título.

## 🚀 Desarrollo

Para ejecutar el proyecto localmente, asegúrate de tener instalado Node.js y sigue estos pasos:

1.  Instala las dependencias:
    ```bash
    npm install
    ```
2.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
3.  Para construir el proyecto para producción:
    ```bash
    npm run build
    ```

## 🌐 Despliegue en GitHub Pages

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages mediante **GitHub Actions**.

### Pasos para activar el despliegue:

1.  **Sube los cambios a GitHub**: Asegúrate de que los archivos `.github/workflows/deploy.yml` y `vite.config.js` están en tu repositorio.
2.  **Configura el Repositorio**:
    -   Ve a la pestaña **Settings** (Ajustes) de tu repositorio en GitHub.
    -   En el menú lateral izquierdo, haz clic en **Pages**.
    -   En la sección **Build and deployment > Source**, selecciona **GitHub Actions** en el desplegable.
3.  **¡Listo!**: A partir de ahora, cada vez que hagas un `git push` a la rama `main`, la web se compilará y desplegará automáticamente.

La URL de tu web será algo como: `https://datoscarlesgutierrez-stack.github.io/libreavedriov1/`

---
Diseñado y desarrollado para representar la esencia de la agricultura ecológica y el respeto animal.