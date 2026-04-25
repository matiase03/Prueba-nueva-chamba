function leerMensaje() {
  const texto = document.getElementById('msgInput').value.trim();
  if (!texto) return;

  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
  const pedido = [];

  lineas.forEach(linea => {
    const m = linea.match(/^(.+?)\s*[xX]\s*(\d+(?:[.,]\d+)?)$/);
    if (!m) return;
    const nombreReceta = reconocerMasa(m[1].trim());
    if (nombreReceta) {
      const receta = recetas.find(r => r.nombre === nombreReceta);
      pedido.push({ nombre: nombreReceta, mult: parseFloat(m[2].replace(',', '.')), receta });
    }
  });

  const generarHTML = (fase) => {
    return pedido.map(({ nombre, mult, receta }) => {
      const ings = receta[fase].ingredientes.map(ing => `
        <div class="msg-ing-row" onclick="this.classList.toggle('checked')">
          <span>${ing.nombre}</span>
          <span class="msg-ing-qty">${fmt(ing.cantidad * mult)}<small>${ing.unidad}</small></span>
        </div>`).join('');
      return `<div class="msg-masa-bloque"><div class="msg-masa-header ${fase === 'hidratacion1' ? 'h1' : 'h2'}"><span>${nombre}</span><span>×${fmt(mult)}</span></div><div class="msg-masa-body">${ings}</div></div>`;
    }).join('');
  };

  document.getElementById('msg-h1').innerHTML = generarHTML('hidratacion1');
  document.getElementById('msg-h2').innerHTML = generarHTML('hidratacion2');
  document.getElementById('msg-output').style.display = 'block';
}