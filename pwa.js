if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/Prueba-nueva-chamba/sw.js')
      .then(reg => {
        console.log('SW registrado:', reg.scope);
      })
      .catch(err => {
        console.warn('SW no pudo registrarse:', err);
      });
  });
}

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  mostrarBotonInstalar();
});

function mostrarBotonInstalar() {
  if (document.getElementById('install-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'install-btn';
  btn.textContent = '📲 Instalar app';
  btn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 16px;
    background: #4a3420;
    color: #f5f0e8;
    border: none;
    border-radius: 24px;
    padding: 10px 18px;
    font-size: 0.88rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(74,52,32,0.35);
    z-index: 9999;
    transition: opacity 0.3s;
  `;
  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') btn.remove();
    deferredPrompt = null;
  });
  document.body.appendChild(btn);
}

window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('install-btn');
  if (btn) btn.remove();
  deferredPrompt = null;
});
