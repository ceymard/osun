import * as CSS from "csstype"
export type CSSProperties = CSS.PropertiesFallback

declare module "csstype" {
  interface StandardShorthandProperties {
    [s: `--${string}`]: string | undefined
  }
}

const crc_table = (function() {
  var t = new Uint32Array(256)
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1)
      } else {
        c = c >>> 1
      }
    }
    t[i] = c
  }
  return t
})()


/** A very simple CRC-32 function to not emit the same classes into css */
function crc32(str: string) {
  var crc = 0xffffffff

  for (var i = 0; i < str.length; i++) {
    var byte = str.charCodeAt(i) & 0xff
    crc = crc_table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff)
}


/**
 * Create a new style node with the currently defined styles.
 */
// function createStyleNode() {
//   if (sheet.length === 0) return
//   conclude()
//   if (typeof window !== "undefined") {
//     var s = document.createElement("style")
//     s.setAttribute("data-style", clsname("typecss"))
//     s.textContent = getCurrentStyles()
//     document.head.appendChild(s)
//     raf_value = null
//   } else {
//     // we're in node.js
//     console.log(getCurrentStyles())
//   }
// }

// used to replace property names
const re_prop = /([A-Z]|^([wW]ebkit|[mM]oz|[mM]s))/g

const can_adopt_style_sheets =
  window.ShadowRoot &&
  'adoptedStyleSheets' in window.Document.prototype &&
  'replace' in window.CSSStyleSheet.prototype;

/**
 * Holds the declarations of a stylesheet, can be collected
 */
export class OsunSheet {
  bits: string[] = []

  /** an internal set to make sure we do not emit a class several times */
  emitted = new Set<number>()

  /** Gets a CSSStyleSheet or a string depending on whether the browser supports instanciating new CSSStyleSheet */
  get sheet() { return null }

  collectAsStylesheet() {
    const css_text = this.bits.join("")
    this.bits.length = 0

    // This only works for iOS >= 16.4, Chrome and Firefox support it already
    const css = new CSSStyleSheet()
    css.replace(css_text)
    return css
  }

  collectAsStyle() {
    const style = document.createElement("style")
    style.textContent = this.bits.join("")
    this.bits.length = 0
    return style
  }

  write(str: string) {
    this.bits.push(str)
  }

  formatProps(props: CSSProperties) {
    const res: string[] = []
    for (let pname in props) {
      const values = props[pname as keyof CSSProperties]
      for (let value of Array.isArray(values) ? values : [values]) {
        const n = pname.replace(re_prop, p => "-" + p.toLowerCase())
        this.write(`${n}:${value!.toString()};`)
      }
    }
    return res.join("")
  }

  emitClass(c: CssClass) {
    // This is where we check that a class was not already emitted
    const formatted = this.formatProps(c.props)
    if (c.name == null) {
      // anonymous class !
      const crcfrm = crc32(formatted)
      if (this.emitted.has(crcfrm)) return

    }
    const toemit = `${c.selector}{${formatted}}`
    const crc = crc32(toemit)
    if (!this.emitted.has(crc)) {
      this.write(toemit)
    }
  }

  /**
   * Generate a unique class name and declare its properties as rules if
   * they were provided. The result is meant to be used to put in `class`
   * attributes (or `className` if using React).
   *
   * The result will generally contain the name of the class that was generated
   * as well as the names of other classes if they were included.
   *
   * @param name: the basis for the name, which will be included in the
   *    result.
   * @param props_or_classes: either objects that are CSSProperties or other class names
   *    that can possibly have been generated previously using cls()
   * @returns a string usable in `class` / `className`
   */
  style(base: string, ...components: (CssClass | CSSProperties)[]): CssClass {
    const props: CSSProperties = {}
    for (let comp of components) {
      Object.assign(comp instanceof CssClass ? comp.props : comp)
    }
    const res = new CssClass(this, base, props)
    this.write(res.selector + "{")
    this.formatProps(props)
    this.write("}")
    return res
  }

  nested(selector: string, decls: (sh: OsunSheet) => void) {
    this.write(selector)
    this.write("{")
    decls(this)
    this.write("}")
  }

  /**
   *
   * @param selector
   * @param components
   * @returns
   */
  rule(selector: TemplateStringsArray, ...components: (CssClass | string)[]) {
    // Build the selector, where
    let sparts: string[] = []
    for (let i = 0, l = selector.length; i < l; i++) {
      sparts.push(selector[i])
      const comp = components[i]
      if (comp != null) {
        if (typeof comp === "string") {
          sparts.push(comp)
        } else {
          sparts.push(comp.selector)
        }
      }
    }

    return (...props: (CSSProperties | CssClass)[]) => {
      this.write(sparts.join(""))
      this.write("{")
      for (let p of props) {
        this.write(
          this.formatProps(p instanceof CssClass ? p.props : p)
        )
      }
      this.write("}")
    }
  }

  /**
   *
   * @param tpl
   * @param values
   */
  raw(tpl: TemplateStringsArray, ...values: any[]): this
  raw(css: string): this
  raw(css: string | TemplateStringsArray, ...values: any[]) {
    if (Array.isArray(css)) {
      let parts: string[] = []
      for (let i = 0, l = css.length; i < l; i++) {
        parts.push(css[i])
        const val = values[i]
        if (val != null) {
          if (typeof val === "string") {
            parts.push(val)
          } else if (parts instanceof CssClass) {
            parts.push(val.selector())
          } else {
            // Add builder as values ?
          }
        }
      }
    }

    return this
  }

}

const floor = Math.floor
declare var perf_hooks: any
const now = typeof window !== "undefined" ? () => performance.now() : perf_hooks.performance.now as () => number
const start = floor(now() * 1000)
const raf = typeof window !== "undefined" ? window.requestAnimationFrame : setTimeout
/**
 * Generate a unique class name from a base
 */
export function clsname(name: string) {
  return `_${name}-${floor(now() * 1000) - start}`
}


/**
 * A css class that mimicks strings but allows for a little more composability.
 */
export class CssClass {

  constructor(
    public sheet: OsunSheet,
    public name: string,
    public props: CSSProperties,
    public specificity = 1
  ) {

  }

  get length() { return this.toString().length }

  part(part_name: string, ...props: (CssClass | CSSProperties)[]) {
    this.sheet.rule`${this}::part(${part_name})`(
      ...props
    )
    return this
  }

  hover(...props: (CssClass | CSSProperties)[]) {
    this.sheet.rule`${this}:hover`(
      ...props
    )
    return this
  }

  get selector() {
    const sel = `.${this.name}`
    return this.specificity === 1 ? sel : new Array(this.specificity).fill(sel).join("") }

  toString() {
    return this.name
  }

  valueOf() {
    return this.toString()
  }

}
