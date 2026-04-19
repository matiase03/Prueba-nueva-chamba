// ================================================================
//  CÓMO AGREGAR RECETAS
// ================================================================
//
//  RECETA NORMAL (sin doble hidratación):
//  ─────────────────────────────────────
//  {
//    nombre: "Nombre de la receta",
//    rendimiento: "cuánto rinde",
//    tiempo: "tiempo total",
//    dobleHidratacion: false,
//    nota: "tip opcional",
//    ingredientes: [
//      { nombre: "Harina", cantidad: 500, unidad: "g" },
//    ],
//    pasos: ["Paso uno...", "Paso dos..."]
//  },
//
//  RECETA CON DOBLE HIDRATACIÓN:
//  ─────────────────────────────
//  {
//    nombre: "Nombre de la receta",
//    dobleHidratacion: true,
//    hidratacion1: { ingredientes: [...], pasos: [...] },
//    hidratacion2: { ingredientes: [...], pasos: [...] },
//    coccion: { ingredientes: [...], pasos: [...] }
//  },
//
// ================================================================

const recetas = [

  // ── MOLDE AVENA ──────────────────────────────────────────────
  {
    nombre: "Molde Avena",
    rendimiento: "1 molde",
    pesoBollos: "950 g por bollo",
    rendimientoKilo: "2 panes por kg de harina",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "Harina Orgánica 5 Estrellas", cantidad: 850, unidad: "g" },
        { nombre: "0000 Integral",               cantidad: 150, unidad: "g" },
        { nombre: "Avena",                       cantidad: 100, unidad: "g" },
        { nombre: "Agua",                        cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",                  cantidad: 200, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Leche", cantidad: 100, unidad: "g" },
        { nombre: "Sal",   cantidad: 20,  unidad: "g" },
        { nombre: "Miel",  cantidad: 25,  unidad: "g" },
      ],
      pasos: [
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal.",
        "Agregar poca leche y comenzar a amasar despacio.",
        "Cuando tome un poco la leche, poner a amasar rápido.",
        "A medida que la masa va absorbiendo la leche, ir agregando de a poco e ir tocando la masa para ver si necesita o no más leche y si el gluten está desarrollado.",
        "Una vez incorporada toda la leche, agregar la miel y amasar hasta que absorba. Sacar.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "Hacer un corte vertical a lo largo del pan.",
        "Hornear en horno de piso a 200° el piso y 200° el techo por 55 minutos.",
      ]
    }
  },

  // ── MOLDE INTEGRAL ───────────────────────────────────────────
  {
    nombre: "Molde Integral",
    rendimiento: "1 molde",
    pesoBollos: "950 g por bollo",
    rendimientoKilo: "2 panes por kg de harina",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "000 Integral",    cantidad: 200, unidad: "g" },
        { nombre: "0000 Integral",   cantidad: 800, unidad: "g" },
        { nombre: "Trigo Sarraceno", cantidad: 50,  unidad: "g" },
        { nombre: "Agua",            cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",      cantidad: 250, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Leche", cantidad: 100, unidad: "g" },
        { nombre: "Sal",   cantidad: 20,  unidad: "g" },
        { nombre: "Miel",  cantidad: 25,  unidad: "g" },
      ],
      pasos: [
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal.",
        "Agregar poca leche y comenzar a amasar despacio.",
        "Cuando tome un poco la leche, poner a amasar rápido.",
        "A medida que la masa va absorbiendo la leche, ir agregando de a poco e ir tocando la masa para ver si necesita o no más leche y si el gluten está desarrollado.",
        "Una vez incorporada toda la leche, agregar la miel y amasar hasta que absorba. Sacar.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "Hacer un corte vertical a lo largo del pan.",
        "Hornear en horno de piso a 200° el piso y 200° el techo por 55 minutos.",
      ]
    }
  },

  // ── INTEGRAL ─────────────────────────────────────────────────
  {
    nombre: "Integral",
    rendimiento: "1 pieza",
    pesoBollos: "750 g por bollo",
    rendimientoKilo: "8 panes por cada 3 kg de harina",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "000 Integral",  cantidad: 800, unidad: "g" },
        { nombre: "0000 Integral", cantidad: 200, unidad: "g" },
        { nombre: "Agua",          cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",    cantidad: 250, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Agua", cantidad: 100, unidad: "g" },
        { nombre: "Sal",  cantidad: 20,  unidad: "g" },
      ],
      pasos: [
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal.",
        "Agregar poca agua y comenzar a amasar despacio.",
        "Cuando tome un poco el agua, poner a amasar rápido.",
        "A medida que la masa va absorbiendo el agua, ir agregando de a poco e ir tocando la masa para ver si necesita o no más agua y si el gluten está desarrollado. Sacar.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "Hacer dos cortes diagonales sobre el pan.",
        "Hornear en horno de piso a 250° el piso y 200° el techo por 20 minutos.",
        "Cambiar a 250° el techo y 200° el piso por 14 minutos más.",
      ]
    }
  },

  // ── CAMPO ────────────────────────────────────────────────────
  {
    nombre: "Campo",
    rendimiento: "1 pieza",
    pesoBollos: "750 g por bollo",
    rendimientoKilo: "8 panes por cada 3 kg de harina",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "Harina Orgánica 5 Estrellas", cantidad: 800, unidad: "g" },
        { nombre: "000 Integral",                cantidad: 100, unidad: "g" },
        { nombre: "0000 Integral",               cantidad: 100, unidad: "g" },
        { nombre: "Trigo Sarraceno",             cantidad: 20,  unidad: "g" },
        { nombre: "Agua",                        cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",                  cantidad: 200, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Agua",              cantidad: 100, unidad: "g" },
        { nombre: "Sal",               cantidad: 20,  unidad: "g" },
        { nombre: "Aceite de girasol", cantidad: 20,  unidad: "g" },
      ],
      pasos: [
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal.",
        "Agregar poca agua y comenzar a amasar despacio.",
        "Cuando tome un poco el agua, poner a amasar rápido.",
        "A medida que la masa va absorbiendo el agua, ir agregando de a poco e ir tocando la masa para ver si necesita o no más agua y si el gluten está desarrollado.",
        "Una vez incorporada toda el agua, agregar el aceite de girasol y amasar hasta que absorba. Sacar.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "Hacer un corte vertical en el pan y luego cortar dentro de ese corte en paralelo a la superficie del pan.",
        "Hornear en horno de piso a 250° el piso y 200° el techo por 20 minutos.",
        "Cambiar a 250° el techo y 200° el piso por 14 minutos más.",
      ]
    }
  },

  // ── NUEZ Y MIEL ──────────────────────────────────────────────
  {
    nombre: "Nuez y Miel",
    rendimiento: "1 pieza",
    pesoBollos: "750 g por bollo",
    rendimientoKilo: "8 panes por cada 3 kg de harina",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "Harina Orgánica 5 Estrellas", cantidad: 750, unidad: "g" },
        { nombre: "0000 Integral",               cantidad: 150, unidad: "g" },
        { nombre: "Harina Centeno",              cantidad: 100, unidad: "g" },
        { nombre: "Agua",                        cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",                  cantidad: 200, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Agua",              cantidad: 100,      unidad: "g"       },
        { nombre: "Sal",               cantidad: 20,       unidad: "g"       },
        { nombre: "Aceite de girasol", cantidad: 20,       unidad: "g"       },
        { nombre: "Miel",              cantidad: 25,       unidad: "g"       },
        { nombre: "Nuez",              cantidad: 1,        unidad: "tarrito" },
      ],
      pasos: [
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal.",
        "Agregar poca agua y comenzar a amasar despacio.",
        "Cuando tome un poco el agua, poner a amasar rápido.",
        "A medida que la masa va absorbiendo el agua, ir agregando de a poco e ir tocando la masa para ver si necesita o no más agua y si el gluten está desarrollado.",
        "Una vez incorporada toda el agua, agregar el aceite de girasol y la miel y amasar hasta que absorba.",
        "Agregar la nuez al final y amasar hasta que se incorpore. Sacar.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "Hacer tres cortes diagonales sobre el pan.",
        "Hornear en horno de piso a 250° el piso y 200° el techo por 20 minutos.",
        "Cambiar a 250° el techo y 200° el piso por 14 minutos más.",
      ]
    }
  },

  // ── CIABATTA ─────────────────────────────────────────────────
  {
    nombre: "Ciabatta",
    rendimiento: "",
    pesoBollos: "",
    rendimientoKilo: "",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "Harina Orgánica 5 Estrellas", cantidad: 800, unidad: "g" },
        { nombre: "000 Integral",                cantidad: 200, unidad: "g" },
        { nombre: "Agua",                        cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",                  cantidad: 200, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Agua",            cantidad: 200, unidad: "g" },
        { nombre: "Sal",             cantidad: 20,  unidad: "g" },
        { nombre: "Aceite de oliva", cantidad: 20,  unidad: "g" },
      ],
      pasos: [
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal.",
        "Agregar poca agua y comenzar a amasar despacio.",
        "Cuando tome un poco el agua, poner a amasar rápido.",
        "A medida que la masa va absorbiendo el agua, ir agregando de a poco e ir tocando la masa para ver si necesita o no más agua y si el gluten está desarrollado.",
        "Una vez incorporada toda el agua, agregar el aceite de oliva y amasar hasta que absorba. Sacar.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "Estirar la masa sobre la mesada.",
        "Cortar las focaccias, ciabattas largas, cortas y cuadradas según se necesite.",
        "Hornear a 250° el piso y 250° el techo por 20 minutos aproximadamente.",
        "Abrir el horno y verificar que estén cocidas y crocantes.",
        "Si hace falta, agregar entre 2 y 5 minutos más. Sacar.",
      ]
    }
  },

  // ── SEMILLA ──────────────────────────────────────────────────
  {
    nombre: "Semilla",
    rendimiento: "1 pieza",
    pesoBollos: "750 g por bollo",
    rendimientoKilo: "8 panes por cada 3 kg de harina",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "Harina Orgánica 5 Estrellas", cantidad: 650, unidad: "g" },
        { nombre: "000 Integral",                cantidad: 350, unidad: "g" },
        { nombre: "Agua",                        cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",                  cantidad: 200, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Agua",              cantidad: 100, unidad: "g" },
        { nombre: "Sal",               cantidad: 20,  unidad: "g" },
        { nombre: "Semillas de chía",  cantidad: 50,  unidad: "g" },
        { nombre: "Semillas de lino",  cantidad: 50,  unidad: "g" },
      ],
      pasos: [
        "En un perol, mezclar el agua con las semillas de chía y lino hasta que absorban todo el líquido.",
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal y la mezcla de semillas completa.",
        "Amasar lento hasta incorporar.",
        "Luego amasar rápido hasta desarrollar el gluten. Sacar.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "Hacer dos cortes diagonales sobre el pan.",
        "Hornear en horno de piso a 250° el piso y 200° el techo por 20 minutos.",
        "Cambiar a 250° el techo y 200° el piso por 14 minutos más.",
      ]
    }
  },

  // ── CENTENO ──────────────────────────────────────────────────
  {
    nombre: "Centeno",
    rendimiento: "1 pieza",
    pesoBollos: "950 g por bollo",
    rendimientoKilo: "2 panes por kg de harina",
    tiempo: "",
    dobleHidratacion: true,
    nota: "",
    hidratacion1: {
      ingredientes: [
        { nombre: "Harina Orgánica 5 Estrellas", cantidad: 400, unidad: "g" },
        { nombre: "000 Integral",                cantidad: 350, unidad: "g" },
        { nombre: "Centeno",                     cantidad: 250, unidad: "g" },
        { nombre: "Agua",                        cantidad: 650, unidad: "g" },
        { nombre: "Masa madre",                  cantidad: 200, unidad: "g" },
      ],
      pasos: [
        "Pesar las harinas.",
        "Meterlas en la amasadora junto con la masa madre y el agua pesadas.",
        "Amasar despacio hasta que tome un poco el agua.",
        "Subir la velocidad y amasar hasta que se integre toda la harina.",
        "Sacar y dejar reposar.",
      ]
    },
    hidratacion2: {
      ingredientes: [
        { nombre: "Agua", cantidad: 100, unidad: "g" },
        { nombre: "Sal",  cantidad: 20,  unidad: "g" },
      ],
      pasos: [
        "Meter la masa previamente hidratada y descansada en la amasadora junto con la sal.",
        "Agregar poca agua y comenzar a amasar despacio.",
        "Cuando tome un poco el agua, poner a amasar rápido.",
        "A medida que la masa va absorbiendo el agua, ir agregando de a poco e ir tocando la masa para ver si necesita o no más agua y si el gluten está desarrollado.",
      ]
    },
    coccion: {
      ingredientes: [],
      pasos: [
        "No lleva corte.",
        "Hornear en horno de piso a 200° el piso y 200° el techo por 55 minutos.",
      ]
    }
  },

  // ── LOMO ─────────────────────────────────────────────────────
  {
    nombre: "Lomo",
    rendimiento: "",
    pesoBollos: "160 g por bollo",
    rendimientoKilo: "10 panes por amasada",
    tiempo: "",
    dobleHidratacion: false,
    nota: "",
    ingredientes: [
      { nombre: "Harina 000",  cantidad: 500, unidad: "g" },
      { nombre: "Harina 0000", cantidad: 500, unidad: "g" },
      { nombre: "Huevos",      cantidad: 2,   unidad: ""  },
      { nombre: "Agua",        cantidad: 460, unidad: "g" },
      { nombre: "Sal",         cantidad: 30,  unidad: "g" },
      { nombre: "Azúcar",      cantidad: 30,  unidad: "g" },
      { nombre: "Levadura",    cantidad: 20,  unidad: "g" },
      { nombre: "Manteca",     cantidad: 100, unidad: "g" },
    ],
    pasos: [
      "Pesar todos los ingredientes.",
      "Poner en la amasadora todo excepto la manteca.",
      "Integrar en velocidad mínima.",
      "Agregar la manteca y amasar a velocidad rápida hasta obtener una masa lisa y con gluten desarrollado.",
    ],
    coccion: {
      ingredientes: [],
      pasos: [
        "Pintar los panes con doradura.",
        "Realizar un corte vertical en el pan.",
        "Cocinar en horno con vector a 160° con 100% de humedad hasta que los panes estén listos (entre 15 y 20 minutos).",
      ]
    }
  },

  // ── HAMBURGUESA PEDIDOS ───────────────────────────────────────
  {
    nombre: "Hamburguesa Pedidos",
    rendimiento: "",
    pesoBollos: "140 g por bollo",
    rendimientoKilo: "13 panes por amasada",
    tiempo: "",
    dobleHidratacion: false,
    nota: "",
    ingredientes: [
      { nombre: "Harina 0000", cantidad: 500, unidad: "g" },
      { nombre: "Harina 000",  cantidad: 500, unidad: "g" },
      { nombre: "Huevos",      cantidad: 2,   unidad: ""  },
      { nombre: "Levadura",    cantidad: 40,  unidad: "g" },
      { nombre: "Azúcar",      cantidad: 40,  unidad: "g" },
      { nombre: "Sal",         cantidad: 40,  unidad: "g" },
      { nombre: "Leche",       cantidad: 500, unidad: "g" },
      { nombre: "Manteca",     cantidad: 100, unidad: "g" },
    ],
    pasos: [
      "Pesar todos los ingredientes.",
      "Poner en la amasadora todo excepto la manteca.",
      "Integrar en velocidad mínima.",
      "Agregar la manteca y amasar a velocidad rápida hasta obtener una masa lisa y con gluten desarrollado.",
    ],
    coccion: {
      ingredientes: [],
      pasos: [
        "Pintar los panes con doradura y agregar mix de sésamo por encima.",
        "Cocinar en horno convector a 160° con 100% de humedad hasta que los panes estén listos.",
      ]
    }
  },

  // ── BRIOCHE ──────────────────────────────────────────────────
  {
    nombre: "Brioche",
    rendimiento: "",
    pesoBollos: "90 g por bollo",
    rendimientoKilo: "3/4 placas por masa",
    tiempo: "",
    dobleHidratacion: false,
    nota: "",
    ingredientes: [
      { nombre: "Harina Orgánica 5 Estrellas", cantidad: 800, unidad: "g" },
      { nombre: "Harina 0000",                 cantidad: 200, unidad: "g" },
      { nombre: "Leche",                       cantidad: 400, unidad: "g" },
      { nombre: "Huevos",                      cantidad: 5,   unidad: ""  },
      { nombre: "Azúcar",                      cantidad: 100, unidad: "g" },
      { nombre: "Sal",                         cantidad: 20,  unidad: "g" },
      { nombre: "Manteca",                     cantidad: 200, unidad: "g" },
      { nombre: "Levadura",                    cantidad: 30,  unidad: "g" },
    ],
    pasos: [
      "Pesar todos los ingredientes.",
      "Poner en la amasadora todo excepto la manteca.",
      "Integrar en velocidad mínima.",
      "Agregar la manteca y amasar a velocidad rápida, ayudando a que la masa se forme, hasta obtener una masa lisa y con gluten desarrollado.",
    ],
    coccion: {
      ingredientes: [],
      pasos: [
        "Estibar los panes de a 7×5 en placas.",
        "Espolvorear con harina.",
        "Cocinar en horno de piso a 200° arriba y abajo por 15 minutos.",
        "Dar vuelta los panes y cocinar 5 minutos más.",
      ]
    }
  },

  // ── ALEMANA ──────────────────────────────────────────────────
  {
    nombre: "Alemana",
    rendimiento: "",
    pesoBollos: "1100 g (alemana chica) · 2200 g (alemana grande)",
    rendimientoKilo: "1800 g de masa por amasada (1 alemana chica)",
    tiempo: "",
    dobleHidratacion: false,
    nota: "",
    ingredientes: [
      { nombre: "Harina 0000", cantidad: 500, unidad: "g" },
      { nombre: "Harina 000",  cantidad: 500, unidad: "g" },
      { nombre: "Huevos",      cantidad: 2,   unidad: ""  },
      { nombre: "Azúcar",      cantidad: 200, unidad: "g" },
      { nombre: "Levadura",    cantidad: 20,  unidad: "g" },
      { nombre: "Leche",       cantidad: 460, unidad: "g" },
      { nombre: "Manteca",     cantidad: 100, unidad: "g" },
    ],
    pasos: [
      "Pesar todos los ingredientes.",
      "Poner en la amasadora todo excepto la manteca.",
      "Integrar en velocidad mínima.",
      "Agregar la manteca y amasar a velocidad rápida hasta obtener una masa lisa y con gluten desarrollado.",
    ],
    coccion: {
      ingredientes: [
        { nombre: "Crema de leche (chica / doble para grande)", cantidad: 700, unidad: "g"   },
        { nombre: "Azúcar (chica / doble para grande)",         cantidad: 120, unidad: "g"   },
        { nombre: "Anís",                                       cantidad: 0,   unidad: "c/n" },
        { nombre: "Canela",                                     cantidad: 0,   unidad: "c/n" },
        { nombre: "Esencia de vainilla",                        cantidad: 0,   unidad: "c/n" },
        { nombre: "Azúcar blanca (para espolvorear)",           cantidad: 0,   unidad: "c/n" },
        { nombre: "Coco en escamas",                            cantidad: 0,   unidad: "c/n" },
      ],
      pasos: [
        "Preparar la crema mezclando la crema de leche con el azúcar, anís, canela y esencia de vainilla (usar el doble de todo para una alemana grande).",
        "Estirar la masa en una placa alta según el tamaño (chica o grande).",
        "Dejar reposar hasta que la masa llegue por lo menos a 3/4 del molde.",
        "Pisar la superficie con un maple de huevos.",
        "Colocar la crema previamente preparada sobre la masa.",
        "Espolvorear azúcar blanca por encima.",
        "Cocinar en horno convector a 160° sin humedad por 20 minutos.",
        "Agregar coco en escamas y cocinar a la misma temperatura por 3 minutos más.",
      ]
    }
  },

  // ── TORTITAS NEGRAS ──────────────────────────────────────────
  {
    nombre: "Tortitas Negras",
    rendimiento: "",
    pesoBollos: "",
    rendimientoKilo: "1 placa por masa aprox.",
    tiempo: "",
    dobleHidratacion: false,
    nota: "",
    ingredientes: [
      { nombre: 'Harina Orgánica "Raíces"', cantidad: 1000, unidad: "g" },
      { nombre: "Sal",                      cantidad: 20,   unidad: "g" },
      { nombre: "Levadura",                 cantidad: 30,   unidad: "g" },
      { nombre: "Grasa",                    cantidad: 60,   unidad: "g" },
      { nombre: "Agua",                     cantidad: 600,  unidad: "g" },
    ],
    pasos: [
      "Pesar todos los ingredientes.",
      "Poner en la amasadora todo excepto la grasa.",
      "Integrar en velocidad mínima.",
      "Agregar la grasa y amasar a velocidad rápida hasta obtener una masa lisa y con gluten desarrollado.",
    ],
    coccion: {
      ingredientes: [],
      pasos: [
        "Cortar y estibar los panes en placa.",
        "Colocar el azúcar negro por encima.",
        "Cocinar en horno convector a 160° sin humedad por 13 minutos.",
      ]
    }
  },

  // ── VARILLIN, MIGNON Y BAGUETTE (GP) ─────────────────────────
  {
    nombre: "Varillin, Mignon y Baguette (GP)",
    rendimiento: "",
    pesoBollos: "Mignon 60 g · Varillin 140 g · Baguette 340 g",
    rendimientoKilo: "",
    tiempo: "",
    dobleHidratacion: false,
    nota: "",
    ingredientes: [
      { nombre: "Harina Orgánica",   cantidad: 1000, unidad: "g" },
      { nombre: "Sal",               cantidad: 30,   unidad: "g" },
      { nombre: "Aceite de girasol", cantidad: 25,   unidad: "g" },
      { nombre: "Levadura",          cantidad: 20,   unidad: "g" },
      { nombre: "Agua",              cantidad: 550,  unidad: "g" },
    ],
    pasos: [
      "Pesar todos los ingredientes.",
      "Tirar todo junto en la amasadora.",
      "Amasar rápido hasta obtener una masa lisa y con gluten desarrollado.",
    ],
    coccion: {
      ingredientes: [],
      pasos: [
        "Espolvorear los panes con harina.",
        "Realizar un corte vertical a mignones y varillines, y 3 cortes diagonales a la baguette.",
        "Cocinar en horno convector a 190° con 20% de humedad por 4 minutos.",
        "Continuar a 200° con 20% de humedad por 6 minutos.",
        "Finalizar a 220° sin humedad por 6 minutos más.",
      ]
    }
  },

  // ── VIENA ────────────────────────────────────────────────────
  {
    nombre: "Viena (Viena, Hamburguesa, Lactal, Panera)",
    rendimiento: "",
    pesoBollos: "Lactal 750 g · Viena 90 g · Hamburguesa 110 g · Panera 60 g",
    rendimientoKilo: "",
    tiempo: "",
    dobleHidratacion: false,
    nota: "⚠️ PANERA: separar parte de la masa y agregar 50 g de orégano por kg de masa para los que lo requieran. — ⚠️ HAMBURGUESA: tirar sésamo blanco por encima antes de cocinar.",
    ingredientes: [
      { nombre: "Harina 0000", cantidad: 1000, unidad: "g" },
      { nombre: "Azúcar",      cantidad: 80,   unidad: "g" },
      { nombre: "Huevos",      cantidad: 2,    unidad: ""  },
      { nombre: "Sal",         cantidad: 30,   unidad: "g" },
      { nombre: "Levadura",    cantidad: 40,   unidad: "g" },
      { nombre: "Manterina",   cantidad: 100,  unidad: "g" },
      { nombre: "Propionato",  cantidad: 4,    unidad: "g" },
      { nombre: "Agua",        cantidad: 230,  unidad: "g" },
      { nombre: "Leche",       cantidad: 230,  unidad: "g" },
    ],
    pasos: [
      "Pesar todos los ingredientes.",
      "Poner en la amasadora todo excepto la manterina.",
      "Integrar en velocidad mínima.",
      "Agregar la manterina y amasar a velocidad rápida hasta obtener una masa lisa y con gluten desarrollado.",
    ],
    coccion: {
      ingredientes: [],
      pasos: [
        "Pintar los panes ya fermentados con huevo.",
        "Cocinar en horno convector a 160° con 100% de humedad.",
      ]
    }
  },

];
