import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import { createNetwork } from "portfolio/network"
import { blueprint } from "portfolio/xray"

const root = document.documentElement
const reduced = root.classList.contains("reduced")
const canHover = matchMedia("(hover: hover)").matches
const lerp = (a, b, t) => a + (b - a) * t
const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel))

gsap.registerPlugin(ScrollTrigger)

/* ---------------- Scroll suave ---------------- */
let lenis = null
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

function scrollToEl(el) {
  if (!el) return
  const top = el.id === "inicio" ? 0 : el
  if (lenis) lenis.scrollTo(top, { offset: el.classList.contains("project") ? -90 : 0, duration: 1.4 })
  else if (top === 0) scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
}

/* ---------------- Menú mobile ---------------- */
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
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const el = document.getElementById(a.getAttribute("href").slice(1))
  if (!el) return
  e.preventDefault()
  if (menuOpen) setMenu(false)
  scrollToEl(el)
})

/* ---------------- Header ---------------- */
const header = $("#site-header")
ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate(self) {
    const y = self.scroll()
    header.classList.toggle("is-scrolled", y > 20)
    header.classList.toggle("is-hidden", !menuOpen && self.direction === 1 && y > 500)
  }
})

const navLinks = $$(".nav a")
$$("main section[id]").forEach((sec) => {
  ScrollTrigger.create({
    trigger: sec,
    start: "top 50%",
    end: "bottom 50%",
    onToggle(self) {
      if (!self.isActive) return
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${sec.id}`))
    }
  })
})

/* ---------------- Red 3D ---------------- */
const hero = $("#inicio")
const net = createNetwork({
  canvas: $("#scene"),
  labelsEl: $("#node-labels"),
  projects: JSON.parse(hero.dataset.projects || "[]"),
  onSelect: (slug) => scrollToEl(document.getElementById(slug))
})

if (net) {
  // En celular la red va arriba y sin etiquetas, para no tapar el título
  const base = net.mobile ? { x: 0, y: 1.9, scale: 0.6 } : { x: 2.9, y: 0.1, scale: 0.86 }
  const baseLabels = net.mobile ? 0 : 1
  net.set({ ...base, opacity: 1, labels: baseLabels })

  // Las etiquetas no pueden pisar el título de la portada
  const title = $("[data-hero-title]")
  const updateLabelsMinX = () => net.set({ labelsMinX: title ? title.getBoundingClientRect().right + 16 : 0 })
  updateLabelsMinX()
  addEventListener("resize", updateLabelsMinX)
  document.fonts?.ready.then(updateLabelsMinX)

  // Al bajar del hero, la red se centra, crece y se atenúa para no competir con el texto
  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "bottom top",
    onUpdate(self) {
      const p = self.progress
      net.set({
        x: lerp(base.x, 0, p),
        y: lerp(base.y, 0, p),
        scale: lerp(base.scale, net.mobile ? 0.95 : 1.3, p),
        opacity: lerp(1, 0.32, p),
        labels: Math.max(0, baseLabels - p * 3)
      })
    },
    // Fuera de la portada las etiquetas se apagan del todo
    onLeave: () => net.set({ labels: 0 })
  })

  // Cada proyecto gira la red hasta su nodo
  $$("[data-project]").forEach((el) => {
    const i = Number(el.dataset.project)
    ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 40%",
      onToggle: (self) => self.isActive && net.set({ focus: i })
    })
  })
  ScrollTrigger.create({
    trigger: ".project-list",
    start: "top 60%",
    end: "bottom 40%",
    onLeave: () => net.set({ focus: -1 }),
    onLeaveBack: () => net.set({ focus: -1 })
  })

  // En contacto la red vuelve a brillar
  ScrollTrigger.create({
    trigger: "#contacto",
    start: "top 60%",
    end: "bottom bottom",
    onToggle: (self) => net.set({ opacity: self.isActive ? 0.6 : 0.32, scale: self.isActive ? 1.05 : (net.mobile ? 0.95 : 1.3) })
  })

  // Celular: la red gira según cómo se incline el teléfono
  if (!canHover && !reduced && "DeviceOrientationEvent" in window) {
    const clamp = (x) => Math.max(-1, Math.min(1, x))
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return
      net.tilt(clamp(e.gamma / 25), clamp((e.beta - 50) / 25))
    }
    const enable = () => addEventListener("deviceorientation", onOrient, { passive: true })
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // iPhone pide permiso, y solo se puede pedir después de un toque
      hero.addEventListener("touchend", () => {
        DeviceOrientationEvent.requestPermission().then((s) => s === "granted" && enable()).catch(() => {})
      }, { once: true })
    } else {
      enable()
    }
  }

  // Si el mensaje se envió bien, la red lo celebra con una onda
  if ($(".flash--ok")) {
    setTimeout(() => {
      net.set({ opacity: 0.9 })
      const node = net.nearest(innerWidth / 2, innerHeight / 2)
      if (node) net.burst(node.i)
      setTimeout(() => net.set({ opacity: 0.6 }), 2500)
    }, 1800)
  }
}

/* ---------------- Formulario: el mensaje viaja por la red ---------------- */
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
    const target = net.nearest(innerWidth * 0.5, innerHeight * 0.4) || { i: -1, x: innerWidth / 2, y: innerHeight * 0.4 }
    net.set({ opacity: 0.95 })

    const packet = document.createElement("div")
    packet.className = "packet"
    document.body.appendChild(packet)
    gsap.set(packet, { x: r.left + r.width / 2, y: r.top + r.height / 2 })

    gsap.timeline({ onComplete: () => form.submit() })
      .to(packet, { x: target.x, duration: 0.9, ease: "power2.inOut" }, 0)
      .to(packet, { y: target.y, duration: 0.9, ease: "back.in(1.6)" }, 0)
      .to(packet, { scale: 2.5, opacity: 0, duration: 0.25, ease: "power2.out" }, 0.85)
      .add(() => net.burst(target.i), 0.85)
      .to({}, { duration: 0.8 })
  })
}

/* ---------------- Cursor: un nodo más de la red ---------------- */
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

/* ---------------- Rayos X sobre las capturas ---------------- */
if (canHover) {
  $$("[data-xray]").forEach((media) => {
    const area = $("[data-xray-area]", media)
    const xray = $(".xray", media)
    const lens = $(".lens", media)
    const shot = $(".screen-img", media)
    let ready = false, building = false

    const build = () => {
      if (building) return
      building = true
      blueprint(shot).then((url) => {
        const img = new Image()
        img.src = url
        img.alt = ""
        xray.appendChild(img)
        ready = true
      }).catch(() => {})
    }
    ScrollTrigger.create({
      trigger: media,
      start: "top 150%",
      once: true,
      onEnter: () => (window.requestIdleCallback || setTimeout)(build)
    })

    media.addEventListener("pointermove", (e) => {
      const ar = area.getBoundingClientRect()
      const inside = e.clientX > ar.left && e.clientX < ar.right && e.clientY > ar.top && e.clientY < ar.bottom
      media.classList.toggle("is-xray", ready && inside)
      const mr = media.getBoundingClientRect()
      lens.style.transform = `translate3d(${e.clientX - mr.left}px, ${e.clientY - mr.top}px, 0)`
      const xr = xray.getBoundingClientRect()
      const s = xr.width / xray.offsetWidth || 1
      xray.style.setProperty("--x", `${(e.clientX - xr.left) / s}px`)
      xray.style.setProperty("--y", `${(e.clientY - xr.top) / s}px`)
      xray.style.setProperty("--rt", `${120 / s}px`)
    })
    media.addEventListener("pointerleave", () => media.classList.remove("is-xray"))
  })
}

/* ---------------- Animaciones ---------------- */
if (!reduced) {
  // Entrada del hero
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .to("[data-hero-title] .w", { y: 0, duration: 1.4, stagger: 0.06 }, 0.25)
    .fromTo("[data-hero-fade]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.6)

  // Títulos palabra por palabra
  $$("[data-split]").forEach((h) => {
    gsap.to($$(".w", h), {
      y: 0, duration: 1.2, ease: "expo.out", stagger: 0.05,
      scrollTrigger: { trigger: h, start: "top 85%" }
    })
  })

  // Aparición general
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true })
  })

  // Proyectos: la captura se abre y tiene parallax
  $$(".project").forEach((p) => {
    const browser = $(".browser", p)
    const img = $("[data-parallax]", p)
    gsap.fromTo(browser,
      { clipPath: "inset(14% 10% 14% 10% round 14px)", scale: 0.9, opacity: 0 },
      { clipPath: "inset(0% 0% 0% 0% round 14px)", scale: 1, opacity: 1, duration: 1.5, ease: "expo.out",
        scrollTrigger: { trigger: p, start: "top 80%" } })
    // La captura hace un zoom-out suave mientras pasa por la pantalla
    gsap.fromTo(img, { scale: 1.12 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: p, start: "top bottom", end: "center 40%", scrub: true }
    })
  })

  // Stack: "lo que no ves" empieza borroso y se vuelve visible
  $$("[data-unblur]").forEach((card) => {
    gsap.fromTo($$(".stack-text, .logos li", card),
      { filter: "blur(10px)", opacity: 0.12 },
      { filter: "blur(0px)", opacity: 1, stagger: 0.05, ease: "none",
        scrollTrigger: { trigger: card, start: "top 85%", end: "center 55%", scrub: true } })
  })
  $$(".stack-card:not([data-unblur])").forEach((card) => {
    gsap.from($$(".logos li", card), {
      y: 24, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.07,
      scrollTrigger: { trigger: card, start: "top 75%" }
    })
  })

  // Línea de tiempo que se dibuja con el scroll
  const timeline = $("[data-timeline]")
  if (timeline) {
    gsap.to("[data-timeline-fill]", {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: timeline, start: "top 65%", end: "bottom 65%", scrub: true }
    })
    $$("[data-tl-item]", timeline).forEach((item) => {
      gsap.fromTo(item, { opacity: 0, x: -24 }, {
        opacity: 1, x: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: item, start: "top 82%" }
      })
      ScrollTrigger.create({
        trigger: item,
        start: "top 65%",
        onEnter: () => item.classList.add("is-active"),
        onLeaveBack: () => item.classList.remove("is-active")
      })
    })
  }

  // Contadores
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
  const track = $("[data-marquee]")
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 })
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
        gsap.to(t, { rotateY: px * 10, rotateX: -py * 8, rotateZ: base, transformPerspective: 1000, duration: 0.6, ease: "power3.out" })
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

// Luz que sigue al mouse en las tarjetas del stack
$$("[data-spotlight]").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect()
    card.style.setProperty("--mx", `${e.clientX - r.left}px`)
    card.style.setProperty("--my", `${e.clientY - r.top}px`)
  })
})

addEventListener("load", () => ScrollTrigger.refresh())
window.__motionReady = true
