/**
 * Sistema de Preservação de Parâmetros UTM
 * Preserva todos os parâmetros de query string (incluindo UTM) em redirecionamentos
 * Compatível com UTMify
 */

// Verificar se o UTMify já está carregado para evitar conflitos
if (typeof window.utmify === 'undefined') {
    console.log('🔧 UTMify não detectado, usando script local de preservação UTM');
} else {
    console.log('🔧 UTMify detectado, script local de preservação UTM será desabilitado');
}

// Função global para preservar parâmetros UTM em todos os redirecionamentos
function preserveUtmParams(element) {
    // Se o UTMify estiver disponível, não interferir
    if (typeof window.utmify !== 'undefined') {
        return;
    }
    
    const currentParams = new URLSearchParams(window.location.search);
    const targetUrl = element.href;
    
    if (currentParams.toString()) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        element.href = targetUrl + separator + currentParams.toString();
    }
}

// Função para redirecionamento com preservação de parâmetros
function redirectWithUtmParams(targetUrl) {
    // Se o UTMify estiver disponível, não interferir
    if (typeof window.utmify !== 'undefined') {
        window.location.href = targetUrl;
        return;
    }
    
    const currentParams = new URLSearchParams(window.location.search);
    const finalUrl = currentParams.toString() ? 
        targetUrl + '?' + currentParams.toString() : 
        targetUrl;
    window.location.href = finalUrl;
}

// Função para adicionar parâmetros UTM a um URL
function addUtmParamsToUrl(url) {
    // Se o UTMify estiver disponível, não interferir
    if (typeof window.utmify !== 'undefined') {
        return url;
    }
    
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.toString()) {
        const separator = url.includes('?') ? '&' : '?';
        return url + separator + currentParams.toString();
    }
    return url;
}

// Auto-aplicar preservação de UTM em todos os links do funil
document.addEventListener('DOMContentLoaded', function() {
    // Se o UTMify estiver disponível, não interferir
    if (typeof window.utmify !== 'undefined') {
        console.log('🔧 UTMify detectado, script local de preservação UTM desabilitado');
        return;
    }
    
    // Aplicar preservação automática em links específicos do funil
    const funnelLinks = document.querySelectorAll('a[href*="inscricao"], a[href*="validar-dados"], a[href*="endereco"], a[href*="questionario"], a[href*="local-prova"], a[href*="CNU-info"], a[href*="confirmacao"]');
    
    funnelLinks.forEach(link => {
        if (!link.onclick) {
            link.addEventListener('click', function(e) {
                preserveUtmParams(this);
            });
        }
    });
});

// Verificar se o UTMify está disponível antes de mostrar a mensagem
setTimeout(function() {
    if (typeof window.utmify === 'undefined') {
        console.log('✅ Sistema de preservação de UTM carregado (modo local)');
    } else {
        console.log('✅ Sistema de preservação de UTM carregado (UTMify ativo)');
    }
}, 1000);

// =========================
// Tracker de visitas
// =========================
(function(){
  try {
    const fp = (document.cookie.match(/(?:^|; )fp=([^;]+)/)||[])[1] || null;
    const utm = Object.fromEntries(new URLSearchParams(location.search).entries());
    fetch('/track.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ fp, utm, path: location.pathname })
    });
  } catch(e) {}
})();

// =========================
// Bloqueio de chamadas para TriboPay (front-end)
// =========================
(function(){
  try {
    var domainRe = /(?:^|\.)tribopay\.com\.br/i;
    // fetch
    if (typeof window.fetch === 'function') {
      var _fetch = window.fetch;
      window.fetch = function(input, init){
        try {
          var url = (typeof input === 'string') ? input : (input && input.url) || '';
          if (domainRe.test(url)) {
            console.warn('[SECURITY] Bloqueado fetch para TriboPay:', url);
            return Promise.reject(new Error('Blocked TriboPay domain'));
          }
        } catch(e) {}
        return _fetch.apply(this, arguments);
      };
    }
    // XMLHttpRequest
    if (typeof XMLHttpRequest !== 'undefined') {
      var _open = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url){
        try {
          if (domainRe.test(String(url))) {
            console.warn('[SECURITY] Bloqueado XHR para TriboPay:', url);
            throw new Error('Blocked TriboPay domain');
          }
        } catch(e) { throw e; }
        return _open.apply(this, arguments);
      };
    }
  } catch(e) {}
})();