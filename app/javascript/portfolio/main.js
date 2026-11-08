import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import { createNetwork } from "portfolio/network"
import { highlightAll } from "portfolio/code"

const root = document.documentElement
const reduced = root.classList.contains("reduced")
const story = root.classList.contains("story")
const canHover = matchMedia("(hover: hover)").matches
const isMobile = () => innerWidth < 760
const clamp01 = (x) => Math.min(Math.max(x, 0), 1)
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x) }
const lerp = (a, b, t) => a + (b - a) * t
const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel))

gsap.registerPlugin(ScrollTrigger)

/* =========================================================
   Scroll suave
   ========================================================= */
let lenis = null
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

/* =========================================================
   Geometría de los capítulos
   ========================================================= */
const CHAPTERS = ["inicio", "stack", "proyectos", "experiencia", "sobre-mi", "contacto"]
const NAMES = { inicio: "Inicio", stack: "Capas", proyectos: "Proyectos", experiencia: "Experiencia", "sobre-mi": "Sobre mí", contacto: "Contacto" }
const C = {}
function measure() {
  for (const id of CHAPTERS) {
    const el = document.getElementById(id)
    if (el) C[id] = { el, top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight }
  }
}
// Progreso dentro de un capítulo fijo (0 cuando se fija, 1 cuando se suelta)
const pinned = (c, y) => (c ? clamp01((y - c.top) / Math.max(1, c.height - innerHeight)) : 0)

const slides = $$("[data-slide]")
const projectCount = slides.length

function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6 })
  else scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" })
}
function scrollToProject(i) {
  const c = C.proyectos
  if (!story || !c) return slides[i]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
  scrollToY(c.top + (c.height - innerHeight) * ((i + 0.5) / projectCount))
}
function scrollToEl(el) {
  if (!el) return
  if (el.id === "inicio") return scrollToY(0)
  const slide = el.closest("[data-slide]")
  if (slide) return scrollToProject(Number(slide.dataset.slide))
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
}

/* =========================================================
   Menú, links y header
   ========================================================= */
const nav = $("#nav")
const menuBtn = $("#menu-btn")
let menuOpen = false
function setMenu(open) {
  menuOpen = open
  nav.classList.toggle("is-open", open)
  menuBtn.setAttribute("aria-expanded", String(open))
  menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú")
  if (lenis) open ? lenis.stop() : lenis.start()
}
menuBtn.addEventListener("click", () => setMenu(!menuOpen))
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) setMenu(false) })

document.addEventListener("click", (e) => {
  const goto = e.target.closest("[data-goto-project]")
  if (goto) {
    e.preventDefault()
    return scrollToProject(Number(goto.dataset.gotoProject))
  }
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const el = document.getElementById(a.getAttribute("href").slice(1))
  if (!el) return
  e.preventDefault()
  if (menuOpen) setMenu(false)
  scrollToEl(el)
})

const header = $("#site-header")
let lastY = scrollY
function updateHeader(y) {
  header.classList.toggle("is-scrolled", y > 20)
  header.classList.toggle("is-hidden", !menuOpen && y > lastY + 2 && y > 500)
  if (y < lastY - 2) header.classList.remove("is-hidden")
  lastY = y
}
const navLinks = $$(".nav a")

/* =========================================================
   La red 3D
   ========================================================= */
const hero = $("#inicio")
const net = createNetwork({
  canvas: $("#scene"),
  labelsEl: $("#node-labels"),
  projects: JSON.parse(hero.dataset.projects || "[]"),
  onSelect: (slug, k) => scrollToProject(k)
})

// Las etiquetas de la portada no pueden pisar el título
const title = $("[data-hero-title]")
const updateLabelsMinX = () => net?.set({ labelsMinX: title ? title.getBoundingClientRect().right + 16 : 0 })

/* =========================================================
   El guion: qué hace la red en cada capítulo
   ========================================================= */
