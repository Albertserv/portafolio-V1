// Coloreado de sintaxis mínimo para los fragmentos de código de la lupa (JS, Ruby y Python).

const KEYWORDS = {
  js: "async await const let var function return if else for of in new export import from default class extends try catch throw null true false undefined this typeof module",
  ruby: "def end class module if elsif else unless return do yield self nil true false and or not raise begin rescue ensure then while until case when in super has_many belongs_to",
  python: "def async await return if elif else for in while class import from as with try except raise None True False and or not is lambda pass"
}

const COMMENT = { js: String.raw`\/\/[^\n]*`, ruby: String.raw`#[^\n]*`, python: String.raw`#[^\n]*` }
const STRING = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|` + "`[^`]*`"
const NUMBER = String.raw`\b\d[\d_]*(?:\.\d+)?\b`
const SYMBOL = String.raw`:[A-Za-z_]\w*|\b[A-Za-z_]\w*:(?!:)`
const WORD = String.raw`@?[A-Za-z_$][\w$]*[?!]?`

const escape = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c])
const span = (cls, text) => `<span class="${cls}">${escape(text)}</span>`

export function highlight(code, lang = "js") {
  const keywords = new Set((KEYWORDS[lang] || KEYWORDS.js).split(" "))
  const re = new RegExp(`(${COMMENT[lang] || COMMENT.js})|(${STRING})|(${NUMBER})|(${SYMBOL})|(${WORD})`, "g")
  let out = "", last = 0, m

  while ((m = re.exec(code))) {
    out += escape(code.slice(last, m.index))
    const [text, comment, string, number, symbol, word] = m
    if (comment) out += span("c-com", text)
    else if (string) out += span("c-str", text)
    else if (number) out += span("c-num", text)
    else if (symbol) out += span("c-sym", text)
    else if (word && keywords.has(word)) out += span("c-kw", text)
    else if (word && /^\s*\(/.test(code.slice(re.lastIndex))) out += span("c-fn", text)
    else if (word && /^[A-Z]/.test(word)) out += span("c-type", text)
    else out += escape(text)
    last = re.lastIndex
  }
  return out + escape(code.slice(last))
}

export function highlightAll(root = document) {
  root.querySelectorAll("code[data-lang]").forEach((el) => {
    el.innerHTML = highlight(el.textContent, el.dataset.lang)
  })
}
