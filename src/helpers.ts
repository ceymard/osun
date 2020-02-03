
import { PropertiesFallback, JustifyContentProperty, AlignContentProperty } from 'csstype'
import { clsname, rule, CssClass } from './osun'


//////////////// THE HELPERS

function px(px: string | number) {
  return typeof px === 'number' ? `${px}px` : px
}

export type CSSProperties = PropertiesFallback


/////////////////////////////////////////

const builder_cache = new WeakMap<any, {[key: string]: string}>()

export class Builder extends CssClass {

  protected _add(key: string, props: CSSProperties, cbk?: (cls: string) => void): this & string {
    const cons = this.constructor as {new(names: string[], props: CSSProperties[]): Builder}
    var name = this._cached(key, clsname => {
      rule`.${clsname}`(props)
      cbk?.(clsname)
    })
    return new cons([...this.names, name], [...this.props, props]) as unknown as this & string
  }

  protected _cached(key: string, cbk?: (cls: string) => void) {
    const cons = this.constructor as {new(names: string[], props: CSSProperties[]): Builder}
    key = key.replace(/\s+|\(|\)|\.|\-|<|>|,|~|\+|%|:|\[|\]|#/g, '-')

    // Try to get the
    var cache = builder_cache.get(cons)
    if (!cache) {
      cache = {}
      builder_cache.set(cons, cache)
    }

    var cached_name = cache[key]
    if (!cached_name) {
      cached_name = clsname(key)
      cache[key] = cached_name
      // creating the rule for real here.
      cbk?.(cached_name)
    }
    return cached_name
  }

  get text() { return new TextBuilder(this.names, this.props) }
  get flex() { return new FlexBuilder(this.names, this.props) }
  get box() { return new BoxBuilder(this.names, this.props) }

}


const _flexjust = (val: CSSProperties['justifyContent']) => { return { justifyContent: val } }
const _flexalign = (val: CSSProperties['alignItems']) => { return { alignItems: val } }

export class FlexBuilder extends Builder {
  get row() { return this._add('row', { display: 'flex', flexDirection: 'row' }) }
  get column() { return this._add('column', { display: 'flex', flexDirection: 'column' }) }
  get inline() { return this._add('inline', { display: 'inline-flex' }) }
  get wrap() { return this._add('wrap', { flexWrap: 'wrap' }) }
  get wrapReverse() { return this._add('wrapReverse', { flexWrap: 'wrap-reverse' }) }
  get justifyCenter() { return this._add('justifyCenter', _flexjust('center')) }
  get justifyStretch() { return this._add('justifyStretch', _flexjust('stretch')) }
  get justifyStart() { return this._add('justifyStart', _flexjust('flex-start')) }
  get justifyEnd() { return this._add('justifyEnd', _flexjust('flex-end')) }
  get justifyLeft() { return this._add('justifyLeft', _flexjust('left')) }
  get justifyRight() { return this._add('justifyRight', _flexjust('right')) }
  get justifySpaceBetween() { return this._add('justifySpaceBetween', _flexjust('space-between')) }
  get justifySpaceEvenly() { return this._add('justifySpaceEvenly', _flexjust('space-evenly')) }
  get justifySpaceAround() { return this._add('justifySpaceAround', _flexjust('space-around')) }
  get alignCenter() { return this._add('alignCenter', _flexalign('center')) }
  get alignStretch() { return this._add('alignStretch', _flexalign('stretch')) }
  get alignStart() { return this._add('alignStart', _flexalign('flex-start')) }
  get alignEnd() { return this._add('alignEnd', _flexalign('flex-end')) }
  get alignBaseline() { return this._add('alignBaseline', _flexalign('baseline')) }
  get alignFirstBaseline() { return this._add('alignFirstBaseline', _flexalign('first baseline')) }
  get alignLastBaseline() { return this._add('alignLastBaseline', _flexalign('last baseline')) }


