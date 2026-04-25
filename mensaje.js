function reconocerMasa(texto) {
  const t = texto.toLowerCase().trim();
  const reglas = [
    { keys: ['molde', 'avena'], nombre: 'Molde Avena' },
    { keys: ['molde', 'int'],   nombre: 'Molde Integral' },
    { keys: ['nuez'],           nombre: 'Nuez y Miel' },
    { keys: ['cent'],           nombre: 'Centeno' },
    { keys: ['camp'],           nombre: 'Campo' },
    { keys: ['semil'],          nombre: 'Semilla' },
    { keys: ['ciab'],           nombre: 'Ciabatta' },
    { keys: ['integ'],          nombre: 'Integral' },
  ];
  for (const regla of reglas) {
    if (regla.keys.every(k => t.includes(k))) return regla.nombre;
  }
  return null;
}

function leerMensaje() {
  const texto = document.getElementById('msgInput').value.trim();
  if (!texto) return;

  const lineas = texto.split('\n').filter(Boolean);
  const pedido = [];

  lineas.forEach(linea => {
    const m = linea.match(/^(.+?)\s*[xX]\s*(\d+(?:[.,]\d+)?)$/);
    if (!m) return;
    const nombreReceta = reconocerMasa(m[1]);
    const mult = parseFloat(m[2].replace(',', '.'));
    if (nombreReceta) {
      const receta = recetas.find(r => r.nombre === nombreReceta);
      pedido.push({ nombre: nombreReceta, mult, receta });
    }
  });

  const generarHTML = (fase) => {
    return pedido.map(({ nombre, mult, receta }) => {
      const ings = receta[fase].ingredientes.map(ing => {
        return `<div class="msg-ing-row" onclick="this.classList.toggle('checked')">
          <span>${ing.nombre}</span>
          <span class="msg-ing-qty">${fmt(ing.cantidad * mult)}<small>${ing.unit || 'g'}</small></span>
        </div>`;
      }).join('');
      return `<div class="msg-masa-bloque">
        <div class="msg-masa-header ${fase === 'hidratacion1' ? 'h1' : 'h2'}">
          <span>${nombre}</span><span>×${fmt(mult)}</span>
        </div>
        <div class="msg-masa-body">${ings}</div>
      </div>`;
    }).join('');
  };

  document.getElementById('msg-h1').innerHTML = generarHTML('hidratacion1');
  document.getElementById('msg-h2').innerHTML = generarHTML('hidratacion2');
  document.getElementById('msg-output').style.display = 'block';
}

function mostrarHidra(n) {
  document.getElementById('msg-h1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('msg-h2').style.display = n === 2 ? 'block' : 'none';
  document.getElementById('btn-h1').classList.toggle('active', n === 1);
  document.getElementById('btn-h2').classList.toggle('active', n === 2);
}