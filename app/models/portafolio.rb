# Todo el contenido del portafolio vive acá.
# Para agregar o editar un proyecto, experiencia o tecnología, tocá solo este archivo.
module Portafolio
  PROYECTOS = [
    {
      slug:        "millonai",
      nombre:      "MillonAI",
      tipo:        "Producto propio · IA",
      url:         "https://millonai.com",
      imagen:      "millonai-screen.png",
      color:       "#4ade80",
      resumen:     "Tus finanzas personales, por WhatsApp.",
      descripcion: "Mandás un mensaje, un audio o la foto de un ticket y la IA lo categoriza y te muestra a dónde se va tu plata. " \
                   "Pensada para Paraguay: guaraníes, ANDE, IPS, combustible y billeteras locales.",
      tags:        ["IA", "WhatsApp", "Finanzas"]
    },
    {
      slug:        "redfin",
      nombre:      "Redfin",
      tipo:        "Fintech · Plataforma web",
      url:         "https://redfin.com.py",
      imagen:      "redfin-screen.jpg",
      color:       "#f43f5e",
      resumen:     "Financiamiento para empresas, 100% digital.",
      descripcion: "Plataforma de financiamiento alternativo: descuento de facturas y créditos revolventes con solicitud online, " \
                   "respuesta en 24 a 48 horas y un simulador que calcula al instante cuánto recibís por tus facturas.",
      tags:        ["Fintech", "Factoring", "Simulador"]
    },
    {
      slug:        "sparky",
      nombre:      "Sparky",
      tipo:        "SaaS · IA en WhatsApp",
      url:         "https://sparky.fluxoweb.xyz",
      imagen:      "sparky-screen.jpg",
      color:       "#10b981",
      resumen:     "Un asistente que atiende el WhatsApp de tu negocio.",
      descripcion: "Responde consultas, da turnos, toma pedidos y pide la seña a cualquier hora. Entiende notas de voz, " \
                   "confirma las citas y el dueño sigue todo desde una app en el celular.",
      tags:        ["IA", "WhatsApp", "Turnos y pedidos"]
    },
    {
      slug:        "zap-pulse",
      nombre:      "Zap Pulse",
      tipo:        "SaaS · Ventas por WhatsApp",
      url:         "https://zap-pulse.fluxoweb.app",
      imagen:      "zap-pulse-screen.jpg",
      color:       "#6d8bff",
      resumen:     "Tu tienda sigue vendiendo mientras dormís.",
      descripcion: "Un asistente de ventas que contesta por WhatsApp en segundos, como lo haría el dueño: responde precios, " \
                   "toma pedidos y agenda turnos. Se conecta escaneando un código, sin instalar nada.",
      tags:        ["IA", "WhatsApp", "Ventas"]
    },
    {
      slug:        "quiro-ai",
      nombre:      "Quiro AI",
      tipo:        "Producto propio · IA generativa",
      url:         "https://quiro-ai.com",
      imagen:      "quiroai-screen.png",
      color:       "#f5c542",
      resumen:     "Bienestar personal asistido por IA.",
      descripcion: "Genera Qbooks personalizados basados en Ikigai e identidad, con QCoach como asistente de mentoría personal.",
      tags:        ["IA generativa", "Bienestar", "Coaching"]
    },
    {
      slug:        "pro-aqua",
      nombre:      "Pro Aqua",
      tipo:        "E-commerce",
      url:         "https://pro-aqua.com.py",
      imagen:      "pro-aqua-screen.jpg",
      color:       "#5eead4",
      resumen:     "Tienda online de aspiradoras con filtro de agua.",
      descripcion: "E-commerce en Paraguay para las aspiradoras alemanas Vivenso y Hyla: catálogo con precios en guaraníes, " \
                   "carrito de compras, guías de uso y atención por WhatsApp.",
      tags:        ["E-commerce", "Catálogo", "Carrito"]
    },
    {
      slug:        "reckado",
      nombre:      "Reckado",
      tipo:        "Web app gratuita",
      url:         "https://reckado.com",
      imagen:      "reckado-screen.png",
      color:       "#22a7e6",
      resumen:     "Listas de compras inteligentes.",
      descripcion: "Organiza el presupuesto del supermercado y ayuda a evitar compras impulsivas. Gratis y pensada para usarse desde el celular.",
      tags:        ["Web app", "Finanzas", "Mobile first"]
    },
    {
      slug:        "guarani-a-letras",
      nombre:      "guarani-a-letras",
      tipo:        "Librería open source · npm",
      url:         "https://www.npmjs.com/package/guarani-a-letras",
      imagen:      "guarani-screen.png",
      color:       "#c084fc",
      resumen:     "Números a letras, en guaraníes.",
      descripcion: "Convierte 12345 en \"DOCE MIL TRESCIENTOS CUARENTA Y CINCO GUARANÍES\". " \
                   "Lista para facturas, cheques y documentos legales en Paraguay.",
      tags:        ["Node.js", "npm", "Open source"]
    }
  ].freeze

  # En orden cronológico: la línea de tiempo se recorre de izquierda a derecha y termina hoy.
  EXPERIENCIA = [
    {
      lugar:   "Universidad Privada del Este",
      rol:     "Ingeniería en Informática · Lic. en Análisis de Sistemas",
      periodo: "2018 — 2023",
      educacion: true,
      puntos:  ["Ingeniero en Informática, egresado en 2023"]
    },
    {
      lugar:   "Neotelecom S.A.",
      rol:     "Asistente de R.M.A.",
      periodo: "2023",
      puntos:  ["Testing y configuración de routers y equipos de red"]
    },
    {
      lugar:   "Fusión Electromecánica",
      rol:     "Desarrollador · sistema de telemetría",
      periodo: "2023",
      puntos:  [
        "Monitoreo con Node-RED, Grafana, InfluxDB y Docker",
        "Configuración de dispositivos IoT con MQTT"
      ]
    },
    {
      lugar:   "Neotelecom S.A.",
      rol:     "Analista de datos y desarrollo backend",
      periodo: "2023 — 2026",
      puntos:  [
        "Sistemas y APIs con Node.js y Express",
        "Azure Functions en Python y C# para procesamiento de datos",
        "Backends con Flask y Django, apps de escritorio y automatizaciones en Python"
      ]
    },
    {
      lugar:   "Fluxo Web E.A.S.",
      rol:     "Co-fundador y desarrollador principal",
      periodo: "2021 — Hoy",
      nota:    "Full time desde 2026",
      puntos:  [
        "Diseño, desarrollo y lanzamiento de productos web con IA",
        "Arquitectura y stack técnico de cada producto",
        "Dirección de producto y del equipo técnico"
      ]
    }
  ].freeze

  # Las capas en las que se desarma la red, de arriba (lo que ves) hacia abajo (lo que no ves).
  CAPAS = [
    { nombre: "Interfaz",         visible: true, tecnologias: ["React", "JavaScript", "Tailwind", "HTML / CSS"] },
    { nombre: "API y lógica",     tecnologias: ["Node.js", "Express", "Ruby on Rails", "Python", "C# / .NET"] },
    { nombre: "IA y automatización", tecnologias: ["Modelos de IA", "WhatsApp", "Scripts en Python"] },
    { nombre: "Datos",            tecnologias: ["PostgreSQL", "MongoDB", "MariaDB", "InfluxDB"] },
    { nombre: "Infraestructura",  tecnologias: ["Docker", "Azure Functions", "Grafana", "MQTT / IoT"] }
  ].freeze
end
