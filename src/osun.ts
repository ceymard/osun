/**
 * CSSProperties are shamelessly stolen from typestyle.
 */
// import {CSSProperties} from './types'
import * as CSS from 'csstype'
export type CSSProperties = CSS.PropertiesFallback


var sheet: string[] = []
var raf_value: number | null = null


/**
 * Create a new style node with the currently defined styles.
 */
function createStyleNode() {
  if (sheet.length === 0) return
  conclude()
  if (typeof window !== 'undefined') {
    var s = document.createElement('style')
    s.setAttribute('data-style', clsname('typecss'))
    s.textContent = getCurrentStyles()
    document.head.appendChild(s)
    raf_value = null
  } else {
    // we're in node.js
    console.log(getCurrentStyles())
  }
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

export function rule(arr: string[], ...values: (CssClass | string)[]): (...props: (CSSProperties | CssClass)[]) => void;
export function rule(arr: TemplateStringsArray, ...values: (CssClass | string)[]): (...props: (CSSProperties | CssClass)[]) => void;
export function rule(arr: any, ...values: (CssClass | string)[]) {

  // build the array with all the possibilities.
  const choices = [] as string[][]
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) choices.push([arr[i]])
    if (values[i]) {
      var val = values[i]
      var current_selector = typeof val === 'string' ? val : val.selector()
      var possibilites = current_selector.split(/,/g).map(s => s.trim()).filter(s => !!s)
      choices.push(possibilites)
    }
  }

  const selectors = [] as string[]
  function cartesian(arr: string[], idx: number) {
    var len = choices[idx].length;
    for (var i = 0; i < len; i++) {
      var a = arr.slice(0) // clone it
      a.push(choices[idx][i])
      if (idx === choices.length - 1)
        selectors.push(a.join(''))
      else
        cartesian(a, idx + 1)
    }
  }
  cartesian([], 0)

  const sel = selectors.join(',')

  function export_props(p: CSSProperties) {
    for (var i = 0, props = Object.keys(p), l = props.length; i < l; i++) {
      var pname = props[i]
      const values = (p as any)[pname]
      for (var value of Array.isArray(values) ? values : [values]) {
        const n = pname.replace(re_prop, p => '-' + p.toLowerCase())
        sheet.push(`${n}:${value.toString()};`)
      }
    }
  }

  return function (...props: (CSSProperties | CssClass)[]) {
    conclude()
    _last_selector = sel
    sheet.push(`${sel}{`) // will be closed by conclude()
    for (var p of props) {
      if (p instanceof CssClass) {
        // console.log(p)
        for (var p2 of p.all_props) export_props(p2)
      } else
        export_props(p)
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
const perf_hooks = 'perf_hooks'
const now = typeof window !== 'undefined' ? () => performance.now() : require(perf_hooks).performance.now
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
export function style(name: string, ...props_or_classes: (CssClass | CSSProperties | string)[]): CssClass & string {
  var name = clsname(name)
  var names = [name] as string[]
  // we only track the props that we *need* to define here
  var props: CSSProperties[] = []
  var parents: CssClass[] = []

  for (var component of props_or_classes) {
    if (typeof component === 'string') {
      names.push(component)
    } else if (component instanceof CssClass) {
      names = [...names, ...component.names]
      parents.push(component)
    } else {
      props.push(component)
    }
  }

  // Now, push the properties onto the first classname
  if (props.length > 0) {
    var n = `.${name}`
    rule`${n}`(...props)
  }
  return new CssClass(names, props, parents) as CssClass & string
}


export class CssClass {

  constructor(
    public names: string[],
    public props: CSSProperties[],
    public parents: CssClass[] = []
  ) {

  }

  get all_props(): CSSProperties[] { return [...this.props, ...this.parents.reduce((acc, item) => (acc.push(...item.all_props), acc), [] as CSSProperties[])] }
  get length() { return this.toString().length }

  selector() { return `.${this.names[0]}` }

  toString() { return this.names.join(' ') }
  valueOf() {
    return this.toString()
  }

}


function scoped(str: string, fn: () => void) {
  conclude()
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
    for (var i = 0, props = Object.keys(keyframes), l = props.length; i < l; i++) {
      var prop = props[i]
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


export function CssNamespace<T>(t: T, rulefn?: (t: T) => void): T {
  if (rulefn) rulefn(t)
  return t
}