function storyState(y) {
  const vh = innerHeight, m = isMobile(), center = y + vh / 2
  const base = m ? { x: 0, y: 1.9, scale: 0.6 } : { x: 2.9, y: 0.1, scale: 0.86 }
  const S = { to: "sphere", t: 0, focus: -1, rotX: null, rotY: null, spin: 0.07, labels: 0 }

  // 1. Portada: la red a la derecha, con las etiquetas de los proyectos
  if (!C.stack || center < C.stack.top) {
    const p = clamp01(y / C.inicio.height)
    return { region: "inicio", ...S, x: lerp(base.x, 0, p), y: lerp(base.y, 0, p), scale: lerp(base.scale, m ? 0.7 : 0.95, p), opacity: lerp(1, 0.6, p), labels: Math.max(0, (m ? 0 : 1) - p * 3) }
  }
  // 2. Capas: se desarma (y se vuelve a armar al final del capítulo)
  if (center < C.proyectos.top) {
    const p = pinned(C.stack, y)
    const t = smooth(p / 0.3) * (1 - smooth((p - 0.86) / 0.14))
    return { region: "stack", ...S, to: "layers", t, x: m ? 0 : 0.45, y: m ? -1.2 : -0.1, scale: m ? 0.55 : 0.72, opacity: 1, rotX: 0.4, spin: 0.1 }
  }
  // 3. Proyectos: gira hasta el nodo de cada proyecto
  if (center < C.experiencia.top) {
    const i = Math.min(projectCount - 1, Math.floor(pinned(C.proyectos, y) * projectCount))
    return { region: "proyectos", ...S, focus: i, x: 0, y: 0, scale: m ? 0.9 : 1.25, opacity: 0.4 }
  }
  // 4. Experiencia: se estira en una ruta que avanza con las tarjetas
  if (center < C["sobre-mi"].top) {
    const p = pinned(C.experiencia, y)
    const t = smooth(p / 0.16) * (1 - smooth((p - 0.9) / 0.1))
    return { region: "experiencia", ...S, to: "line", t, x: lerp(5, -5, p), y: m ? -2.5 : -2.2, scale: 1, opacity: 0.9, rotX: 0.12, rotY: 0, spin: 0 }
  }
  // 5. Sobre mí: de fondo, tranquila
  if (center < C.contacto.top) {
    return { region: "sobre-mi", ...S, x: m ? 0 : 2.6, y: 0, scale: m ? 0.8 : 1, opacity: 0.32 }
  }
  // 6. Contacto: todo se junta en un punto que late
  const p = clamp01((y + vh - C.contacto.top) / (vh * 0.8))
  return { region: "contacto", ...S, to: "point", t: smooth(p), x: 0, y: m ? 2.4 : 1.7, scale: 1, opacity: 1 }
}

/* ---------- Proyectos: cambia el proyecto activo ---------- */
const medias = $$("[data-media]")
const projectLinks = $$("[data-goto-project]")
const projectsBar = $("[data-projects-bar]")
const projectCountEl = $("[data-project-count]")
let currentProject = -1

function setProject(i) {
  if (i === currentProject) return
  const prev = currentProject
  currentProject = i
  const dir = prev < 0 ? 1 : Math.sign(i - prev)
  projectLinks.forEach((a, k) => a.classList.toggle("is-active", k === i))
  slides.forEach((s, k) => s.setAttribute("aria-hidden", String(k !== i)))
  medias.forEach((m, k) => { m.classList.toggle("is-active", k === i); m.tabIndex = k === i ? 0 : -1 })
  if (projectCountEl) projectCountEl.textContent = String(i + 1).padStart(2, "0")
  if (!story) return

  const inS = slides[i], outS = slides[prev], inM = medias[i], outM = medias[prev]
  gsap.killTweensOf([inS, outS, inM, outM].filter(Boolean))
  if (prev < 0 || reduced) {
    slides.forEach((s, k) => gsap.set(s, { autoAlpha: k === i ? 1 : 0, y: 0 }))
    medias.forEach((m, k) => gsap.set(m, { autoAlpha: k === i ? 1 : 0 }))
    return
  }
  gsap.to(outS, { autoAlpha: 0, y: -36 * dir, duration: 0.45, ease: "power2.in" })
  gsap.fromTo(inS, { autoAlpha: 0, y: 44 * dir }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.2, ease: "expo.out" })
  gsap.fromTo(inS.children, { y: 18 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.25, stagger: 0.05, ease: "expo.out" })

  gsap.to(outM, { autoAlpha: 0, scale: 0.94, y: -30 * dir, duration: 0.5, ease: "power2.in" })
  gsap.fromTo(inM, { autoAlpha: 0, scale: 1.04, y: 40 * dir }, { autoAlpha: 1, scale: 1, y: 0, duration: 1, delay: 0.15, ease: "expo.out" })
  gsap.fromTo($(".browser", inM), { clipPath: "inset(12% 8% 12% 8% round 14px)" }, { clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 1.1, delay: 0.15, ease: "expo.out" })
  gsap.fromTo($(".screen-inner", inM), { scale: 1.18 }, { scale: 1, duration: 1.6, delay: 0.15, ease: "expo.out" })
}