  /// methods
  absoluteGrow(n: number) { return this._add('absolute-grow', { flexGrow: n, flexBasis: 0 }) }
  grow(n: number) { return this._add('grow', { flexGrow: n }) }
  justify(val: JustifyContentProperty) { return this._add(`justify-${val}`, {justifyContent: val}) }
  align(val: AlignContentProperty) { return this._add(`align-${val}`, {justifyContent: val}) }

  gappedRow(size: string | number) {
    return this._add(`gappedRow${size}`, {
      display: 'flex',
      flexDirection: 'row',
    }, clsname => {
      rule`.${clsname} > *`({
        marginLeft: px(size)
      })

      rule`.${clsname} > *:first-child`({
        marginLeft: 0
      })
    })
  }

  gappedColumn(size: string | number) {
    return this._add(`gappedColumn${size}`, {
      display: 'flex',
      flexDirection: 'column',
    }, clsname => {
      rule`.${clsname} > *`({
        marginTop: px(size)
      })

      rule`.${clsname} > *:first-child`({
        marginTop: 0
      })
    })
  }

  gapped(vertical: string | number, horizontal?: string | number) {
    var horiz = horizontal ?? vertical
    return this._add(`gapped-${vertical}-${horiz}`, {
      position: 'relative',
      top: px(-vertical),
      left: px(-horiz),
      marginBottom: px(-vertical),
      marginRight: px(-horiz),
    }, clsname => {
      rule`.${clsname} > *`({
        marginTop: px(vertical),
        marginLeft: px(horiz)
      })
    })
  }

}


export class TextBuilder extends Builder {

  get bold() { return this._add('bold', { fontWeight: 'bolder' } ) }
  get italic() { return this._add('italic', { fontStyle: 'italic' } ) }
  get underline() { return this._add('underline', { textDecoration: 'underline' } ) }
  get uppercase() { return this._add('uppercase', { textTransform: 'uppercase'} ) }
  get lowercase() { return this._add('lowercase', { textTransform: 'lowercase'} ) }
  get capitalize() { return this._add('capitalize', { textTransform: 'capitalize'} ) }
  get superscript() { return this._add('superscript', { verticalAlign: 'super'} ) }
  get subscript() { return this._add('subscript', { verticalAlign: 'sub'} ) }
  get centered() { return this._add('centered', { textAlign: 'center'} ) }
  get right() { return this._add('right', { textAlign: 'right'} ) }
  get justified() { return this._add('justified', { textAlign: 'justify'} ) }
  get alignMiddle() { return this._add('alignMiddle', { verticalAlign: 'middle'} ) }
  get preLine() { return this._add('preLine', { whiteSpace: 'pre-line' } ) }
  get pre() { return this._add('pre', { whiteSpace: 'pre' } ) }
  get preWrap() { return this._add('preWrap', { whiteSpace: 'pre-wrap' } ) }
  get nowrap() { return this._add('nowrap', { whiteSpace: 'nowrap' } ) }
  color(col: string) { return this._add(`color${col}`, { color: col }) }
  size(size: string) { return this._add(`size${size}`, { fontSize: size }) }

}


const _pos = (k: CSSProperties['position']) => { return { position: k } as CSSProperties }
const _curs = (s: string) => { return {cursor: s} as CSSProperties }


export class BoxBuilder extends Builder {

  background(bg: CSSProperties['background']) { return this._add(`background${bg}`, { background: bg }) }

  get positionAbsolute() { return this._add('positionAbsolute', _pos('absolute !important' as any)) }
  get positionRelative() { return this._add('positionRelative', _pos('relative !important' as any)) }
  get positionStatic() { return this._add('positionStatic', _pos('static !important' as any)) }
  get positionFixed() { return this._add('positionFixed', _pos('fixed !important' as any)) }
  get positionSticky() { return this._add('positionSticky', _pos(['-webkit-sticky', 'sticky'])) }
  top(n: string | number) { return this._add(`top${n}`, { top: px(n) }) }
  bottom(n: string | number) { return this._add(`bottom${n}`, { bottom: px(n) }) }
  left(n: string | number) { return this._add(`left${n}`, { left: px(n) }) }
  right(n: string | number) { return this._add(`right${n}`, { right: px(n) }) }

