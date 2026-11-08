// Red 3D: el "lente" del portafolio. Nodos (servidores), conexiones y paquetes de datos.
// Cambia de forma según el capítulo: esfera → capas (despiece) → ruta (experiencia) → punto (contacto).
import * as THREE from "three"

const TAU = Math.PI * 2
const clamp01 = (x) => Math.min(Math.max(x, 0), 1)
const ease = (x) => 1 - Math.pow(1 - clamp01(x), 3)
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x) }

export const LAYERS = 5
const LAYER_R = 2.1
const layerY = (l) => (2 - l) * 1.2

// Random con semilla para que la red siempre tenga la misma forma
function seeded(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function dotTexture() {
  const c = document.createElement("canvas")
  c.width = c.height = 64
  const g = c.getContext("2d")
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  gr.addColorStop(0, "rgba(255,255,255,1)")
  gr.addColorStop(0.22, "rgba(255,255,255,0.95)")
  gr.addColorStop(0.5, "rgba(255,255,255,0.22)")
  gr.addColorStop(1, "rgba(255,255,255,0)")
  g.fillStyle = gr
  g.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function createNetwork({ canvas, labelsEl, projects = [], onSelect = () => {} }) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
  } catch (e) {
    document.documentElement.classList.add("no-webgl")
    return null
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
  const mobile = innerWidth < 760
  const canHover = matchMedia("(hover: hover)").matches

  const C_BG = new THREE.Color("#06070b")
  const C_NODE = new THREE.Color("#7f9cf0")
  const C_EDGE = new THREE.Color("#25304c")
  const C_HOT = new THREE.Color("#c8f169")
  const tmp = new THREE.Color()

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(C_BG, 7.5, 13.5)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 10)
  const group = new THREE.Group()
  scene.add(group)
  const tex = dotTexture()
  const rand = seeded(7)

  // ---- Formas: cada nodo tiene una posición en cada forma y se mezcla entre ellas
  const n = mobile ? 100 : 150
  const sphere = [], layers = [], line = [], point = []
  const layerOf = new Uint8Array(n)
  const delay = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const th = i * 2.39996323
    const r = 2.7 + (rand() - 0.5) * 1.1
    sphere.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r))
    delay[i] = rand()
  }
  // Capas: los nodos de arriba de la esfera van a la capa de arriba, como discos apilados
  for (let l = 0; l < LAYERS; l++) {
    const from = Math.floor((l * n) / LAYERS), to = Math.floor(((l + 1) * n) / LAYERS), m = to - from
    for (let j = 0; j < m; j++) {
      const i = from + j, a = j * 2.39996323 + l, r = LAYER_R * Math.sqrt((j + 0.5) / m)
      layerOf[i] = l
      layers[i] = new THREE.Vector3(Math.cos(a) * r, layerY(l) + (rand() - 0.5) * 0.08, Math.sin(a) * r)
    }
  }
  // Ruta: una cinta que ondula de izquierda a derecha
  for (let i = 0; i < n; i++) {
    const x = -9 + (18 * i) / (n - 1)
    line.push(new THREE.Vector3(x, 0.55 * Math.sin(x * 0.6) + (rand() - 0.5) * 0.7, (rand() - 0.5) * 1.4))
  }
  // Punto: todo se junta en el centro
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize().multiplyScalar(rand() * 0.16)
    point.push(v)
  }
  const SHAPES = { sphere, layers, line, point }
  const pts = sphere.map((v) => v.clone())

  const featured = projects.map((p, k) => ({
    ...p,
    i: Math.round((n - 1) * (0.16 + (0.68 * k) / Math.max(projects.length - 1, 1)))
  }))

  // ---- Conexiones: cada nodo con sus 3 vecinos más cercanos (en la esfera)
  const edges = []
  const adj = pts.map(() => [])
  const seen = new Set()
  sphere.forEach((p, i) => {
    sphere
      .map((q, j) => [j, p.distanceToSquared(q)])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .forEach(([j]) => {
        const key = i < j ? i * 10000 + j : j * 10000 + i
        if (seen.has(key)) return
        seen.add(key)
        const e = { a: i, b: j, len: p.distanceTo(sphere[j]) }
        edges.push(e)
        adj[i].push(e)
        adj[j].push(e)
      })
  })

  const edgePos = new Float32Array(edges.length * 6)
  const edgeCol = new Float32Array(edges.length * 6)
  const edgeGeo = new THREE.BufferGeometry()
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePos, 3))
  edgeGeo.setAttribute("color", new THREE.BufferAttribute(edgeCol, 3))
  const edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 })
  const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat)
  edgeLines.frustumCulled = false
  group.add(edgeLines)

  const nodePos = new Float32Array(n * 3)
  const nodeCol = new Float32Array(n * 3)
  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3))
  nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeCol, 3))
  const pointOpts = { map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }
  const nodeMat = new THREE.PointsMaterial({ ...pointOpts, size: 0.11, vertexColors: true, opacity: 0 })
  const nodePoints = new THREE.Points(nodeGeo, nodeMat)
  nodePoints.frustumCulled = false
  group.add(nodePoints)

  // ---- Nodos de proyectos
  const featPos = new Float32Array(featured.length * 3)
  const featGeo = new THREE.BufferGeometry()
  featGeo.setAttribute("position", new THREE.BufferAttribute(featPos, 3))
  const featMat = new THREE.PointsMaterial({ ...pointOpts, size: 0.36, color: C_HOT, opacity: 0 })
  const featPoints = new THREE.Points(featGeo, featMat)
  featPoints.frustumCulled = false
  group.add(featPoints)

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ ...pointOpts, color: C_HOT, opacity: 0 }))
  group.add(halo)

  // ---- Paquetes de datos
  const M = mobile ? 50 : 110
  const packets = Array.from({ length: M }, () => {
    const e = edges[(rand() * edges.length) | 0]
    return { e, from: e.a, t: rand(), sp: 0.7 + rand() * 1.3 }
  })
  const packPos = new Float32Array(M * 3)
  const packGeo = new THREE.BufferGeometry()
  packGeo.setAttribute("position", new THREE.BufferAttribute(packPos, 3))
  const packMat = new THREE.PointsMaterial({ ...pointOpts, size: 0.13, color: C_HOT, opacity: 0 })
  const packPoints = new THREE.Points(packGeo, packMat)
  packPoints.frustumCulled = false
  group.add(packPoints)

  const heat = new Float32Array(n)

  // ---- Líneas que conectan el cursor con los nodos más cercanos (el cursor es un nodo más)
  const K = 4
  const linkPos = new Float32Array(K * 6)
  const linkCol = new Float32Array(K * 6)
  const linkGeo = new THREE.BufferGeometry()
  linkGeo.setAttribute("position", new THREE.BufferAttribute(linkPos, 3))
  linkGeo.setAttribute("color", new THREE.BufferAttribute(linkCol, 3))
  const links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }))
  links.frustumCulled = false
  scene.add(links)
  const near = []

  // ---- Onda que recorre la red nodo por nodo
  let wave = null
  function burst(start) {
    if (start == null || start < 0 || start >= n) return
    const dist = new Int16Array(n).fill(-1)
    dist[start] = 0
    const q = [start]
    for (let h = 0; h < q.length; h++) {
      const a = q[h]
      for (const e of adj[a]) {
        const b = e.a === a ? e.b : e.a
        if (dist[b] < 0) { dist[b] = dist[a] + 1; q.push(b) }
      }
    }
    wave = { t0: performance.now() / 1000, dist }
  }

  // ---- Etiquetas HTML de los proyectos
  let hover = -1
  const labels = featured.map((f, k) => {
    const el = document.createElement("button")
    el.type = "button"
    el.className = "node-label"
    el.textContent = f.nombre
    el.tabIndex = -1
    el.style.opacity = 0
    el.addEventListener("click", () => onSelect(f.slug, k))
    el.addEventListener("pointerenter", () => { hover = k })
    el.addEventListener("pointerleave", () => { hover = -1 })
    labelsEl?.appendChild(el)
    return el
  })

  // ---- Mouse
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -9999, py: -9999, active: false }
  addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / innerWidth) * 2 - 1
    mouse.ty = (e.clientY / innerHeight) * 2 - 1
    mouse.px = e.clientX
    mouse.py = e.clientY
    mouse.active = e.pointerType === "mouse"
  }, { passive: true })
  document.addEventListener("pointerleave", () => { mouse.active = false; mouse.tx = mouse.ty = 0 })

  // ---- Estado que controla el scroll (ver main.js)
  //   to/t: forma destino y cuánto se transformó (0 = esfera, 1 = forma destino)
  //   rotX/rotY: rotación fija (null = gira sola a velocidad `spin`)
  const target = {
    x: 0, y: 0, scale: 1, opacity: 1, labels: 1, focus: -1, labelsMinX: 0,
    to: "sphere", t: 0, rotX: null, rotY: null, spin: 0.07
  }
  const cur = { x: 0, y: 0, scale: 1, opacity: 1, labels: 0, t: 0 }
  let shapeTo = "sphere"
  let rotY = -0.6, rotX = 0, lastOpacity = -1

  let W = 0, H = 0
  function resize() {
    W = innerWidth; H = innerHeight
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
  }
  resize()
  addEventListener("resize", resize)

  const v = new THREE.Vector3()
  const w = new THREE.Vector3()
  const LINK_R = 190
  const hooks = []
  const start = performance.now()
  let last = start
  let initialized = false

  const wrapAngle = (d) => (((d + Math.PI) % TAU) + TAU) % TAU - Math.PI

  // Punto local de la red → pantalla (px)
  function toScreen(x, y, z) {
    w.set(x, y, z).applyMatrix4(group.matrixWorld)
    const depth = w.z
    w.project(camera)
    return { x: ((w.x + 1) / 2) * W, y: ((1 - w.y) / 2) * H, z: depth }
  }
  // Borde derecho de una capa en pantalla (para las etiquetas del despiece)
  function layerAnchor(l, side = 1) {
    w.set(0, layerY(l), 0).applyMatrix4(group.matrixWorld)
    w.x += side * LAYER_R * group.scale.x
    w.project(camera)
    return { x: ((w.x + 1) / 2) * W, y: ((1 - w.y) / 2) * H }
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = (now - start) / 1000
    const k1 = ease(t / 1.4), k2 = ease((t - 0.5) / 1.6), k3 = ease((t - 1.3) / 1.2)
    const L = 1 - Math.exp(-dt * 4)

    if (!initialized) { Object.assign(cur, { ...target, labels: 0, t: target.t }); shapeTo = target.to; initialized = true }
    for (const key of ["x", "y", "scale", "opacity", "labels"]) cur[key] += (target[key] - cur[key]) * L
    mouse.x += (mouse.tx - mouse.x) * L
    mouse.y += (mouse.ty - mouse.y) * L

    // ---- Cambio de forma: si cambia el destino, primero vuelve a la esfera
    if (target.to !== shapeTo && cur.t < 0.02) shapeTo = target.to
    const goal = target.to === shapeTo ? target.t : 0
    cur.t += (goal - cur.t) * (1 - Math.exp(-dt * 7))
    const B = SHAPES[shapeTo] || sphere
    if (cur.t < 0.0005) {
      for (let i = 0; i < n; i++) pts[i].copy(sphere[i])
    } else {
      for (let i = 0; i < n; i++) {
        const ti = smooth(cur.t * 1.4 - delay[i] * 0.4)
        pts[i].lerpVectors(sphere[i], B[i], ti)
      }
    }

    // ---- Rotación: apunta al proyecto en foco, queda fija, o gira sola
    const focusIdx = hover >= 0 ? hover : target.focus
    const k = 1 - Math.exp(-dt * 2.2)
    if (target.focus >= 0 && featured[target.focus]) {
      const p = pts[featured[target.focus].i]
      rotY += wrapAngle(-Math.atan2(p.x, p.z) - rotY) * k
      rotX += (Math.atan2(p.y, Math.hypot(p.x, p.z)) - rotX) * k
    } else {
      if (target.rotY != null) rotY += wrapAngle(target.rotY - rotY) * k
      else rotY += dt * (reduced ? 0.02 : target.spin) + (1 - k1) * dt * 1.2
      rotX += ((target.rotX ?? 0) - rotX) * k
    }

    group.position.set(cur.x, cur.y, 0)
    group.scale.setScalar(cur.scale * (0.6 + 0.4 * k1))
    group.rotation.set(rotX + mouse.y * 0.22, rotY + mouse.x * 0.35, 0)
    group.updateMatrixWorld()

    if (Math.abs(cur.opacity - lastOpacity) > 0.004) {
      canvas.style.opacity = cur.opacity.toFixed(3)
      lastOpacity = cur.opacity
    }

    // ---- Paquetes
    const speed = reduced ? 0.3 : 1
    for (let q = 0; q < M; q++) {
      const p = packets[q]
      p.t += (p.sp * dt * speed) / p.e.len
      if (p.t >= 1) {
        const node = p.from === p.e.a ? p.e.b : p.e.a
        heat[node] = Math.min(1, heat[node] + 0.2)
        const opts = adj[node]
        p.e = opts[(rand() * opts.length) | 0]
        p.from = node
        p.t = 0
      }
      const A = pts[p.from], Bp = pts[p.from === p.e.a ? p.e.b : p.e.a]
      packPos[q * 3] = A.x + (Bp.x - A.x) * p.t
      packPos[q * 3 + 1] = A.y + (Bp.y - A.y) * p.t
      packPos[q * 3 + 2] = A.z + (Bp.z - A.z) * p.t
    }
    packGeo.attributes.position.needsUpdate = true

    // ---- El cursor enciende los nodos cercanos y se conecta a ellos
    near.length = 0
    if (mouse.active && canHover && cur.opacity > 0.2) {
      const R = 150, R2 = R * R, LR2 = LINK_R * LINK_R
      const lightUp = cur.opacity > 0.5
      for (let i = 0; i < n; i++) {
        v.copy(pts[i]).applyMatrix4(group.matrixWorld).project(camera)
        const dx = ((v.x + 1) / 2) * W - mouse.px, dy = ((1 - v.y) / 2) * H - mouse.py
        const d2 = dx * dx + dy * dy
        if (lightUp && d2 < R2) heat[i] = Math.max(heat[i], 1 - Math.sqrt(d2) / R)
        if (d2 < LR2) near.push({ i, d2, z: v.z })
      }
      near.sort((a, b) => a.d2 - b.d2)
    }
    const mx = (mouse.px / W) * 2 - 1, my = 1 - (mouse.py / H) * 2
    for (let q = 0; q < K; q++) {
      const o = q * 6, nd = near[q]
      if (!nd) { linkCol.fill(0, o, o + 6); continue }
      w.copy(pts[nd.i]).applyMatrix4(group.matrixWorld).toArray(linkPos, o)
      w.set(mx, my, nd.z).unproject(camera).toArray(linkPos, o + 3)
      const s = (1 - Math.sqrt(nd.d2) / LINK_R) * Math.min(1, cur.opacity * 1.6)
      tmp.copy(C_HOT).multiplyScalar(s * 0.5).toArray(linkCol, o)
      tmp.copy(C_HOT).multiplyScalar(s).toArray(linkCol, o + 3)
      heat[nd.i] = Math.max(heat[nd.i], s)
    }
    linkGeo.attributes.position.needsUpdate = true
    linkGeo.attributes.color.needsUpdate = true

    // ---- Onda
    if (wave) {
      const el = now / 1000 - wave.t0
      let alive = false
      for (let i = 0; i < n; i++) {
        const d = wave.dist[i]
        if (d < 0) continue
        const ph = el - d * 0.07
        if (ph >= 0 && ph < 0.15) heat[i] = 1
        if (ph < 0.15) alive = true
      }
      if (!alive) wave = null
    }

    if (focusIdx >= 0 && featured[focusIdx]) {
      const fi = featured[focusIdx].i
      heat[fi] = 1
      adj[fi].forEach((e) => { const o = e.a === fi ? e.b : e.a; heat[o] = Math.max(heat[o], 0.6) })
    }
    // En el despiece la capa de arriba ("lo que ves") brilla; en el punto, todo brilla
    if (shapeTo === "layers" && cur.t > 0.3) for (let i = 0; i < n; i++) { if (layerOf[i] === 0) heat[i] = Math.max(heat[i], 0.55 * cur.t) }
    if (shapeTo === "point" && cur.t > 0.05) for (let i = 0; i < n; i++) heat[i] = Math.max(heat[i], cur.t)

    // ---- Posiciones y colores
    const decay = Math.exp(-dt * 2.2)
    for (let i = 0; i < n; i++) {
      pts[i].toArray(nodePos, i * 3)
      tmp.copy(C_NODE).lerp(C_HOT, heat[i]).toArray(nodeCol, i * 3)
      heat[i] *= decay
    }
    for (let q = 0; q < edges.length; q++) {
      const e = edges[q], A = pts[e.a], Bp = pts[e.b]
      A.toArray(edgePos, q * 6)
      Bp.toArray(edgePos, q * 6 + 3)
      // Las conexiones muy estiradas (entre capas o en la ruta) se apagan
      const fade = clamp01(1.8 - (A.distanceTo(Bp) / e.len) * 0.8)
      tmp.copy(C_EDGE).lerp(C_HOT, Math.min(1, heat[e.a] * 0.85)).multiplyScalar(fade).toArray(edgeCol, q * 6)
      tmp.copy(C_EDGE).lerp(C_HOT, Math.min(1, heat[e.b] * 0.85)).multiplyScalar(fade).toArray(edgeCol, q * 6 + 3)
    }
    featured.forEach((f, q) => pts[f.i].toArray(featPos, q * 3))
    nodeGeo.attributes.position.needsUpdate = true
    nodeGeo.attributes.color.needsUpdate = true
    edgeGeo.attributes.position.needsUpdate = true
    edgeGeo.attributes.color.needsUpdate = true
    featGeo.attributes.position.needsUpdate = true

    nodeMat.opacity = k1
    edgeMat.opacity = 0.8 * k2
    packMat.opacity = k3 * (1 - cur.t * (shapeTo === "point" ? 1 : 0.5))
    featMat.opacity = k3 * (1 - cur.t)

    // Halo pulsante sobre el proyecto en foco
    if (focusIdx >= 0 && featured[focusIdx]) {
      halo.position.copy(pts[featured[focusIdx].i])
      halo.scale.setScalar(0.9 + 0.25 * Math.sin(t * 3))
      halo.material.opacity += (0.9 - halo.material.opacity) * L
    } else if (shapeTo === "point" && cur.t > 0.5) {
      halo.position.set(0, 0, 0)
      halo.scale.setScalar(1.6 + 0.5 * Math.sin(t * 2.4))
      halo.material.opacity += (0.85 * cur.t - halo.material.opacity) * L
    } else {
      halo.material.opacity += (0 - halo.material.opacity) * L
    }

    // ---- Etiquetas de proyectos
    for (let q = 0; q < featured.length; q++) {
      v.copy(pts[featured[q].i]).applyMatrix4(group.matrixWorld)
      const facing = clamp01((v.z + 1.2) / 1.6)
      v.project(camera)
      const el = labels[q]
      const lw = el._w || (el._w = el.offsetWidth) || 120
      const x = Math.min(((v.x + 1) / 2) * W + 14, W - lw - 12)
      const clear = clamp01((x - target.labelsMinX) / 80)
      const a = cur.labels * k3 * (0.35 + 0.65 * facing) * clear * (1 - cur.t)
      el.style.visibility = a < 0.06 ? "hidden" : "visible"
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${(((1 - v.y) / 2) * H - 15).toFixed(1)}px, 0)`
      el.style.opacity = a.toFixed(3)
      el.style.pointerEvents = a > 0.4 ? "auto" : "none"
    }

    for (const fn of hooks) fn({ t: cur.t, shape: shapeTo, W, H, toScreen, layerAnchor })

    renderer.render(scene, camera)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)

  return {
    mobile,
    set(partial) { Object.assign(target, partial) },
    burst,
    onFrame(fn) { hooks.push(fn) },
    // Inclinación desde el giroscopio del celular (-1 a 1 en cada eje)
    tilt(x, y) { mouse.tx = x; mouse.ty = y },
    // Nodo visible más cercano a un punto de la pantalla
    nearest(x, y) {
      let best = null
      for (let i = 0; i < n; i++) {
        w.copy(pts[i]).applyMatrix4(group.matrixWorld)
        if (w.z < -0.5) continue
        w.project(camera)
        const sx = ((w.x + 1) / 2) * W, sy = ((1 - w.y) / 2) * H
        const d = (sx - x) ** 2 + (sy - y) ** 2
        if (!best || d < best.d) best = { i, x: sx, y: sy, d }
      }
      return best
    }
  }
}