/* ---------- Experiencia: las tarjetas avanzan de costado ---------- */
const track = $("[data-exp-track]")
const expCards = $$("[data-exp-card]")
const expBar = $("[data-exp-bar]")
function updateExperience(p) {
  if (!story || !track) return
  const max = Math.max(0, track.scrollWidth - innerWidth)
  const x = -max * smooth((p - 0.04) / 0.9)
  track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
  if (expBar) expBar.style.transform = `scaleX(${p.toFixed(4)})`
  const mid = innerWidth / 2
  expCards.forEach((card) => {
    const c = card.offsetLeft + x + card.offsetWidth / 2
    const d = Math.min(1, Math.abs(c - mid) / (innerWidth * 0.6))
    card.style.opacity = (1 - d * 0.6).toFixed(3)
    card.style.transform = `translate3d(0, ${(d * 24).toFixed(1)}px, 0) scale(${(1 - d * 0.05).toFixed(4)})`
    card.classList.toggle("is-active", d < 0.25)
  })
}

/* ---------- Reglita de progreso ---------- */
const ruler = $("#ruler")
const rulerMark = $("[data-ruler-mark]")
const rulerNum = $("[data-ruler-num]")
const rulerName = $("[data-ruler-name]")
let lastRegion = ""
function updateRuler(y, region) {
  if (!ruler) return
  const max = document.documentElement.scrollHeight - innerHeight
  const ticks = rulerMark.parentElement
  rulerMark.style.transform = `translateX(${(clamp01(y / max) * (ticks.offsetWidth - 2)).toFixed(1)}px)`
  ruler.classList.toggle("is-hidden", region === "contacto" || y < 40)
  if (region !== lastRegion) {
    lastRegion = region
    rulerNum.textContent = String(CHAPTERS.indexOf(region) + 1).padStart(2, "0")
    rulerName.textContent = NAMES[region] || ""
    navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${region}`))
  }
}

/* ---------- Todo junto, en cada scroll ---------- */
let locked = false   // el formulario toma control de la red por un momento
let region = "inicio"
function update() {
  const y = scrollY
  const s = storyState(y)
  if (!story) s.t = 0   // con movimiento reducido la red no cambia de forma
  region = s.region
  if (net && !locked) net.set(s)
  if (projectCount) {
    const p = pinned(C.proyectos, y)
    setProject(Math.min(projectCount - 1, Math.floor(p * projectCount)))
    if (projectsBar) projectsBar.style.transform = `scaleX(${p.toFixed(4)})`
  }
  updateExperience(pinned(C.experiencia, y))
  updateRuler(y, region)
  updateHeader(y)
}

measure()
updateLabelsMinX()
update()
addEventListener("scroll", update, { passive: true })
addEventListener("resize", () => { measure(); updateLabelsMinX(); update() })
document.fonts?.ready.then(() => { measure(); updateLabelsMinX(); update() })
ScrollTrigger.addEventListener("refresh", () => { measure(); update() })
addEventListener("load", () => ScrollTrigger.refresh())

/* ---------- Capas: etiquetas con líneas que señalan cada capa ---------- */
const callouts = $$("[data-callout]")
const svg = $(".callout-lines")
if (net && story && callouts.length && svg) {
  const NS = "http://www.w3.org/2000/svg"
  const parts = callouts.map(() => {
    const path = document.createElementNS(NS, "path")
    const dot = document.createElementNS(NS, "circle")
    dot.setAttribute("r", "3")
    svg.append(path, dot)
    return { path, dot }
  })
  net.onFrame(({ shape, t, W, layerAnchor }) => {
    const active = region === "stack" && shape === "layers"
    const p = pinned(C.stack, scrollY)
    const m = isMobile()
    callouts.forEach((el, l) => {
      const show = active ? smooth((p - (0.3 + l * 0.07)) / 0.06) * smooth((t - 0.6) / 0.3) : 0
      const { path, dot } = parts[l]
      if (show < 0.01) {
        el.style.opacity = 0
        path.style.opacity = 0
        dot.style.opacity = 0
        return
      }
      const w = el._w || (el._w = el.offsetWidth)
      const h = el._h || (el._h = el.offsetHeight)
      // Celular: la etiqueta va encima de su capa, sin línea (no hay lugar al costado)
      if (m) {
        const c = layerAnchor(l, 0)
        const lx = Math.min(Math.max(c.x - w / 2, 12), W - w - 12)
        el.style.transform = `translate3d(${lx.toFixed(1)}px, ${(c.y - h / 2).toFixed(1)}px, 0)`
        el.style.opacity = show.toFixed(3)
        path.style.opacity = 0
        dot.style.opacity = 0
        return
      }
      const a = layerAnchor(l)
      const gap = 60
      const lx = Math.min(a.x + gap, W - w - 12)
      const ly = a.y - 14
      el.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`
      el.style.opacity = show.toFixed(3)
      const elbow = a.x + Math.min(24, gap * 0.4)
      path.setAttribute("d", `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${elbow.toFixed(1)} ${a.y.toFixed(1)} L${(lx - 6).toFixed(1)} ${(ly + 14).toFixed(1)}`)
      path.style.opacity = show
      path.style.strokeDashoffset = ((1 - show) * 200).toFixed(1)
      dot.setAttribute("cx", a.x.toFixed(1))
      dot.setAttribute("cy", a.y.toFixed(1))
      dot.style.opacity = show
    })
  })
}