  get block() { return this._add(`block`, { display: 'block' }) }
  get inlineBlock() { return this._add(`inlineBlock`, { display: 'inline-block' }) }
  get displayNone() { return this._add(`displayNone`, { display: 'none' }) }
  get cursorPointer() { return this._add(`cursorPointer`, _curs('pointer')) }
  get cursorHelp() { return this._add(`cursorHelp`, _curs('help')) }
  get cursorMove() { return this._add(`cursorMove`, _curs('move')) }
  get cursorGrab() { return this._add(`cursorGrab`, _curs('grab')) }
  get cursorGrabbing() { return this._add(`cursorGrabbing`, _curs('grabbing')) }
  get cursorProgress() { return this._add(`cursorProgress`, _curs('progress')) }
  get cursorRowResize() { return this._add(`cursorRowResize`, _curs('row-resize')) }
  get cursorText() { return this._add(`cursorText`, _curs('text')) }
  get cursorZoomIn() { return this._add(`cursorZoomIn`, _curs('zoom-in')) }
  get cursorZoomOut() { return this._add(`cursorZoomOut`, _curs('zoom-out')) }
  get eventsNone() { return this._add(`eventsNone`, { pointerEvents: 'none' }) }
  get eventsAuto() { return this._add(`eventsAuto`, { pointerEvents: 'auto' }) }

  get overflowHidden() { return this._add(`overflow-hidden`, { overflow: 'hidden' }) }
  get overflowYScroll() { return this._add(`overflow-y-scroll`, { overflowY: 'scroll' })}
  get overflowXScroll() { return this._add(`overflow-y-scroll`, { overflowY: 'scroll' })}

  translateZ(n: number) { return this._add(`translate-z-${n}`, { transform: 'translateZ(0)' })}

  height(size: number | string) { return this._add(`height${size}`, { height: px(size) }) }
  width(size: number | string) { return this._add(`width${size}`, { width: px(size) }) }

  // Margins
  margin(size: string | number) { return this._add(`margin${size}`, { margin: px(size) }) }
  marginTop(size: string | number) { return this._add(`marginTop${size}`, { marginTop: px(size) }) }
  marginBottom(size: string | number) { return this._add(`marginBottom${size}`, { marginBottom: px(size) }) }
  marginLeft(size: string | number) { return this._add(`marginLeft${size}`, { marginLeft: px(size) }) }
  marginRight(size: string | number) { return this._add(`marginRight${size}`, { marginRight: px(size) }) }
  marginVertical(size: string | number) { return this._add(`marginVertical${size}`, { marginTop: px(size), marginLeft: px(size) }) }
  marginHorizontal(size: string | number) { return this._add(`marginHorizontal${size}`, { marginLeft: px(size), marginRight: px(size) }) }
  padding(size: string | number) { return this._add(`padding${size}`, { padding: px(size) }) }
  paddingSquashed(size: number) { return this._add(`paddingSquashed${size}`, { padding: `${size / 1.512}px ${size}px` }) }
  paddingTop(size: string | number) { return this._add(`paddingTop${size}`, { paddingTop: px(size) }) }
  paddingBottom(size: string | number) { return this._add(`paddingBottom${size}`, { paddingBottom: px(size) }) }
  paddingLeft(size: string | number) { return this._add(`paddingLeft${size}`, { paddingLeft: px(size) }) }
  paddingRight(size: string | number) { return this._add(`paddingRight${size}`, { paddingRight: px(size) }) }
  paddingVertical(size: string | number) { return this._add(`paddingVertical${size}`, { paddingTop: px(size), paddingLeft: px(size) }) }
  paddingHorizontal(size: string | number) { return this._add(`paddingHorizontal${size}`, { paddingLeft: px(size), paddingRight: px(size) }) }

  get marginNone() { return this._add(`marginNone`, { margin: '0' }) }
  get paddingNone() { return this._add(`paddingNone`, { padding: '0' }) }

