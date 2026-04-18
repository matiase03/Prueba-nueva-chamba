// ── Cliente de Supabase ──────────────────────────────────────
const SUPA_URL  = 'https://vsrvxwtwtujsqyepfioy.supabase.co';
const SUPA_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcnZ4d3R3dHVqc3F5ZXBmaW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTg4MDAsImV4cCI6MjA5MjAzNDgwMH0.AMlXFJGRormemeny96zMUxH5cGwxjYhkH8O0vPtVOOA';
const supa      = window.supabase.createClient(SUPA_URL, SUPA_KEY);

// ── Claves que se sincronizan ────────────────────────────────
const SYNC_KEYS = [
  'recetas_extra',
  'recetas_overrides',
  'pedidos_override',
  'historial_pedidos',
  'notas_recetas',
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
