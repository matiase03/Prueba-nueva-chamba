function reconocerMasa(texto) {
  const t = texto.toLowerCase().trim();

  const reglas = [
    { keys: ['molde', 'avena'], nombre: 'Molde Avena' },
    { keys: ['molde', 'int'],   nombre: 'Molde Integral' },
    { keys: ['molde'],          nombre: 'Molde Avena' },
    { keys: ['nuez'],           nombre: 'Nuez y Miel' },
    { keys: ['miel'],           nombre: 'Nuez y Miel' },
    { keys: ['cent'],           nombre: 'Centeno' },
    { keys: ['camp'],           nombre: 'Campo' },
    { keys: ['semil'],          nombre: 'Semilla' },
    { keys: ['ciab'],           nombre: 'Ciabatta' },
    { keys: ['integ'],          nombre: 'Integral' },
  ];

  for (const regla of reglas) {
    if (regla.keys.every(k => t.includes(k))) {
      return regla.nombre;
    }
  }

  const candidatos = [
    'Molde Avena','Molde Integral','Centeno','Campo',
    'Integral','Semilla','Nuez y Miel','Ciabatta'
  ];

  let mejorMatch = null;
  let mejorScore = 0;

  candidatos.forEach(candidato => {
    const c = candidato.toLowerCase();
    let coincidencias = 0;
    const usados = new Array(c.length).fill(false);
    for (const char of t) {
      const idx = c.split('').findIndex((ch, i) => !usados[i] && ch === char);
      if (idx !== -1) { coincidencias++; usados[idx] = true; }
    }
    const score = coincidencias / Math.max(t.length, c.length);
    if (score > mejorScore) { mejorScore = score; mejorMatch = candidato; }
  });

  return mejorScore > 0.6 ? mejorMatch : null;
}

function leerMensaje() {
  const texto = document.getElementById('msgInput').value.trim();
  if (!texto) return;

  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
  const pedido = [];

  lineas.forEach(linea => {
    const m = linea.match(/^(.+?)\s*[xX]\s*(\d+(?:[.,]\d+)?)$/);
    if (!m) return;
    const nombreRaw = m[1].trim();
    const mult = parseFloat(m[2].replace(',', '.'));
    const nombreReceta = reconocerMasa(nombreRaw);
    if (!nombreReceta) return;
    const receta = recetas.find(r => r.nombre === nombreReceta);
    if (!receta || !receta.dobleHidratacion) return;
    const existing = pedido.find(p => p.nombre === nombreReceta);
    if (existing) { existing.mult += mult; }
    else { pedido.push({ nombre: nombreReceta, mult, receta }); }
  });

  if (pedido.length === 0) {
    document.getElementById('msg-output').style.display = 'none';
    alert('No encontré masas reconocidas en el mensaje. Revisá el formato (ej: "Campo x8").');
    return;
  }

  const h1HTML = pedido.map(({ nombre, mult, receta }) => {
    const ings = receta.hidratacion1.ingredientes.map(ing => {
      const qty = fmt(ing.cantidad * mult);
      return `<div class="msg-ing-row">
        <span class="msg-ing-nombre">${ing.nombre}</span>
        <span class="msg-ing-qty">${qty}<span class="unit">${ing.unidad}</span></span>
      </div>`;
    }).join('');
    return `<div class="msg-masa-bloque">
      <div class="msg-masa-header h1">
        <span>${nombre}</span>
        <span class="mult-badge">×${fmt(mult)}</span>
      </div>
      <div class="msg-masa-body">${ings}</div>
    </div>`;
  }).join('');

  const h2HTML = pedido.map(({ nombre, mult, receta }) => {
    const ings = receta.hidratacion2.ingredientes.map(ing => {
      const qty = fmt(ing.cantidad * mult);
      return `<div class="msg-ing-row">
        <span class="msg-ing-nombre">${ing.nombre}</span>
        <span class="msg-ing-qty">${qty}<span class="unit">${ing.unidad}</span></span>
      </div>`;
    }).join('');
    if (!ings) return `<div class="msg-masa-bloque">
      <div class="msg-masa-header h2"><span>${nombre}</span><span class="mult-badge">×${fmt(mult)}</span></div>
      <div class="msg-masa-body" style="color:var(--text-light);font-style:italic;font-size:0.85rem">Sin ingredientes extra en segunda hidratación</div>
    </div>`;
    return `<div class="msg-masa-bloque">
      <div class="msg-masa-header h2">
        <span>${nombre}</span>
        <span class="mult-badge">×${fmt(mult)}</span>
      </div>
      <div class="msg-masa-body">${ings}</div>
    </div>`;
  }).join('');

  document.getElementById('msg-h1').innerHTML = h1HTML;
  document.getElementById('msg-h2').innerHTML = h2HTML;
  document.getElementById('msg-output').style.display = 'block';
  mostrarHidra(1);
}

function mostrarHidra(n) {
  document.getElementById('msg-h1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('msg-h2').style.display = n === 2 ? 'block' : 'none';
  document.getElementById('btn-h1').classList.toggle('active', n === 1);
  document.getElementById('btn-h2').classList.toggle('active', n === 2);
}
