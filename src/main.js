import './style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

document.addEventListener('DOMContentLoaded', () => {
    // Permitir reiniciar intro o rotación con ?intro=reset en la URL
    if (new URLSearchParams(window.location.search).get('intro') === 'reset') {
        sessionStorage.removeItem('intro_seen');
        sessionStorage.removeItem('hero_slide_index');
    }

    // 1. Hero Background: Rotación entre fotos de bosque_ empezando por una aleatoria en la sesión
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        const savedIndex = sessionStorage.getItem('hero_slide_index');
        let currentIndex;

        if (savedIndex === null || isNaN(parseInt(savedIndex, 10))) {
            // Primera imagen de la sesión: elegimos una aleatoria entre las fotos de bosque_
            currentIndex = Math.floor(Math.random() * heroSlides.length);
        } else {
            currentIndex = parseInt(savedIndex, 10) % heroSlides.length;
        }

        // Asignamos la imagen correspondiente a esta página
        heroSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });

        // Preparamos el índice de la siguiente imagen
        const nextIndex = (currentIndex + 1) % heroSlides.length;
        sessionStorage.setItem('hero_slide_index', nextIndex.toString());
    }

    // 2. Cinematic Initial Intro Animation (Solo en la primera visita a la Home en la sesión)
    const heroIntro = document.querySelector('.hero-intro');
    const isHomePage =
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/');

    const introSeen = sessionStorage.getItem('intro_seen');

    if (isHomePage && !introSeen && heroIntro) {
        // Step 0: Full image only (100vh), logo & buttons hidden
        heroIntro.classList.add('is-animating');

        // Step 1: Logo appears at 800ms
        setTimeout(() => {
            heroIntro.classList.add('step-logo');
            alignLogoSubtitle();
        }, 800);

        // Step 2: Hero shrinks to configured height at 1800ms
        setTimeout(() => {
            heroIntro.classList.add('step-shrink');
            setTimeout(alignLogoSubtitle, 900);
        }, 1800);

        // Step 3: Buttons appear one by one at 2700ms
        setTimeout(() => {
            heroIntro.classList.add('step-buttons');
        }, 2700);

        // Step 4: Animation finished at 3600ms, mark as seen
        setTimeout(() => {
            heroIntro.classList.remove('is-animating', 'step-logo', 'step-shrink', 'step-buttons');
            sessionStorage.setItem('intro_seen', 'true');
            alignLogoSubtitle();
        }, 3600);
    }

    // 3. Sticky Nav Behavior on Scroll
    const nav = document.getElementById('main-nav');
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (heroIntro && nav) {
            const heroBottom = heroIntro.offsetTop + heroIntro.offsetHeight - 65;
            if (scrollY >= heroBottom) {
                nav.classList.add('is-sticky');
            } else {
                nav.classList.remove('is-sticky');
            }
        }
    }
    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();

    // 4. Dropdown Menu — Click (toggle) + Hover con delays
    const dropdownContainers = document.querySelectorAll('.nav-dropdown');
    dropdownContainers.forEach((dropdown) => {
        const btn = dropdown.querySelector('.nav-dropdown-btn');
        let hoverOpenTimer = null;
        let hoverCloseTimer = null;

        function openDropdown() {
            clearTimeout(hoverCloseTimer);
            dropdownContainers.forEach((d) => { if (d !== dropdown) d.classList.remove('is-open'); });
            dropdown.classList.add('is-open');
        }
        function closeDropdown() {
            clearTimeout(hoverOpenTimer);
            dropdown.classList.remove('is-open');
        }

        // Click: abre/cierra inmediatamente (sin delay)
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                clearTimeout(hoverOpenTimer);
                clearTimeout(hoverCloseTimer);
                const isOpen = dropdown.classList.contains('is-open');
                dropdownContainers.forEach((d) => d.classList.remove('is-open'));
                if (!isOpen) dropdown.classList.add('is-open');
            });
        }

        // Hover — abre tras 300ms de hover sobre el botón
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(hoverCloseTimer);
            hoverOpenTimer = setTimeout(openDropdown, 300);
        });

        // Cierra con 500ms de gracia al salir del dropdown completo (botón + panel)
        dropdown.addEventListener('mouseleave', () => {
            clearTimeout(hoverOpenTimer);
            hoverCloseTimer = setTimeout(closeDropdown, 500);
        });
    });

    // Cierra al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            dropdownContainers.forEach((d) => d.classList.remove('is-open'));
        }
    });

    // 5. Polaroid Slideshow (On granja.html)
    let polaroidInterval = null;
    function initPolaroid() {
        if (polaroidInterval) {
            clearInterval(polaroidInterval);
            polaroidInterval = null;
        }

        const visuals = document.querySelectorAll('.polaroid-img');
        const caption = document.querySelector('.polaroid-caption');

        if (visuals.length > 0) {
            let currentIndex = 0;

            if (caption && visuals[0].getAttribute('title')) {
                caption.innerText = visuals[0].getAttribute('title');
            }

            polaroidInterval = setInterval(() => {
                visuals[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % visuals.length;
                visuals[currentIndex].classList.add('active');

                if (caption) {
                    const newTitle = visuals[currentIndex].getAttribute('title');
                    if (newTitle) caption.innerText = newTitle;
                }
            }, 4000);
        }
    }

    // 6. OpenStreetMap with Leaflet (On index.html)
    let leafletMapInstance = null;
    function initLeafletMap() {
        const osmContainer = document.getElementById('osm-map');
        if (!osmContainer) return;

        if (leafletMapInstance) {
            try {
                leafletMapInstance.remove();
            } catch (err) {
                console.warn(err);
            }
            leafletMapInstance = null;
        }

        try {
            const mapCoords = [41.055714517046276, -3.6072308811227165];
            leafletMapInstance = L.map('osm-map', {
                center: mapCoords,
                zoom: 15,
                dragging: false,       // Sin arrastrar con ratón ni dedo
                touchZoom: true,       // Pinch-to-zoom en móvil: sí
                scrollWheelZoom: true, // Rueda del ratón: sí
                doubleClickZoom: true, // Doble click zoom: sí
                boxZoom: false,        // Selección con shift+drag: no
                keyboard: false,       // Teclas de cursor: no
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(leafletMapInstance);

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div class="custom-pin-marker"><span>🥚</span></div>',
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -32]
            });

            const marker = L.marker(mapCoords, { icon: customIcon }).addTo(leafletMapInstance);

            const popupContent = `
                <div class="map-popup-card">
                    <h4>Granja Libreavedrio</h4>
                    <p>Piñuécar-Gandullas, Madrid</p>
                    <a href="https://www.google.com/maps?q=${mapCoords[0]},${mapCoords[1]}" target="_blank" rel="noopener" class="popup-link">Abrir en Google Maps</a>
                </div>
            `;
            marker.bindPopup(popupContent);
        } catch (err) {
            console.error('Error initializing Leaflet map:', err);
        }
    }

    // 7. Contact Form (On contacto.html)
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const formSuccess = document.getElementById('form-success');
        const formError = document.getElementById('form-status-error');
        const submitBtn = document.getElementById('submit-button');
        const resetBtn = document.getElementById('reset-form');
        const phoneInput = document.getElementById('tel');

        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const prefix = '+34 ';
                if (!e.target.value.startsWith(prefix)) {
                    e.target.value = prefix;
                }
                const numbersOnly = e.target.value.substring(prefix.length).replace(/\D/g, '');
                e.target.value = prefix + numbersOnly.substring(0, 9);
            });
        }

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const data = new FormData(event.target);

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'ENVIANDO...';
                }
                if (formError) formError.style.display = 'none';

                try {
                    const response = await fetch(event.target.action, {
                        method: form.method,
                        body: data,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        form.style.display = 'none';
                        if (formSuccess) formSuccess.style.display = 'block';
                        form.reset();
                    } else {
                        if (formError) {
                            formError.innerText = 'Huy, algo ha ido mal. Por favor, inténtalo de nuevo.';
                            formError.style.display = 'block';
                        }
                    }
                } catch (error) {
                    if (formError) {
                        formError.innerText = 'Error de conexión. Revisa tu red e inténtalo de nuevo.';
                        formError.style.display = 'block';
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'ENVIAR EN UN CLIC';
                    }
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (formSuccess) formSuccess.style.display = 'none';
                if (form) form.style.display = 'flex';
                if (formError) formError.style.display = 'none';
                if (phoneInput) phoneInput.value = '+34 ';
            });
        }
    }

    // 8. Ajuste exacto del subtítulo: siempre en una sola línea y con el mismo ancho exacto del logo
    function alignLogoSubtitle() {
        const wrappers = document.querySelectorAll('.logo-wrapper');
        wrappers.forEach((wrapper) => {
            const logo = wrapper.querySelector('.main-logo-graphic');
            const subtitle = wrapper.querySelector('.logo-subtitle');
            if (!logo || !subtitle) return;

            const targetWidth = logo.getBoundingClientRect().width;
            if (targetWidth <= 20) return;

            // Reset: sin letter-spacing ni font-size inline para medir el texto en estado natural
            subtitle.style.letterSpacing = '0px';
            subtitle.style.fontSize = '';

            // Medimos el ancho REAL del texto usando Range (evita el problema de scrollWidth
            // en elementos con width:100% que devuelve el ancho del contenedor, no del texto)
            const range = document.createRange();
            range.selectNodeContents(subtitle);
            const rawWidth = range.getBoundingClientRect().width;

            const text = (subtitle.textContent || '').trim();
            const charCount = text.length;

            if (charCount > 1 && rawWidth > 0) {
                const diff = targetWidth - rawWidth;
                if (diff >= 0) {
                    // letter-spacing CSS añade espacio tras CADA carácter incluyendo el último,
                    // por eso dividimos entre charCount (no charCount-1) para que el texto
                    // llegue exactamente al borde derecho sin desbordarse.
                    const perChar = diff / charCount;
                    subtitle.style.letterSpacing = perChar.toFixed(3) + 'px';
                } else {
                    // Texto más ancho que el logo (pantallas muy estrechas): reducir fuente
                    const scale = targetWidth / rawWidth;
                    const baseFont = parseFloat(window.getComputedStyle(subtitle).fontSize);
                    subtitle.style.fontSize = (baseFont * scale * 0.98).toFixed(2) + 'px';
                    subtitle.style.letterSpacing = '0px';
                }
            }
        });
    }

    if (document.fonts) {
        document.fonts.ready.then(alignLogoSubtitle);
    }
    const logoObserver = new ResizeObserver(() => {
        alignLogoSubtitle();
    });
    document.querySelectorAll('.logo-wrapper').forEach((w) => logoObserver.observe(w));
    window.addEventListener('resize', alignLogoSubtitle);

    // Inicializar funciones de página
    function initPageFeatures() {
        initLeafletMap();
        initPolaroid();
        initContactForm();
        alignLogoSubtitle();
    }
    initPageFeatures();

    // 8. Footer Logo Scroll to Top
    document.addEventListener('click', (e) => {
        if (e.target.closest('#footer-logo-top')) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // 9. NAVEGACIÓN CLIENT-SIDE (Cero parpadeo, cabecera y botones 100% estáticos)
    function getPageFileName(urlStr) {
        try {
            const url = new URL(urlStr, window.location.href);
            const path = url.pathname;
            const file = path.split('/').pop() || 'index.html';
            return file;
        } catch {
            return '';
        }
    }

    function updateActiveNav(targetFile) {
        const isTargetHome = targetFile === 'index.html' || targetFile === '';
        
        // Actualizar items de menú principal
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;
            const itemFile = getPageFileName(href);
            item.classList.toggle('active', itemFile === targetFile);
        });

        // Actualizar botón dropdown ¿QUIÉNES SOMOS?
        const dropdownBtn = document.querySelector('.nav-dropdown-btn');
        if (dropdownBtn) {
            const isSubDropdownPage = targetFile === 'historia.html' || targetFile === 'principios.html';
            dropdownBtn.classList.toggle('active', isSubDropdownPage);
        }

        // Actualizar items dentro del dropdown
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;
            const itemFile = getPageFileName(href);
            item.classList.toggle('active', itemFile === targetFile);
        });
    }

    function advanceHeroSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        if (!slides.length) return;
        let currentIdx = -1;
        slides.forEach((slide, i) => {
            if (slide.classList.contains('active')) currentIdx = i;
        });
        if (currentIdx === -1) currentIdx = 0;
        const nextIdx = (currentIdx + 1) % slides.length;
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === nextIdx);
        });
        sessionStorage.setItem('hero_slide_index', ((nextIdx + 1) % slides.length).toString());
    }

    let isNavigating = false;
    async function navigateTo(url, pushState = true) {
        const currentFile = getPageFileName(window.location.href);
        const targetFile = getPageFileName(url);

        // Si es la misma página: ¡absolutamente nada que hacer! Cero parpadeo
        if (currentFile === targetFile && !url.includes('#')) {
            return;
        }

        if (isNavigating) return;
        isNavigating = true;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');

            if (newMain && currentMain) {
                // Cerrar cualquier dropdown abierto
                dropdownContainers.forEach((d) => d.classList.remove('is-open'));

                // Limpieza de Leaflet y polaroid anteriores
                if (leafletMapInstance) {
                    try { leafletMapInstance.remove(); } catch (e) { /* ignore */ }
                    leafletMapInstance = null;
                }
                if (polaroidInterval) {
                    clearInterval(polaroidInterval);
                    polaroidInterval = null;
                }

                // Transición suave y rápida de contenido (solo el main cambia, el header se queda intacto)
                currentMain.style.transition = 'opacity 0.14s ease';
                currentMain.style.opacity = '0';

                setTimeout(() => {
                    currentMain.innerHTML = newMain.innerHTML;
                    document.title = doc.title;
                    updateActiveNav(targetFile);

                    // Transición de imagen del hero con fade
                    advanceHeroSlide();

                    if (pushState) {
                        window.history.pushState(null, doc.title, url);
                    }

                    window.scrollTo({ top: 0, behavior: 'instant' });
                    handleNavScroll();

                    // Re-inicializar componentes
                    initPageFeatures();

                    currentMain.style.opacity = '1';
                    isNavigating = false;
                }, 140);
            } else {
                window.location.href = url;
            }
        } catch (err) {
            console.warn('Fallback standard navigation:', err);
            window.location.href = url;
        }
    }

    // Interceptar clicks de navegación
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Enlaces externos o especiales
        if (
            link.target === '_blank' ||
            href.startsWith('http://') ||
            href.startsWith('https://') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('javascript:')
        ) {
            return;
        }

        // Ancla en la misma página
        if (href.startsWith('#')) {
            const targetEl = document.querySelector(href);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        const currentFile = getPageFileName(window.location.href);
        const targetFile = getPageFileName(href);

        // Si es la misma página (ej: click en "LA GRANJA" estando en la granja)
        if (currentFile === targetFile && !href.includes('#')) {
            e.preventDefault();
            // ¡No hacer nada! Cero parpadeo
            return;
        }

        // Navegación suave sin recarga de cabecera
        e.preventDefault();
        navigateTo(href, true);
    });

    // Soporte para botones Atrás/Adelante del navegador
    window.addEventListener('popstate', () => {
        navigateTo(window.location.href, false);
    });
});
