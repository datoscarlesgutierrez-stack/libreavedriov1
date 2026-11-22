// =====================================================================
//  ANIMATION & HERO SLIDESHOW MODULE
// =====================================================================

import { alignLogoSubtitle } from './subtitle.js';
import { getCssConfigBool, getPageFileName } from './utils.js';

/**
 * Avanza o cambia aleatoriamente la imagen de fondo del hero (bosque_)
 */
export function advanceHeroSlide(random = false) {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;

    let currentIdx = -1;
    slides.forEach((slide, i) => {
        if (slide.classList.contains('active')) currentIdx = i;
    });
    if (currentIdx === -1) currentIdx = 0;

    let nextIdx;
    if (random && slides.length > 1) {
        // Seleccionar aleatoriamente una foto DISTINTA a la actual
        do {
            nextIdx = Math.floor(Math.random() * slides.length);
        } while (nextIdx === currentIdx);
    } else {
        nextIdx = (currentIdx + 1) % slides.length;
    }

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === nextIdx);
    });

    // Guardar para que la navegación secuencial continúe a partir de la nueva imagen
    sessionStorage.setItem('hero_slide_index', ((nextIdx + 1) % slides.length).toString());
}

/**
 * Inicializa la rotación de fondo en la carga de la página
 */
export function initHeroSlideshow() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (!heroSlides.length) return;

    const savedIndex = sessionStorage.getItem('hero_slide_index');
    let currentIndex;

    if (savedIndex === null || isNaN(parseInt(savedIndex, 10))) {
        currentIndex = Math.floor(Math.random() * heroSlides.length);
    } else {
        currentIndex = parseInt(savedIndex, 10) % heroSlides.length;
    }

    heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
    });

    const nextIndex = (currentIndex + 1) % heroSlides.length;
    sessionStorage.setItem('hero_slide_index', nextIndex.toString());
}

/**
 * Animación cinematográfica inicial:
 * - Empieza en 100vh a pantalla completa (solo fondo).
 * - A los 800ms: aparece el logo y subtítulo.
 * - A los 1800ms: el hero se contrae a su altura normal (50vh) y la página sube.
 * - A los 2700ms: aparecen en cascada los botones del header (1 al 5).
 * - A los 3600ms: finaliza y se marca como vista.
 */
export function playIntroAnimation(isReplay = false) {
    const hero = document.querySelector('.hero-intro');
    if (!hero) return;

    // Limpieza de clases previas
    hero.classList.remove('reversing', 'expand-full', 'step-logo', 'step-shrink', 'step-buttons');
    hero.classList.add('is-animating');

    if (isReplay) {
        hero.classList.add('replay-intro');
        // En replay el logo ya está visible y la pantalla está abierta a 100vh.
        hero.classList.add('step-shrink');
        document.body.classList.remove('hero-revealing');
        setTimeout(alignLogoSubtitle, 1200);

        // Los botones entran en cascada
        setTimeout(() => {
            hero.classList.add('step-buttons');
        }, 1250);

        // Fin de la secuencia
        setTimeout(() => {
            hero.classList.remove('is-animating', 'replay-intro', 'step-logo', 'step-shrink', 'step-buttons');
            sessionStorage.setItem('intro_seen', 'true');
            alignLogoSubtitle();
        }, 2350);
    } else {
        // Primera visita:
        // Step 1: Aparece el logo
        setTimeout(() => {
            hero.classList.add('step-logo');
            alignLogoSubtitle();
        }, 800);

        // Step 2: La portada se encoge a su tamaño normal (50vh)
        setTimeout(() => {
            hero.classList.add('step-shrink');
            setTimeout(alignLogoSubtitle, 900);
        }, 1800);

        // Step 3: Los botones del menú entran uno a uno
        setTimeout(() => {
            hero.classList.add('step-buttons');
        }, 2700);

        // Step 4: Animación terminada
        setTimeout(() => {
            hero.classList.remove('is-animating', 'step-logo', 'step-shrink', 'step-buttons');
            sessionStorage.setItem('intro_seen', 'true');
            alignLogoSubtitle();
        }, 3600);
    }
}

/**
 * Transición al pulsar el Logo:
 * 1. Salen los botones en cascada inversa (5 al 1).
 * 2. La página de abajo se desliza suavemente hacia abajo destapando el fondo.
 * 3. El hero se expande a pantalla completa (100vh).
 * 4. El logo permanece siempre visible.
 * 5. La imagen de fondo hace un fundido fade-out / fade-in a una nueva foto aleatoria sin repetición.
 * 6. La página vuelve a subir y los botones reaparecen ordenadamente.
 */
let isReplayingIntro = false;
export function triggerLogoReplaySequence(url = 'index.html', updateActiveNav, initPageFeatures) {
    if (isReplayingIntro) return;
    isReplayingIntro = true;

    const hero = document.querySelector('.hero-intro');
    if (!hero) {
        window.location.href = url;
        return;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Paso 1: Salida en cascada inversa de los botones
    hero.classList.add('reversing');

    // Paso 2: La página inferior se desliza hacia abajo destapando el hero
    document.body.classList.add('hero-revealing');

    // Paso 3: El hero se expande a 100vh
    setTimeout(() => {
        hero.classList.add('expand-full');

        // Cargar home en segundo plano si veníamos de otra página
        const currentFile = getPageFileName(window.location.href);
        const targetFile = getPageFileName(url);
        if (currentFile !== targetFile) {
            fetch(url)
                .then((res) => res.text())
                .then((html) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newMain = doc.querySelector('main');
                    const main = document.querySelector('main');
                    if (newMain && main) {
                        main.innerHTML = newMain.innerHTML;
                        document.title = doc.title;
                        if (updateActiveNav) updateActiveNav(targetFile);
                        window.history.pushState(null, doc.title, url);
                        if (initPageFeatures) initPageFeatures();
                    }
                })
                .catch((err) => console.warn('Error fetching home in logo replay:', err));
        }

        // Paso 4: Con el fondo a 100vh, fade-in a foto aleatoria sin repetición
        setTimeout(() => {
            advanceHeroSlide(true);

            // Paso 5: La portada se contrae de nuevo y los botones entran
            setTimeout(() => {
                hero.classList.remove('reversing', 'expand-full');
                playIntroAnimation(true);
                setTimeout(() => {
                    isReplayingIntro = false;
                }, 2400);
            }, 750);
        }, 850);
    }, 220);
}

