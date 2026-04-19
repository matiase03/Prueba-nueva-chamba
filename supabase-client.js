// ── Cliente de Supabase ──────────────────────────────────────
const SUPA_URL  = 'https://vsrvxwtwtujsqyepfioy.supabase.co';
const SUPA_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcnZ4d3R3dHVqc3F5ZXBmaW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTg4MDAsImV4cCI6MjA5MjAzNDgwMH0.AMlXFJGRormemeny96zMUxH5cGwxjYhkH8O0vPtVOOA';
const supa      = window.supabase.createClient(SUPA_URL, SUPA_KEY);

// ── Claves que se sincronizan ────────────────────────────────
const SYNC_KEYS = [
  'recetas_extra',
  'recetas_overrides',
  'recetas_ocultas',
  'pedidos_override',
  'historial_pedidos',
  'notas_recetas',
  'local_notas',
  'pedidos_mayoristas',
];

// ── Subir un valor a Supabase ────────────────────────────────
async function supaSync(clave, valor) {
  try {
    await supa.from('configuracion').upsert({ clave, valor }, { onConflict: 'clave' });
  } catch (e) {
    // Si no hay conexión, el localStorage ya tiene el dato guardado
  }
}

// ── Al cargar la página: traer los datos de Supabase ─────────
async function supaCargarTodo() {
  try {
    const { data, error } = await supa.from('configuracion').select('clave, valor');
    if (error || !data) return;
    data.forEach(row => {
      localStorage.setItem(row.clave, JSON.stringify(row.valor));
    });
  } catch (e) {
    // Sin conexión: se usan los datos del localStorage (funciona offline)
  }
}

// ── Sincronización en tiempo real ────────────────────────────
// Escucha cambios en la tabla configuracion y actualiza la app
// automáticamente en todos los dispositivos conectados.
function supaIniciarRealtime() {
  try {
    supa.channel('config-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'configuracion'
      }, payload => {
        const row = payload.new;
        if (!row || !SYNC_KEYS.includes(row.clave)) return;

        // Guardar en localStorage sin re-disparar el interceptor
        _setItem(row.clave, JSON.stringify(row.valor));

        // Refrescar la UI según qué dato cambió
        const clave = row.clave;

        if (clave === 'pedidos_mayoristas') {
          if (typeof renderMayoristasCards === 'function') renderMayoristasCards();
          const sel = document.getElementById('localSelect');
          if (sel && sel.value === 'totales') mostrarLocal('totales');
          const home = document.getElementById('tab-inicio');
          if (home && home.style.display !== 'none') renderInicio();
        }

        if (clave === 'pedidos_override') {
          if (typeof loadPedidosOverrides === 'function') loadPedidosOverrides();
          const sel = document.getElementById('localSelect');
          if (sel) mostrarLocal(sel.value);
          const home = document.getElementById('tab-inicio');
          if (home && home.style.display !== 'none') renderInicio();
        }

        if (clave === 'local_notas') {
          const sel = document.getElementById('localSelect');
          if (sel) mostrarLocal(sel.value);
        }

        // Toast discreto
        const toast = document.getElementById('saved-toast');
        if (toast) {
          toast.textContent = '🔄 Actualizado';
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 1800);
        }
      })
      .subscribe();
  } catch (e) {
    // Sin conexión o Realtime no disponible — no hace nada
  }
}

// ── Parchear localStorage para auto-sincronizar ──────────────
// Intercepta setItem para que cuando se guarde una clave
// de las que nos importan, también suba a Supabase automáticamente.
const _setItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(clave, valor) {
  _setItem(clave, valor);
  if (SYNC_KEYS.includes(clave)) {
    try {
      supaSync(clave, JSON.parse(valor));
    } catch (_) {
      supaSync(clave, valor);
    }
  }
};
