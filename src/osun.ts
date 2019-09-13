/**
 * CSSProperties are shamelessly stolen from typestyle.
 */
// import {CSSProperties} from './types'
import * as CSS from 'csstype'
export type CSSProperties = CSS.PropertiesFallback

export class BaseBuilder {
  path: string[] = []
  props: CSSProperties[] = []

  /**
   * Builder can be used as a class too !
   */
  className() {
    const name = this.path.join('-')
    rule`.${name}`(...this.props)
    return name
  }

}

export type ChangeReturnType<F extends Function, NewR> = F extends (...a: infer A) => any ? (...a: A) => NewR : never

export type Builder<T> = BaseBuilder
  & {[K in keyof T]:
      T[K] extends Function ?
        ChangeReturnType<T[K], Builder<T>>
        : Builder<T>
    }

export function MakeBuilder<T>(props: {[name in keyof T]: CSSProperties | ((this: CssClass, ...a: any[]) => CSSProperties)}): Builder<T> {
  return null!
}

export type CssBuild = CSSProperties | Builder<{}>


var sheet: string[] = []
var raf_value: number | null = null


/**
 * Create a new style node with the currently defined styles.
 */
function createStyleNode() {
  if (sheet.length === 0) return
  var s = document.createElement('style')
  s.setAttribute('data-style', clsname('typecss'))
  s.textContent = getCurrentStyles()
  document.head.appendChild(s)
  raf_value = null
}


/**
 * Get the styles currently defined and reset them
 */
function getCurrentStyles() {
  var res = sheet.join('')
  sheet = []
  return res
}

/**
 *
 */
function conclude() {
  if (_last_selector) {
    sheet.push('}')
  }
  _last_selector = ''
}

const re_prop = /([A-Z]|^([wW]ebkit|[mM]oz|[mM]s))/g


var _last_selector = ''
export function rule(arr: TemplateStringsArray, ...values: (CssClass | string)[]) {
  const sel = arr.map((str, i) => `${str}${values[i] ? values[i].toString() : ''}`).join('')

  if (!_last_selector || _last_selector !== sel) {
    conclude()
    _last_selector = sel
  }

  return function (...props: CSSProperties[]) {
    sheet.push(`${sel}{`) // will be closed by conclude()
    for (var p of props) {
      for (var pname in p) {
        const values = (p as any)[pname]
        for (var value of Array.isArray(values) ? values : [values]) {
          const n = pname.replace(re_prop, p => '-' + p.toLowerCase())
          sheet.push(`${n}:${value.toString()};`)
        }
      }
    }

    if (raf_value === null) {
      raf_value = raf(() => {
        createStyleNode()
        raf_value = null
      })
    }
  }
}


const floor = Math.floor
declare var require: (s: 'perf_hooks') => {performance: typeof window.performance}
const now = typeof window !== 'undefined' ? performance.now : require('perf_hooks').performance.now
const start = floor(now() * 1000)
const raf = typeof window !== 'undefined' ? window.requestAnimationFrame : setTimeout
/**
 * Generate a unique class name from a base
 */
export function clsname(name: string) {
  return `_${name}-${floor(now() * 1000) - start}`
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
export function cls(name: string, ...props_or_classes: (CssClass | CSSProperties | string | Builder<{}>)[]): CssClass {
  var names = [clsname(name)]
  var props: CSSProperties[] = []

  for (var component of props_or_classes) {
    if (typeof component === 'string') {
      // This is a CSS class
      names.push(component)
    } else if (component instanceof CssClass) {
      names = [...names, ...component.classes]
    } else if (component instanceof BaseBuilder) {
      props = [...props, ...component.props]
    } else {
      props.push(component)
    }
  }

  // Now, push the properties onto the first classname
  rule`.${names[0]}`(...props)
  return new CssClass(names)
}


export class CssClass {

  constructor(public classes: string[]) {

  }

  className() { return this.classes }
  toString() { return this.classes.map(c => `.${c}`).join('') }

  first(...props: CSSProperties[]) {
    rule`${this}:first-child`(...props)
    return this
  }

  firstIn(...props: CssBuild[]) {
    return this
  }

  last(...props: CssBuild[]) {
    return this
  }

  nth(n: string | number, ...props: CssBuild[]) {
    return this
  }

  nthIn(n: string | number, ...props: CssBuild[]) {

    return this
  }

  firstChild(...props: CssBuild[]): this {
    return this
  }

  lastChild(...props: CssBuild[]): this {
    return this
  }

  hover(...props: CssBuild[]): this {
    return this
  }

  and(other: string | CssClass, ...props: CssBuild[]): this {
    return this
  }

  placeholder(...props: CssBuild[]) {
    return this
  }

}


function scoped(str: string, fn: () => void) {
  sheet.push(`${str} {`)
  fn()
  conclude()
  sheet.push('}')
}


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
  name = clsname(name)

  scoped(`@keyframes ${name}`, () => {
    for (var prop in keyframes) {
      rule`${prop}`(keyframes[prop])
    }
  })

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
  scoped(`@media ${query}`, declarations)
}


/**
 *
 */
export function page(further_spec: string, declarations: () => void) {
  scoped(`@page ${further_spec}`, declarations)
}


/**
 * Append the following css to the next style node without processing.
 */
export function raw(css: string) {
  conclude()
  sheet.push(css)
}


cls('toto', {
  borderTop: '15em'
}).first({
  borderTop: 0
})
cls('zobi', {
  marginRight: '3em'
})

conclude()
console.log(getCurrentStyles())

// import * as _h from './helpers'
// export const helpers = _h