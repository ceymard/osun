/**
 * CSSProperties are shamelessly stolen from typestyle.
 */
// import {CSSProperties} from './types'
import * as CSS from 'csstype'
export type CSSProperties = CSS.PropertiesFallback


export type ChangeReturnType<F extends Function, NewR> = F extends (...a: infer A) => any ? (...a: A) => NewR : never

export type Builder<T> = string & CssClass
  & {[K in keyof T]:
      T[K] extends Function ?
        ChangeReturnType<T[K], Builder<T>>
        : Builder<T>
    }

export function MakeBuilder<T extends {[name: string]: CSSProperties | ((this: CssClass, ...args: any[]) => CSSProperties | undefined)}>(base: string, obj: T): Builder<T> {
  class BuilderCssClass extends CssClass { }

  const proto = BuilderCssClass.prototype

  var cache = {} as {[name: string]: {props: CSSProperties, name: string}}

  for (let key in obj) {
    let value = obj[key]
    if (typeof value === 'function') {
      Object.defineProperty(proto, key, {
        get() {
          return function (this: BuilderCssClass) {
            var args = Array.from(arguments)
            var realkey = key + '_' + args.join('_')
            var cached = cache[realkey]
            if (!cached) {
              var name = clsname(base + '_' + realkey)
              var res = new BuilderCssClass([...this.names, name], [...this.props])
              var props = (value as Function).apply(res, args)
              if (props) {
                rule`${'.' + name}`(props)
                res.props.push(props)
              }
              cached = cache[realkey] = {name, props}
              return res
            }
            return new BuilderCssClass([...this.names, cached.name], [...this.props, cached.props])
          }
        }
      })
    } else {
      Object.defineProperty(proto, key, {
        get(this: BuilderCssClass) {
          var cached = cache[key]
          if (!cached) {
            var name = clsname(base + '_' + key)
            rule`${'.' + name}`(value as CSSProperties)
            cached = cache[key] = {name, props: value as CSSProperties}
          }

          return new BuilderCssClass([...this.names, cached.name], [...this.props, cached.props])
        }
      })
    }
  }
  return new BuilderCssClass([], []) as Builder<T>
}

export type CssBuild = CSSProperties | Builder<{}>


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
    for (var pname in p) {
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
      if (p instanceof CssClass)
        for (var p2 of p.props) export_props(p2)
      else
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
export function cls(name: string, ...props_or_classes: (CssClass | CSSProperties | string)[]): CssClass & string {
  var name = clsname(name)
  var names = [name] as string[]
  var props: CSSProperties[] = []

  for (var component of props_or_classes) {
    if (typeof component === 'string') {
      names.push(component)
    } else if (component instanceof CssClass) {
      names = [...names, ...component.names]
    } else {
      props.push(component)
    }
  }

  // Now, push the properties onto the first classname
  if (props.length > 0) {
    var n = `.${name}`
    rule`${n}`(...props)
  }
  return new CssClass(names, props) as CssClass & string
}


export class CssClass {

  constructor(
    public names: string[],
    public props: CSSProperties[]
  ) {

  }

  get length() { return this.toString().length }

  selector() { return `.${this.names[0]}` }

  last() { return this.names[this.names.length - 1] }

  toString() { return this.names.join(' ') }
  valueOf() {
    return this.toString()
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
