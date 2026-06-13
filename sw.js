// sw.js — Service Worker do Radar Financeiro
// Intercepta requisições para /tesouro-csv e busca o CSV do Tesouro Direto
// O fetch roda no contexto do browser do usuário, não em servidor externo
// Isso evita o bloqueio do Cloudflare que afeta servidores externos

const CACHE_NAME = 'radar-td-v1';
const TD_CSV_URL = 'https://www.tesourodireto.com.br/documents/d/guest/rendimento-resgatar-csv?download=true';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Intercepta apenas /tesouro-csv
  if (url.pathname !== '/tesouro-csv') return;

  e.respondWith(
    fetch(TD_CSV_URL, {
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
        'Referer': 'https://www.tesourodireto.com.br/produtos/dados-sobre-titulos/rendimento-dos-titulos',
      },
      credentials: 'omit',
    })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    })
    .catch(err => {
      return new Response('ERRO: ' + err.message, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});
