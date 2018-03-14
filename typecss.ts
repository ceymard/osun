import {CSSProperties} from './types'

const time = typeof performance !== 'undefined' ? () => performance.now()
  : () => {
    var t = process.hrtime()
    return t[0] * 1000000 + t[1] + Date.now()
  }

var sheet: string[] = []
var raf_value: number | null = null

function createStyleNode() {
  if (sheet.length === 0) return
  var s = document.createElement('style')
  s.setAttribute('data-style', cls('typecss'))
  s.textContent = getStyles()
  document.head.appendChild(s)
  raf_value = null
}


function getStyles() {
  var res = sheet.join('')
  sheet = []
  return res
}


const re_prop = /([A-Z]|^(webkit|moz|ms))/g


export function rule(_selector: string, ...props: CSSProperties[]): void {
  // const properties = [] as string[]

  if (props.length === 0) return

  if (arguments.length > 1) {
    // (new Selector(sel)).define(props!)
    sheet.push(_selector + '{')

    for (var p of props) {
      for (var pname in p) {
        const values = (p as any)[pname]
        for (var value of Array.isArray(values) ? values : [values]) {
          const n = pname.replace(re_prop, p => '-' + p.toLowerCase())
          sheet.push(`${n}:${value.toString()};`)
        }
      }
    }

    sheet.push('}')

    if (raf_value === null && typeof window !== 'undefined')
      raf_value = window.requestAnimationFrame(createStyleNode)
  }
}


/**
 * Generate a "unique" class name
 */
export function cls(name: string, ...props_or_classes: (CSSProperties | string)[]): string {
  const generated = (time()).toString(36).replace('.', '')
  const res = `_${name}_${generated}`
  var all = res


  const props: CSSProperties[] = []
  for (var p of props_or_classes) {
    if (typeof p === 'string')
      all += ' ' + p // add class names to the result
    else
      props.push(p)
  }

  rule('.' + res, ...props)
  return all
}


function mapAll(a: Selector, b: Selector, fn: (a: string, b: string) => string) {
  var res = [] as string[]

  for (var _a of a.parts) {
    for (var _b of b.parts) {
      res.push(fn(_a, _b))
    }
  }

  return new Selector(res)
}


const combinators = [] as ((s: Selector) => Selector)[]
export function combine(combinator: (s: Selector) => Selector, fn: () => void) {
  combinators.push(combinator)
  fn()
  combinators.pop()
}


export class Selector {

  static combinators: ((this: Selector, another: Selector | string) => Selector)[]

  /**
   * These are all the or-ed parts that will be joined together with '|'
   * when defined
   */
  parts: string[]

  constructor(parts: string | string[]) {
    if (typeof parts === 'string') {
      parts = parts.trim()
      this.parts = [parts.replace(/\b\s*_/g, s => '._')]
    } else {
      this.parts = parts
    }
  }

  childOf(another: Selector | string, ...props: CSSProperties[]) {
    return mapAll(s(another), this, (a, b) => `${a} > ${b}`).define(...props)
  }

  in(another: Selector | string, ...props: CSSProperties[]): Selector {
    return mapAll(s(another), this, (a, b) => `${a} >> ${b}`).define(...props)
  }

  siblingOf(another: Selector | string, ...props: CSSProperties[]): Selector {
    return mapAll(s(another), this, (a, b) => `${a} ~ ${b}`).define(...props)
  }

  after(another: Selector | string, ...props: CSSProperties[]): Selector {
    return mapAll(s(another), this, (a, b) => `${a} + ${b}`).define(...props)
  }

  combine(combinator: (this: Selector, another: Selector | string) => Selector, fn: () => void) {
    fn()
  }

  and(class_name: string, ...props: CSSProperties[]): Selector {
    if (class_name[0] !== '.') class_name = '.' + class_name
    // another will be appended immediately at the end of a
    return mapAll(this, s(class_name), (a, b) => `${a}${b}`).define(...props)
  }

  or(another: Selector | string, ...props: CSSProperties[]): Selector {
    const other = s(another)
    return (new Selector([...this.parts, ...other.parts])).define(...props)
  }

  append(str: string, ...props: CSSProperties[]) {
    return (new Selector(this.parts.map(p => `${p}${str}`))).define(...props)
  }

  define(...props: CSSProperties[]) {
    if (props.length > 0) {
      var sel: Selector = this
      // Compute the final selector if it had combinators
      for (var c of combinators) {
        sel = c(sel)
      }
      rule(sel.parts.join(', '), ...props)
    }
    return this
  }
}


export const all = new Selector('*')
export const empty = new Selector('') // empty should not be defined


/**
 * Create a selector from the provided string.
 * If the selector was already a selector, just return it.
 *
 * If the selector contains one or more classes (that start with _), only
 * the first one is kept.
 *
 * This function also accepts TemplateStringArrays, which means it can be called
 * as s`h1` or s`path` to make element selectors apparent.
 */
export function s(sel: string | Selector | TemplateStringsArray, ...props: CSSProperties[]) {
  if (!(sel instanceof Selector)) {
    var st: string = Array.isArray(sel) ? sel[0].split(/\s*,\s*/g) : (sel as string).split(' ')[0]
    sel = new Selector(st)
  }

  if (props.length > 0) {
    sel.define(...props)
  }

  return sel
}


export function keyframes(name: string, keyframes: {[name: string]: CSSProperties}) {
  name = cls(name)

  sheet.push(`@keyframes ${name} {`)
  for (var prop in keyframes) {
    rule(prop, keyframes[prop])
  }
  sheet.push(`}`)

  return name
}


export function media(query: string, fn: () => void) {
  sheet.push(`@media ${query} {`)
  fn()
  sheet.push(`}`)
}

export function raw(css: string) {
  sheet.push(css)
}
