// =====================================================================
//  HELPERS & GENERAL UTILITIES
// =====================================================================

export function getPageFileName(urlStr) {
    try {
        const url = new URL(urlStr, window.location.href);
        const path = url.pathname;
        return path.split('/').pop() || 'index.html';
    } catch {
        return '';
    }
}

export function getCssConfigBool(varName, defaultVal = false) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim().replace(/['"]/g, '');
    if (!val) return defaultVal;
    return val === 'true' || val === '1' || val === 'yes';
}