/* ---------- Celular: la red gira con la inclinación del teléfono ---------- */
if (net && !canHover && !reduced && "DeviceOrientationEvent" in window) {
  const clamp = (x) => Math.max(-1, Math.min(1, x))
  const onOrient = (e) => {
    if (e.gamma == null || e.beta == null) return
    net.tilt(clamp(e.gamma / 25), clamp((e.beta - 50) / 25))
  }
  const enable = () => addEventListener("deviceorientation", onOrient, { passive: true })
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    hero.addEventListener("touchend", () => {
      DeviceOrientationEvent.requestPermission().then((s) => s === "granted" && enable()).catch(() => {})
    }, { once: true })
  } else {
    enable()
  }
}

/* ---------- Mensaje enviado: el punto explota y la red se vuelve a armar ---------- */
function celebrate() {
  if (!net) return
  locked = true
  net.set({ to: "point", t: 0, opacity: 1 })
  setTimeout(() => {
    const node = net.nearest(innerWidth / 2, innerHeight / 2)
    if (node) net.burst(node.i)
  }, 250)
}
if ($(".flash--ok")) {
  setTimeout(() => {
    celebrate()
    setTimeout(() => { locked = false; update() }, 4000)
  }, 1600)
}

/* ---------- Formulario: el mensaje viaja hasta el punto ---------- */
const form = $(".contact-form")
if (form && net && !reduced) {
  form.addEventListener("submit", (e) => {
    if (form.dataset.sending) return
    e.preventDefault()
    if (!form.reportValidity()) return
    form.dataset.sending = "1"

    const btn = $("button[type=submit]", form)
    btn.disabled = true
    btn.textContent = "Enviando…"

    const r = btn.getBoundingClientRect()
    const target = net.nearest(innerWidth * 0.5, innerHeight * 0.3) || { i: -1, x: innerWidth / 2, y: innerHeight * 0.3 }

    const packet = document.createElement("div")
    packet.className = "packet"
    document.body.appendChild(packet)
    gsap.set(packet, { x: r.left + r.width / 2, y: r.top + r.height / 2 })

    gsap.timeline({ onComplete: () => form.submit() })
      .to(packet, { x: target.x, duration: 0.9, ease: "power2.inOut" }, 0)
      .to(packet, { y: target.y, duration: 0.9, ease: "back.in(1.6)" }, 0)
      .to(packet, { scale: 2.5, opacity: 0, duration: 0.25, ease: "power2.out" }, 0.85)
      .add(celebrate, 0.85)
      .to({}, { duration: 1.2 })
  })
}

