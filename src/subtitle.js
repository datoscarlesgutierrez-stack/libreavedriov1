// =====================================================================
//  SUBTITLE AUTO-ALIGNMENT MODULE
// =====================================================================

/**
 * Ajuste exacto del subtítulo: siempre en una sola línea y con el mismo ancho exacto del logo
 */
export function alignLogoSubtitle() {
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

        // Medir ancho real del texto usando Range
        const range = document.createRange();
        range.selectNodeContents(subtitle);
        const rawWidth = range.getBoundingClientRect().width;

        const text = (subtitle.textContent || '').trim();
        const charCount = text.length;

        if (charCount > 1 && rawWidth > 0) {
            const diff = targetWidth - rawWidth;
            if (diff >= 0) {
                const perChar = diff / charCount;
                subtitle.style.letterSpacing = perChar.toFixed(3) + 'px';
            } else {
                const scale = targetWidth / rawWidth;
                const baseFont = parseFloat(window.getComputedStyle(subtitle).fontSize);
                subtitle.style.fontSize = (baseFont * scale * 0.98).toFixed(2) + 'px';
                subtitle.style.letterSpacing = '0px';
            }
        }
    });
}

