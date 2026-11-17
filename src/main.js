import './style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hero Background: Rotación secuencial al cambiar de página (sin carrusel automático)
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        // Obtenemos el índice guardado de la última imagen vista en la sesión
        const lastIndex = parseInt(sessionStorage.getItem('hero_slide_index') || '0', 10);
        
        // Asignamos la imagen correspondiente a esta página
        heroSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === lastIndex);
        });

        // Preparamos el índice de la siguiente imagen para cuando el usuario cambie de página
        const nextIndex = (lastIndex + 1) % heroSlides.length;
        sessionStorage.setItem('hero_slide_index', nextIndex.toString());
    }

    // 2. Cinematic Initial Intro Animation (Only on Home page first visit)
    const heroIntro = document.querySelector('.hero-intro');
    const isHomePage =
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/');

    // Allow resetting the intro animation with ?intro=reset in the URL
    if (new URLSearchParams(window.location.search).get('intro') === 'reset') {
        sessionStorage.removeItem('intro_seen');
    }

    const introSeen = sessionStorage.getItem('intro_seen');

    if (isHomePage && !introSeen && heroIntro) {
        // Step 0: Full image only (100vh), logo & buttons hidden
        heroIntro.classList.add('is-animating');

        // Step 1: Logo appears at 800ms
        setTimeout(() => {
            heroIntro.classList.add('step-logo');
        }, 800);

        // Step 2: Hero shrinks to compact typical web header height at 1800ms
        setTimeout(() => {
            heroIntro.classList.add('step-shrink');
        }, 1800);

        // Step 3: Buttons appear one by one at 2700ms
        setTimeout(() => {
            heroIntro.classList.add('step-buttons');
        }, 2700);

        // Step 4: Animation finished at 3600ms, mark as seen
        setTimeout(() => {
            heroIntro.classList.remove('is-animating', 'step-logo', 'step-shrink', 'step-buttons');
            sessionStorage.setItem('intro_seen', 'true');
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

    // 4. Dropdown Menu Toggle (For mobile and touch devices)
    const dropdownContainers = document.querySelectorAll('.nav-dropdown');
    dropdownContainers.forEach((dropdown) => {
        const btn = dropdown.querySelector('.nav-dropdown-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = dropdown.classList.contains('is-open');
                dropdownContainers.forEach((d) => d.classList.remove('is-open'));
                if (!isOpen) {
                    dropdown.classList.add('is-open');
                }
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            dropdownContainers.forEach((d) => d.classList.remove('is-open'));
        }
    });

    // 5. Polaroid Slideshow (On granja.html)
    const visuals = document.querySelectorAll('.polaroid-img');
    const caption = document.querySelector('.polaroid-caption');

    if (visuals.length > 0) {
        let currentIndex = 0;

        if (caption && visuals[0].getAttribute('title')) {
            caption.innerText = visuals[0].getAttribute('title');
        }

        setInterval(() => {
            visuals[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % visuals.length;
            visuals[currentIndex].classList.add('active');

            if (caption) {
                const newTitle = visuals[currentIndex].getAttribute('title');
                if (newTitle) caption.innerText = newTitle;
            }
        }, 4000);
    }

    // 6. OpenStreetMap with Leaflet (On index.html)
    const osmContainer = document.getElementById('osm-map');
    if (osmContainer) {
        try {
            const mapCoords = [41.055714517046276, -3.6072308811227165];
            const map = L.map('osm-map', {
                center: mapCoords,
                zoom: 15,
                scrollWheelZoom: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div class="custom-pin-marker"><span>🥚</span></div>',
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -32]
            });

            const marker = L.marker(mapCoords, { icon: customIcon }).addTo(map);

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

    // 8. Footer Logo Scroll to Top
    const footerLogo = document.getElementById('footer-logo-top');
    if (footerLogo) {
        footerLogo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