/* ---------- Cursor: un nodo más de la red ---------- */
if (canHover && !reduced) {
  const cursor = document.createElement("div")
  cursor.className = "cursor is-off"
  cursor.setAttribute("aria-hidden", "true")
  document.body.appendChild(cursor)
  root.classList.add("has-cursor")

  let x = 0, y = 0, tx = 0, ty = 0, seen = false
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return
    tx = e.clientX; ty = e.clientY
    if (!seen) { x = tx; y = ty; seen = true; cursor.classList.remove("is-off") }
    const t = e.target
    const hidden = !!t.closest("input, textarea, .project-media.is-xray")
    cursor.classList.toggle("is-hidden", hidden)
    cursor.classList.toggle("is-link", !hidden && !!t.closest("a, button, label, .node-label"))
  }, { passive: true })
  addEventListener("pointerdown", () => cursor.classList.add("is-down"))
  addEventListener("pointerup", () => cursor.classList.remove("is-down"))
  document.addEventListener("pointerleave", () => cursor.classList.add("is-off"))
  document.addEventListener("pointerenter", () => seen && cursor.classList.remove("is-off"))

  gsap.ticker.add(() => {
    x += (tx - x) * 0.45
    y += (ty - y) * 0.45
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
  })
}

/* ---------- Lupa: muestra el código detrás de cada captura ---------- */
highlightAll()
if (canHover) {
  $$("[data-xray]").forEach((media) => {
    const area = $("[data-xray-area]", media)
    const xray = $(".xray", media)
    const lens = $(".lens", media)
    media.addEventListener("pointermove", (e) => {
      const ar = area.getBoundingClientRect()
      const inside = e.clientX > ar.left && e.clientX < ar.right && e.clientY > ar.top && e.clientY < ar.bottom
      media.classList.toggle("is-xray", inside)
      const mr = media.getBoundingClientRect()
      const ms = mr.width / media.offsetWidth || 1
      lens.style.transform = `translate3d(${(e.clientX - mr.left) / ms}px, ${(e.clientY - mr.top) / ms}px, 0)`
      const xr = xray.getBoundingClientRect()
      const s = xr.width / xray.offsetWidth || 1
      xray.style.setProperty("--x", `${(e.clientX - xr.left) / s}px`)
      xray.style.setProperty("--y", `${(e.clientY - xr.top) / s}px`)
      xray.style.setProperty("--rt", `${150 / s}px`)
    })
    media.addEventListener("pointerleave", () => media.classList.remove("is-xray"))
  })
}

/* ---------- Animaciones de entrada ---------- */
if (!reduced) {
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .to("[data-hero-title] .w", { y: 0, duration: 1.4, stagger: 0.06 }, 0.25)
    .fromTo("[data-hero-fade]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.6)

  $$("[data-split]").forEach((h) => {
    gsap.to($$(".w", h), {
      y: 0, duration: 1.2, ease: "expo.out", stagger: 0.05,
      scrollTrigger: { trigger: h, start: "top 85%" }
    })
  })

  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true })
  })

  $$("[data-count]").forEach((el) => {
    const o = { v: 0 }
    el.textContent = "0"
    gsap.to(o, {
      v: Number(el.dataset.count), duration: 1.8, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 92%" },
      onUpdate: () => { el.textContent = Math.round(o.v) }
    })
  })

  // Marquee que acelera con la velocidad del scroll
  const marquee = $("[data-marquee]")
  if (marquee) {
    const loop = gsap.to(marquee, { xPercent: -50, duration: 40, ease: "none", repeat: -1 })
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6)
        gsap.to(loop, { timeScale: 1 + boost, duration: 0.2, overwrite: true })
        gsap.to(loop, { timeScale: 1, duration: 1.4, delay: 0.25 })
      }
    })
  }

  if (canHover) {
    // Inclinación 3D al pasar el mouse
    $$("[data-tilt]").forEach((el) => {
      const t = $(".browser", el) || el
      const base = el.classList.contains("about-photo") ? -2 : 0
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        gsap.to(t, { rotateY: px * 8, rotateX: -py * 6, rotateZ: base, transformPerspective: 1000, duration: 0.6, ease: "power3.out" })
      })
      el.addEventListener("pointerleave", () => {
        gsap.to(t, { rotateY: 0, rotateX: 0, rotateZ: base, duration: 1.2, ease: "elastic.out(1, 0.5)" })
      })
    })

    // Botones magnéticos
    $$("[data-magnetic]").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect()
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3.out" })
      })
      b.addEventListener("pointerleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" }))
    })
  }
}

window.__motionReady = true
