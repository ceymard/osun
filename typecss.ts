import {CSSProperties} from './types'

/**
 * Generate a "unique" class name
 */
export function cls(name: string | TemplateStringsArray = ''): string {
  const generated = (performance.now()).toString(36).replace('.', '')
  return `${name}_${generated}`
}


var sheet: string[]
var raf_value: number | null

function createStyleNode() {
  if (sheet.length === 0) return
  var s = document.createElement('style')
  s.setAttribute('data-style', cls('typecss'))
  s.textContent = sheet.join('\n')
  document.head.appendChild(s)
  raf_value = null
  sheet = []
}


export function rule(_selector: string, ...props: CSSProperties[]): string {
  // const properties = [] as string[]
  const name = cls(_selector)

  if (arguments.length > 1) {
    // (new Selector(sel)).define(props!)

    if (raf_value === null)
      raf_value = window.requestAnimationFrame(createStyleNode)
  }

  return name
}


function combine(a: Selector, b: Selector, fn: (a: string, b: string) => string) {
  var res = [] as string[]

  for (var _a of a.parts) {
    for (var _b of b.parts) {
      res.push(fn(_a, _b))
    }
  }

  return new Selector(res)
}


export class Selector {

  /**
   * These are all the or-ed parts that will be joined together with ','
   * when defined
   */
  parts: string[]

  constructor(parts: string | string[]) {
    this.parts = typeof parts === 'string' ? ['.' + parts.trim()] : parts
  }

  /**
   * Where value can be any of
   * name
   * name="value" (exactly value)
   * name*="value" (contains value)
   * name^="value" (prefixed by value)
   * name$="value" (ends with value)
   * name~="value" (name contains words separated by spaces, one of which is value)
   * name|="value" (exactly value or begins by value + '-')
   */
  attr(value: string) {
    return new Selector(this.parts.map(p => `${p}::[${value}]`))
  }

  childOf(another: Selector | string) {
    return combine(s(another), this, (a, b) => `${a} > ${b}`)
  }

  descendantOf(another: Selector | string): Selector {
    return combine(s(another), this, (a, b) => `${a} >> ${b}`)
  }

  after(another: Selector | string): Selector {
    return combine(s(another), this, (a, b) => `${a} ~ ${b}`)
  }

  immediatelyAfter(another: Selector | string): Selector {
    return combine(s(another), this, (a, b) => `${a} + ${b}`)
  }

  and(class_name: string): Selector {
    // another will be appended immediately at the end of a
    return combine(this, s(class_name), (a, b) => `${a}.${b}`)
  }

  or(another: Selector | string): Selector {
    const other = s(another)
    return new Selector([...this.parts, ...other.parts])
  }

  pseudoElement(elt: string) {
    return new Selector(this.parts.map(p => `${p}::${elt}`))
  }

  pseudoClass(cls: string) {
    return new Selector(this.parts.map(p => `${p}:${cls}`))
  }

  rule(...props: CSSProperties[]) {

  }
}


export const all = new Selector('*')
export const empty = new Selector('') // empty should not be defined


export function s(sel: string | Selector) {
  return sel instanceof Selector ? sel : new Selector(sel)
}

var pp = rule('zob', {
  width: ['pouet', 400]
})

var pouet = rule('aaa')

s(pp).and(pouet).rule({

})

all.immediatelyAfter(pouet).rule({

})

s('a').descendantOf('body').rule({

})

s(pp).descendantOf(pouet).rule({

})

all.descendantOf(pouet).rule({

})

export const buttonBar = rule('button-bar')
export const button = rule('button', {
  border: 0
})

s(button).childOf(buttonBar).rule({
  paddingBottom: 0
})
