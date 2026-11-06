// Red 3D de fondo: nodos (servidores), conexiones y paquetes de datos viajando.
// Los proyectos son nodos destacados con etiqueta. Se ilumina con el mouse y con el tráfico.
import * as THREE from "three"

const TAU = Math.PI * 2
const ease = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3)

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

  // ---- Nodos sobre una esfera irregular
  const n = mobile ? 90 : 150
  const pts = []
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const th = i * 2.39996323
    const r = 2.7 + (rand() - 0.5) * 1.1
    pts.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r))
  }
  const featured = projects.map((p, k) => ({
    ...p,
    i: Math.round((n - 1) * (0.16 + (0.68 * k) / Math.max(projects.length - 1, 1)))
  }))

  // ---- Conexiones: cada nodo con sus 3 vecinos más cercanos
  const edges = []
  const adj = pts.map(() => [])
  const seen = new Set()
  pts.forEach((p, i) => {
    pts
      .map((q, j) => [j, p.distanceToSquared(q)])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .forEach(([j]) => {
        const key = i < j ? i * 10000 + j : j * 10000 + i
        if (seen.has(key)) return
        seen.add(key)
        const e = { a: i, b: j, len: p.distanceTo(pts[j]) }
        edges.push(e)
        adj[i].push(e)
        adj[j].push(e)
      })
  })

  const edgePos = new Float32Array(edges.length * 6)
  const edgeCol = new Float32Array(edges.length * 6)
  edges.forEach((e, k) => { pts[e.a].toArray(edgePos, k * 6); pts[e.b].toArray(edgePos, k * 6 + 3) })
  const edgeGeo = new THREE.BufferGeometry()
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePos, 3))
  edgeGeo.setAttribute("color", new THREE.BufferAttribute(edgeCol, 3))
  const edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 })
  group.add(new THREE.LineSegments(edgeGeo, edgeMat))

  const nodePos = new Float32Array(n * 3)
  const nodeCol = new Float32Array(n * 3)
  pts.forEach((p, i) => p.toArray(nodePos, i * 3))
  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3))
  nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeCol, 3))
  const pointOpts = { map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }
  const nodeMat = new THREE.PointsMaterial({ ...pointOpts, size: 0.11, vertexColors: true, opacity: 0 })
  group.add(new THREE.Points(nodeGeo, nodeMat))

  // ---- Nodos de proyectos
  const featPos = new Float32Array(featured.length * 3)
  featured.forEach((f, k) => pts[f.i].toArray(featPos, k * 3))
  const featGeo = new THREE.BufferGeometry()
  featGeo.setAttribute("position", new THREE.BufferAttribute(featPos, 3))
  const featMat = new THREE.PointsMaterial({ ...pointOpts, size: 0.36, color: C_HOT, opacity: 0 })
  group.add(new THREE.Points(featGeo, featMat))

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
  group.add(new THREE.Points(packGeo, packMat))

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

  // ---- Onda que recorre la red nodo por nodo (al enviar el formulario)
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
  const target = { x: 0, y: 0, scale: 1, opacity: 1, labels: 1, focus: -1, labelsMinX: 0 }
  const cur = { x: 0, y: 0, scale: 1, opacity: 1, labels: 0 }
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
  const start = performance.now()
  let last = start
  let initialized = false

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = (now - start) / 1000
    const k1 = ease(t / 1.4), k2 = ease((t - 0.5) / 1.6), k3 = ease((t - 1.3) / 1.2)
    const L = 1 - Math.exp(-dt * 4)

    if (!initialized) { Object.assign(cur, { ...target, labels: 0 }); initialized = true }
    for (const key of ["x", "y", "scale", "opacity", "labels"]) cur[key] += (target[key] - cur[key]) * L
    mouse.x += (mouse.tx - mouse.x) * L
    mouse.y += (mouse.ty - mouse.y) * L

    // Rotación: gira sola, o apunta al proyecto en foco
    const focusIdx = hover >= 0 ? hover : target.focus
    if (target.focus >= 0 && featured[target.focus]) {
      const p = pts[featured[target.focus].i]
      let d = -Math.atan2(p.x, p.z) - rotY
      d = (((d + Math.PI) % TAU) + TAU) % TAU - Math.PI
      const k = 1 - Math.exp(-dt * 2.2)
      rotY += d * k
      rotX += (Math.atan2(p.y, Math.hypot(p.x, p.z)) - rotX) * k
    } else {
      rotY += dt * (reduced ? 0.02 : 0.07) + (1 - k1) * dt * 1.2
      rotX += (0 - rotX) * L * 0.5
    }

    group.position.set(cur.x, cur.y, 0)
    group.scale.setScalar(cur.scale * (0.6 + 0.4 * k1))
    group.rotation.set(rotX + mouse.y * 0.22, rotY + mouse.x * 0.35, 0)
    group.updateMatrixWorld()

    if (Math.abs(cur.opacity - lastOpacity) > 0.004) {
      canvas.style.opacity = cur.opacity.toFixed(3)
      lastOpacity = cur.opacity
    }

    // Paquetes
    const speed = reduced ? 0.3 : 1
    for (let k = 0; k < M; k++) {
      const p = packets[k]
      p.t += (p.sp * dt * speed) / p.e.len
      if (p.t >= 1) {
        const node = p.from === p.e.a ? p.e.b : p.e.a
        heat[node] = Math.min(1, heat[node] + 0.2)
        const opts = adj[node]
        p.e = opts[(rand() * opts.length) | 0]
        p.from = node
        p.t = 0
      }
      const A = pts[p.from], B = pts[p.from === p.e.a ? p.e.b : p.e.a]
      packPos[k * 3] = A.x + (B.x - A.x) * p.t
      packPos[k * 3 + 1] = A.y + (B.y - A.y) * p.t
      packPos[k * 3 + 2] = A.z + (B.z - A.z) * p.t
    }
    packGeo.attributes.position.needsUpdate = true

    // El cursor "enciende" los nodos cercanos y se conecta a ellos
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
    for (let k = 0; k < K; k++) {
      const o = k * 6, nd = near[k]
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

    const decay = Math.exp(-dt * 2.2)
    for (let i = 0; i < n; i++) {
      tmp.copy(C_NODE).lerp(C_HOT, heat[i])
      tmp.toArray(nodeCol, i * 3)
      heat[i] *= decay
    }
    for (let k = 0; k < edges.length; k++) {
      const e = edges[k]
      tmp.copy(C_EDGE).lerp(C_HOT, Math.min(1, heat[e.a] * 0.85)).toArray(edgeCol, k * 6)
      tmp.copy(C_EDGE).lerp(C_HOT, Math.min(1, heat[e.b] * 0.85)).toArray(edgeCol, k * 6 + 3)
    }
    nodeGeo.attributes.color.needsUpdate = true
    edgeGeo.attributes.color.needsUpdate = true

    nodeMat.opacity = k1
    edgeMat.opacity = 0.8 * k2
    packMat.opacity = k3
    featMat.opacity = k3

    // Halo pulsante sobre el proyecto en foco
    if (focusIdx >= 0 && featured[focusIdx]) {
      halo.position.copy(pts[featured[focusIdx].i])
      halo.scale.setScalar(0.9 + 0.25 * Math.sin(t * 3))
      halo.material.opacity += (0.9 - halo.material.opacity) * L
    } else {
      halo.material.opacity += (0 - halo.material.opacity) * L
    }

    // Etiquetas
    for (let k = 0; k < featured.length; k++) {
      v.copy(pts[featured[k].i]).applyMatrix4(group.matrixWorld)
      const facing = Math.min(Math.max((v.z + 1.2) / 1.6, 0), 1)
      v.project(camera)
      const el = labels[k]
      const w = el._w || (el._w = el.offsetWidth) || 120
      const x = Math.min(((v.x + 1) / 2) * W + 14, W - w - 12)
      // Se desvanecen si se acercan al texto de la portada
      const clear = Math.min(Math.max((x - target.labelsMinX) / 80, 0), 1)
      const a = cur.labels * k3 * (0.35 + 0.65 * facing) * clear
      el.style.visibility = a < 0.06 ? "hidden" : "visible"
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${(((1 - v.y) / 2) * H - 15).toFixed(1)}px, 0)`
      el.style.opacity = a.toFixed(3)
      el.style.pointerEvents = a > 0.4 ? "auto" : "none"
    }

    renderer.render(scene, camera)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)

  return {
    mobile,
    set(partial) { Object.assign(target, partial) },
    burst,
    // Inclinación desde el giroscopio del celular (-1 a 1 en cada eje)
    tilt(x, y) { mouse.tx = x; mouse.ty = y },
    // Nodo visible más cercano a un punto de la pantalla
    nearest(x, y) {
      let best = null
      for (let i = 0; i < n; i++) {
        w.copy(pts[i]).applyMatrix4(group.matrixWorld)
        if (w.z < 0) continue
        w.project(camera)
        const sx = ((w.x + 1) / 2) * W, sy = ((1 - w.y) / 2) * H
        const d = (sx - x) ** 2 + (sy - y) ** 2
        if (!best || d < best.d) best = { i, x: sx, y: sy, d }
      }
      return best
    }
  }
}
