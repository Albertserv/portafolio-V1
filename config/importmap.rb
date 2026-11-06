# Pin npm packages by running ./bin/importmap

pin "application"
pin_all_from "app/javascript/portfolio", under: "portfolio"

pin "three", to: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
pin "gsap", to: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js"
pin "gsap/ScrollTrigger", to: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js"
pin "lenis", to: "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs"
