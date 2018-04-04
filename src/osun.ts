/**
 * CSSProperties are shamelessly stolen from typestyle.
 */
import {CSSProperties} from './types'
export {CSSProperties}

/**
 * A pseudo-random functino that returns a bit enough integer
 * that will be converted to a base64 class name.
 */
const rnd = () => Math.round(Math.random() * 10000000000000000)

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


/**
 * Emit a rule to the sheet. This function is not meant to be called directly,
 * but rather through the whole selector mechanic.
 */
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
export function cls(name: string, ...props_or_classes: (CSSProperties | string)[]): string {
  const generated = (rnd()).toString(36).replace('.', '')
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
      this.parts = [parts.replace(/(^|(?:\s))_/g, s => '._')]
    } else {
      this.parts = parts
    }
  }

  childOf(another: Selector | string, ...props: CSSProperties[]) {
    return mapAll(s(another), this, (a, b) => `${a} > ${b}`).define(...props)
  }

  in(another: Selector | string, ...props: CSSProperties[]): Selector {
    return mapAll(s(another), this, (a, b) => `${a} ${b}`).define(...props)
  }

  siblingOf(another: Selector | string, ...props: CSSProperties[]): Selector {
    return mapAll(s(another), this, (a, b) => `${a} ~ ${b}`).define(...props)
  }

  after(another: Selector | string, ...props: CSSProperties[]): Selector {
    return mapAll(s(another), this, (a, b) => `${a} + ${b}`).define(...props)
  }

  children(fn: () => void) {
    combine(s => s.childOf(this), fn)
  }

  descendants(fn: () => void) {
    combine(s => s.in(this), fn)
  }

  and(class_name: string, ...props: CSSProperties[]): Selector {
    class_name = class_name.trim()
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

export const selector = s


/**
 * Declare keyframes and return a mangled unique name to be used as
 * the "animation-name" css property.
 *
 * @param name: A name to be included in the resulting name for readability
 * @param keyframes: An object with keys such as "from", "to", "10%", ... and
 *  values as CSS properties.
 * @returns a mangled name
 */
export function keyframes(name: string, keyframes: {[name: string]: CSSProperties}) {
  name = cls(name)

  sheet.push(`@keyframes ${name} {`)
  for (var prop in keyframes) {
    rule(prop, keyframes[prop])
  }
  sheet.push(`}`)

  return name
}


/**
 * A dumb media query, will include the contents of `query` right
 * after `@media`
 *
 * @param query: will be included after @media and before {
 * @param declarations: a function in which to declare selectors and
 *  their rules.
 */
export function media(query: string, declarations: () => void) {
  sheet.push(`@media ${query} {`)
  declarations()
  sheet.push(`}`)
}


/**
 *
 */
export function page(further_spec: string, declarations: () => void) {
  sheet.push(`@page ${further_spec} {`)
  declarations()
  sheet.push('}')
}


/**
 * Append the following css to the next style node without processing.
 */
export function raw(css: string) {
  sheet.push(css)
}
