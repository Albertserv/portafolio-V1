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
      slug:        "glam-nails",
      nombre:      "Glam Nails",
      tipo:        "SaaS para clientes",
      url:         "https://glamnails.fluxoweb.xyz",
      imagen:      "glamnails-screen.png",
      color:       "#d0457f",
      resumen:     "Reservas online para un salón de belleza.",
      descripcion: "Sistema de gestión y turnos para un salón de manicura: reservas 24/7, confirmación al instante y cero llamadas.",
      tags:        ["SaaS", "Reservas", "Gestión"]
    },
    {
      slug:        "guarani-a-letras",
      nombre:      "guarani-a-letras",
      tipo:        "Librería open source · npm",
      url:         "https://www.npmjs.com/package/guarani-a-letras",
      imagen:      "guarani-screen.png",
      color:       "#e5484d",
      resumen:     "Números a letras, en guaraníes.",
      descripcion: "Convierte 12345 en \"DOCE MIL TRESCIENTOS CUARENTA Y CINCO GUARANÍES\". " \
                   "Lista para facturas, cheques y documentos legales en Paraguay.",
      tags:        ["Node.js", "npm", "Open source"]
    }
  ].freeze

  EXPERIENCIA = [
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
      rol:     "Asistente de R.M.A.",
      periodo: "2023",
      puntos:  ["Testing y configuración de routers y equipos de red"]
    },
    {
      lugar:   "Universidad Privada del Este",
      rol:     "Ingeniería en Informática · Lic. en Análisis de Sistemas",
      periodo: "2018 — 2023",
      educacion: true,
      puntos:  []
    }
  ].freeze

  STACK = {
    front: [
      { nombre: "React",      logo: "reactjs.svg" },
      { nombre: "JavaScript", logo: "js.svg" },
      { nombre: "HTML / CSS", logo: "html.svg" },
      { nombre: "Tailwind",   logo: "tailwind.svg" }
    ],
    back: [
      { nombre: "Node.js",    logo: "nodejs.svg" },
      { nombre: "Express",    logo: "expressjs.svg", invertir: true },
      { nombre: "Python",     logo: "python.svg" },
      { nombre: "Rails",      logo: "rubyonrails.svg" },
      { nombre: "Ruby",       logo: "ruby.svg" },
      { nombre: "C# / .NET",  logo: "dotnet.svg" },
      { nombre: "PostgreSQL", logo: "pgsql.svg" },
      { nombre: "MongoDB",    logo: "mongodb.svg" },
      { nombre: "MariaDB",    logo: "mariadb.svg" },
      { nombre: "Docker",     logo: "docker.svg" }
    ]
  }.freeze
end
