/**
 * Script de arranque de las apariciones (se inserta tal cual en <head>, antes
 * de pintar): marca <html data-revela="si"> si hay IntersectionObserver y no
 * se ha pedido reducir movimiento. Si el observador (RevealObserver) no llega
 * a cargarse en 4 s, lo desactiva para que todo quede visible.
 *
 * Vive fuera del módulo "use client" para que el layout (servidor) reciba el texto.
 */
export const REVEAL_BOOT = `(function(){try{var d=document.documentElement,m=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.revela=(!m&&'IntersectionObserver' in window)?'si':'no';setTimeout(function(){if(!window.__revealListo)d.dataset.revela='no'},4000)}catch(e){}})();`;
