// =====================================================================
//  PARSER Y APLICADOR DE CONFIGURACIÓN CENTRAL (polaroid.md)
// =====================================================================

import polaroidRaw from '../polaroid.md?raw';
import { getPageFileName } from './utils.js';

/**
 * Parsea el archivo polaroid.md en un objeto estructurado.
 */
export function parsePolaroidConfig(rawText = polaroidRaw) {
    const config = {
        footerMap: {},
        homeTexts: {},
        heroImages: [],
        polaroids: {}
    };

    let section = '';
    let currentPolaroidPage = '';

    const lines = rawText.split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('---') || line.startsWith('# ') || line.startsWith('>')) {
            continue;
        }

        if (line.startsWith('## ')) {
            const heading = line.slice(3).trim().toLowerCase();
            if (heading.includes('footer')) section = 'footerMap';
            else if (heading.includes('inicio')) section = 'homeTexts';
            else if (heading.includes('hero')) section = 'hero';
            else if (heading.includes('polaroids')) section = 'polaroids';
            else section = '';
            currentPolaroidPage = '';
            continue;
        }

        if (line.startsWith('### ') && section === 'polaroids') {
            currentPolaroidPage = line.slice(4).trim();
            if (!config.polaroids[currentPolaroidPage]) {
                config.polaroids[currentPolaroidPage] = [];
            }
            continue;
        }

        if (!line.startsWith('- ')) continue;
        const item = line.slice(2).trim();

        if (section === 'footerMap' || section === 'homeTexts') {
            const colonIdx = item.indexOf(':');
            if (colonIdx !== -1) {
                const key = item.slice(0, colonIdx).trim();
                const val = item.slice(colonIdx + 1).trim();
                config[section][key] = val;
            }
        } else if (section === 'hero') {
            config.heroImages.push(item);
        } else if (section === 'polaroids' && currentPolaroidPage) {
            const parts = item.split('|').map(p => p.trim());
            const slide = {};
            for (const part of parts) {
                const cIdx = part.indexOf(':');
                if (cIdx !== -1) {
                    const k = part.slice(0, cIdx).trim().toLowerCase();
                    const v = part.slice(cIdx + 1).trim();
                    slide[k] = v;
                }
            }
            if (slide.imagen) {
                config.polaroids[currentPolaroidPage].push(slide);
            }
        }
    }

    return config;
}

export const polaroidConfig = parsePolaroidConfig();

/**
 * Sincroniza las imágenes del Hero si difieren de polaroid.md.
 */
export function applyHeroConfig() {
    const heroBg = document.getElementById('hero-slideshow');
    if (!heroBg || !polaroidConfig.heroImages.length) return;

    const currentImgs = Array.from(heroBg.querySelectorAll('.hero-slide'));
    const currentSrcs = currentImgs.map(img => img.getAttribute('src'));
    const targetSrcs = polaroidConfig.heroImages;

    const same = currentSrcs.length === targetSrcs.length &&
        currentSrcs.every((src, i) => src === targetSrcs[i]);
    if (same) return;

    const activeIdx = Math.max(0, currentImgs.findIndex(img => img.classList.contains('active')));
    heroBg.innerHTML = targetSrcs.map((src, idx) => {
        const activeClass = idx === (activeIdx % targetSrcs.length) ? ' active' : '';
        return `<img src="${src}" alt="Bosque Granja ${idx + 1}" class="hero-slide${activeClass}">`;
    }).join('\n');
}

/**
 * Aplica los textos configurables del footer y la portada (index.html).
 */