  // Border
  borderTop(color: string, width: string = '1px', style: CSSProperties['borderTopStyle'] = 'solid') {
    return this._add(
      `bordertop-${color}-${width}-${style}`, { borderTopStyle: style, borderTopColor: color, borderTopWidth: width
  }) }
  borderBottom(color: string, width: string = '1px', style: CSSProperties['borderBottomStyle'] = 'solid') {
    return this._add(
      `borderbottom-${color}-${width}-${style}`, { borderBottomStyle: style, borderBottomColor: color, borderBottomWidth: width
  }) }
  borderLeft(color: string, width: string = '1px', style: CSSProperties['borderLeftStyle'] = 'solid') {
    return this._add(
      `borderleft-${color}-${width}-${style}`, { borderLeftStyle: style, borderLeftColor: color, borderLeftWidth: width
  }) }
  borderRight(color: string, width: string = '1px', style: CSSProperties['borderRightStyle'] = 'solid') {
    return this._add(
      `borderright-${color}-${width}-${style}`, { borderRightStyle: style, borderRightColor: color, borderRightWidth: width
  }) }
  borderVertical(color: string, width: string = '1px', style: CSSProperties['borderTopStyle'] = 'solid') { return this._add(
    `bordervertical-${color}-${width}-${style}`, {
    borderTopStyle: style,
    borderTopColor: color,
    borderTopWidth: width,
    borderBottomStyle: style,
    borderBottomColor: color,
    borderBottomWidth: width
  }) }
  borderHorizontal(color: string, width: string = '1px', style: CSSProperties['borderLeftStyle'] = 'solid') { return this._add(
    `borderhorizontal-${color}-${width}-${style}`, {
    borderLeftStyle: style,
    borderLeftColor: color,
    borderLeftWidth: width,
    borderRightStyle: style,
    borderRightColor: color,
    borderRightWidth: width
  }) }

  border(color: string, width: string = '1px', style: CSSProperties['borderStyle'] = 'solid') { return this._add(
    `border-${color}-${width}-${style}`,
    { borderStyle: style, borderColor: color, borderWidth: width }
   ) }
  get borderCircle() { return this._add('borderCircle', { borderRadius: '50%' }) }
  get borderRound() { return this._add('borderRound', { borderRadius: `2px` }) }
  borderRadius(rad: CSSProperties['borderRadius']) { return this._add(`border-radius-${rad}`, { borderRadius: rad }) }

  get boxShadow() { return this._add('boxShadow', { boxShadow: `0 2px 2px rgba(0, 0, 0, 0.54)` }) }

  get noSpuriousBorders() { return this._add('noSpuriousBorders', {
    WebkitTapHighlightColor: `rgba(0, 0, 0, 0)`,
    outline: 0
  }) }

  get noNativeAppearance() { return this._add('noNativeAppearance', {
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none'
  }) }

  get fullWidth() { return this._add('fullWidth', { width: '100%' }) }
  get fullHeight() { return this._add('fullHeight', { height: '100%' }) }
  get fullScreen() { return this._add('fullScreen', {
    width: '100vw', height: '100vh', position: 'fixed',
    left: 0,
    top: 0,
    transformOrigin: '50% 50%'
  }) }

  hover(...props: (CSSProperties|CssClass)[]) {
    var pr = [] as CSSProperties[]
    var name = 'hover'

    for (var p of props)
      if (p instanceof CssClass) {
        pr = [...pr, ...p.props]
        name += p.names.join('')
      } else
        pr.push(p)

    var newname = this._cached(name, newname => {
      rule`.${newname}:hover`(...pr)
    })

    // FIXME hover has a pretty bad cache handling, this should be improved
    return new BoxBuilder([...this.names, newname], this.props) // !!
  }


}


export const flex = new FlexBuilder([], [])
export const box = new BoxBuilder([], [])
export const text = new TextBuilder([], [])

flex.absoluteGrow(1)
flex.absoluteGrow(2)
flex.absoluteGrow(3)
flex.absoluteGrow(4)
flex.absoluteGrow(5)