export function applyTextsConfig() {
    const fm = polaroidConfig.footerMap;
    if (fm.footer_izquierda !== undefined) {
        const leftEl = document.querySelector('.footer-col-left .footer-item');
        if (leftEl && fm.footer_izquierda) leftEl.textContent = fm.footer_izquierda;
    }
    if (fm.footer_derecha !== undefined) {
        const rightEl = document.querySelector('.footer-col-right .footer-item');
        if (rightEl && fm.footer_derecha) rightEl.textContent = fm.footer_derecha;
    }

    const page = getPageFileName(window.location.href);
    if (page !== 'index.html') return;

    const ht = polaroidConfig.homeTexts;
    const setText = (selector, value) => {
        if (value === undefined || value === '') return;
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
    };

    setText('.home-hero-content .intro-eyebrow', ht.eyebrow);
    setText('.home-intro-title', ht.titulo);
    setText('.home-intro-text', ht.texto);

    const ctaBtn = document.querySelector('.home-hero-content .btn-editorial-cta');
    if (ctaBtn && ht.boton) {
        ctaBtn.innerHTML = `${ht.boton} <span class="btn-arrow">↗</span>`;
    }

    setText('#ubicacion .intro-eyebrow', ht.llegada_eyebrow);
    setText('#ubicacion .map-title', ht.llegada_titulo);
    setText('#ubicacion .map-lead-text', ht.llegada_texto);

    const dirPs = document.querySelectorAll('#ubicacion .map-directions-list p');
    if (dirPs[0] && ht.llegada_linea_1) dirPs[0].textContent = ht.llegada_linea_1;
    if (dirPs[1] && ht.llegada_linea_2) dirPs[1].textContent = ht.llegada_linea_2;

    const mapCta = document.querySelector('#ubicacion .map-btn-wrapper .btn-editorial-cta');
    if (mapCta && ht.llegada_boton) {
        mapCta.innerHTML = `${ht.llegada_boton} <span class="btn-arrow">↗</span>`;
    }

    setText('#ubicacion .map-note-red', ht.llegada_nota);
}

/**
 * Aplica las imágenes y pies de foto de la polaroid de la página actual desde polaroid.md.
 */
export function applyPagePolaroids() {
    const page = getPageFileName(window.location.href);
    const slidesCfg = polaroidConfig.polaroids[page];
    if (!slidesCfg || !slidesCfg.length) return;

    const card = document.querySelector('.postit-card, .polaroid-panoramic-card');
    if (!card) return;

    const container = card.querySelector('.postit-image-container');
    const captionEl = card.querySelector('.postit-caption');
    const wrapper = card.closest('.home-hero-visual, .editorial-visual, .granja-visuals, .polaroid-panoramic-wrapper') || card.parentElement;
    if (!container) return;

    // Verificar si la configuración coincide exactamente con lo que ya está en el DOM
    const existingSlides = Array.from(container.querySelectorAll('.postit-slide'));
    const matchesDom = existingSlides.length === slidesCfg.length &&
        existingSlides.every((img, i) => {
            const cfg = slidesCfg[i];
            return img.getAttribute('src') === cfg.imagen &&
                (img.getAttribute('data-caption') || '') === (cfg.caption || '');
        });

    if (!matchesDom) {
        container.innerHTML = slidesCfg.map((cfg, idx) => {
            const activeClass = idx === 0 ? ' active' : '';
            const posStyle = cfg.pos ? `object-position: ${cfg.pos};` : '';
            const alt = cfg.alt || cfg.caption || '';
            const cap = cfg.caption || '';
            return `<img src="${cfg.imagen}" alt="${alt}" class="postit-slide${activeClass}" style="${posStyle}" data-caption="${cap}">`;
        }).join('\n');

        if (slidesCfg[0].bg) {
            container.style.background = slidesCfg[0].bg;
        }
        if (captionEl && slidesCfg[0].caption !== undefined) {
            captionEl.textContent = slidesCfg[0].caption;
        }

        // Actualizar o crear controles si hay múltiples slides
        let controls = wrapper.querySelector('.postit-controls');
        if (slidesCfg.length > 1) {
            const totStr = String(slidesCfg.length).padStart(2, '0');
            if (!controls) {
                controls = document.createElement('div');
                controls.className = 'postit-controls';
                controls.innerHTML = `
                    <span class="postit-counter">01 / ${totStr}</span>
                    <div class="postit-arrows">
                        <button type="button" class="postit-arrow-btn" data-action="prev" aria-label="Foto anterior">←</button>
                        <button type="button" class="postit-arrow-btn" data-action="next" aria-label="Foto siguiente">→</button>
                    </div>
                `;
                card.insertAdjacentElement('afterend', controls);
            } else {
                const counter = controls.querySelector('.postit-counter');
                if (counter) counter.textContent = `01 / ${totStr}`;
            }
        } else if (controls) {
            controls.remove();
        }
    }
}
