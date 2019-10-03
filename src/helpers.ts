
import { PropertiesFallback } from 'csstype'
import { MakeBuilder, rule, CssClass } from './osun'
export type CSSProperties = PropertiesFallback


//////////////// THE HELPERS

function maybepx(prop: string) {
  return function (px: string | number) {
    return {[prop]: typeof px === 'number' ? `${px}px` : px} as CSSProperties
  }
}

function px(px: string | number) {
  return typeof px === 'number' ? `${px}px` : px
}

const _flexjust = (val: CSSProperties['justifyContent']) => { return { justifyContent: val } }
const _flexalign = (val: CSSProperties['alignItems']) => { return { alignItems: val } }

export const flex = MakeBuilder('flex', {
  row: { display: 'flex', flexDirection: 'row' },
  column: { display: 'flex', flexDirection: 'column' },
  inline: { display: 'inline-flex' },
  wrap: { flexWrap: 'wrap' },
  wrapReverse: { flexWrap: 'wrap-reverse' },
  absoluteGrow(n: number) { return { flexGrow: n, flexBasis: 0 } as CSSProperties },
  grow(n: number) { { return { flexGrow: n } } },
  justifyCenter: _flexjust('center'),
  justifyStretch: _flexjust('stretch'),
  justifyStart: _flexjust('flex-start'),
  justifyEnd: _flexjust('flex-end'),
  justifyLeft: _flexjust('left'),
  justifyRight: _flexjust('right'),
  justifySpaceBetween: _flexjust('space-between'),
  justifySpaceEvenly: _flexjust('space-evenly'),
  justifySpaceAround: _flexjust('space-around'),
  alignCenter: _flexalign('center'),
  alignStretch: _flexalign('stretch'),
  alignStart: _flexalign('flex-start'),
  alignEnd: _flexalign('flex-end'),
  alignBaseline: _flexalign('baseline'),
  alignFirstBaseline: _flexalign('first baseline'),
  alignLastBaseline: _flexalign('last baseline'),
  gappedRow(size: string | number) {

    rule`.${this.last()} > *`({
      marginLeft: px(size)
    })

    rule`.${this.last()} > *:first-child`({
      marginLeft: 0
    })

    return {
      display: 'flex',
      flexDirection: 'row',
    } as CSSProperties
  },
  gappedColumn(size: string | number) {

    rule`.${this.last()} > *`({
      marginTop: px(size)
    })

    rule`.${this.last()} > *:first-child`({
      marginTop: 0
    })

    return {
      display: 'flex',
      flexDirection: 'column',
    } as CSSProperties
  },
})


export const grid = MakeBuilder('grid', {

})


export const text = MakeBuilder('text', {
  color(col: string) { return { color: col } },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  underline: { textDecoration: 'underline' },
  uppercase: {textTransform: 'uppercase'},
  lowercase: {textTransform: 'lowercase'},
  capitalize: {textTransform: 'capitalize'},
  superscript: {verticalAlign: 'super'},
  subscript: {verticalAlign: 'sub'},
  centered: {textAlign: 'center'},
  right: {textAlign: 'right'},
  justified: {textAlign: 'justify'},
  alignMiddle: {verticalAlign: 'middle'},
  preLine: { whiteSpace: 'pre-line' },
  pre: { whiteSpace: 'pre' },
  preWrap: { whiteSpace: 'pre-wrap' },
  nowrap: { whiteSpace: 'nowrap' },
  size(size: string) { return { fontSize: size } }
})


const _pos = (k: CSSProperties['position']) => { return { position: k } as CSSProperties }
const _curs = (s: string) => { return {cursor: s} as CSSProperties }

export const box = MakeBuilder('box', {
  background(bg: CSSProperties['background']) { return { background: bg } },

  positionAbsolute: _pos('absolute !important' as any),
  positionRelative: _pos('relative !important' as any),
  positionStatic: _pos('static !important' as any),
  positionFixed: _pos('fixed !important' as any),
  positionSticky: _pos(['-webkit-sticky', 'sticky']),
  top(n: string | number) { return { top: typeof n === 'number' ? `${n}px` : n } },
  bottom(n: string | number) { return { top: typeof n === 'number' ? `${n}px` : n } },
  left(n: string | number) { return { top: typeof n === 'number' ? `${n}px` : n } },
  right(n: string | number) { return { top: typeof n === 'number' ? `${n}px` : n } },

  block: { display: 'block' },
  inlineBlock: { display: 'inline-block' },
  displayNone: { display: 'none' },

  cursorPointer: _curs('pointer'),
  cursorHelp: _curs('help'),
  cursorMove: _curs('move'),
  cursorGrab: _curs('grab'),
  cursorGrabbing: _curs('grabbing'),
  cursorProgress: _curs('progress'),
  cursorRowResize: _curs('row-resize'),
  cursorText: _curs('text'),
  cursorZoomIn: _curs('zoom-in'),
  cursorZoomOut: _curs('zoom-out'),
  eventsNone: { pointerEvents: 'none' },
  eventsAuto: { pointerEvents: 'auto' },

  height: maybepx('height'),
  width: maybepx('width'),

  // Margins
  margin(size: string | number) { return { margin: px(size) } },
  marginTop(size: string | number) { return { marginTop: px(size) } },
  marginBottom(size: string | number) { return { marginBottom: px(size) } },
  marginLeft(size: string | number) { return { marginLeft: px(size) } },
  marginRight(size: string | number) { return { marginRight: px(size) } },
  marginVertical(size: string | number) { return { marginTop: px(size), marginLeft: px(size) } },
  marginHorizontal(size: string | number) { return { marginLeft: px(size), marginRight: px(size) } },
  marginNone: { margin: '0' },

  // Paddings
  padding(size: string | number) { return { padding: px(size) } },
  paddingTop(size: string | number) { return { paddingTop: px(size) } },
  paddingBottom(size: string | number) { return { paddingBottom: px(size) } },
  paddingLeft(size: string | number) { return { paddingLeft: px(size) } },
  paddingRight(size: string | number) { return { paddingRight: px(size) } },
  paddingVertical(size: string | number) { return { paddingTop: px(size), paddingLeft: px(size) } },
  paddingHorizontal(size: string | number) { return { paddingLeft: px(size), paddingRight: px(size) } },
  paddingNone: { padding: '0' },

  // Border
  borderTop(color: string, width: string = '1px', style: CSSProperties['borderTopStyle'] = 'solid') {
    return { borderTopStyle: style, borderTopColor: color, borderTopWidth: width
  } },
  borderBottom(color: string, width: string = '1px', style: CSSProperties['borderBottomStyle'] = 'solid') {
    return { borderBottomStyle: style, borderBottomColor: color, borderBottomWidth: width
  } },
  borderLeft(color: string, width: string = '1px', style: CSSProperties['borderLeftStyle'] = 'solid') {
    return { borderLeftStyle: style, borderLeftColor: color, borderLeftWidth: width
  } },
  borderRight(color: string, width: string = '1px', style: CSSProperties['borderRightStyle'] = 'solid') {
    return { borderRightStyle: style, borderRightColor: color, borderRightWidth: width
  } },
  borderVertical(color: string, width: string = '1px', style: CSSProperties['borderTopStyle'] = 'solid') { return {
    borderTopStyle: style,
    borderTopColor: color,
    borderTopWidth: width,
    borderBottomStyle: style,
    borderBottomColor: color,
    borderBottomWidth: width
  } },
  borderHorizontal(color: string, width: string = '1px', style: CSSProperties['borderLeftStyle'] = 'solid') { return {
    borderLeftStyle: style,
    borderLeftColor: color,
    borderLeftWidth: width,
    borderRightStyle: style,
    borderRightColor: color,
    borderRightWidth: width
  } },
  border(color: string, width: string = '1px', style: CSSProperties['borderStyle'] = 'solid') { return { borderStyle: style, borderColor: color, borderWidth: width } },
  borderCircle: { borderRadius: '50%' },
  borderRound: { borderRadius: `2px` },
  borderRadius(rad: CSSProperties['borderRadius']) { return { borderRadius: rad } },

  boxShadow: { boxShadow: `0 2px 2px rgba(0, 0, 0, 0.54)` },

  noSpuriousBorders: {
    WebkitTapHighlightColor: `rgba(0, 0, 0, 0)`,
    outline: 0
  },

  noNativeAppearance: {
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none'
  },

  fullWidth: { width: '100%' },
  fullHeight: { height: '100%' },
  fullScreen: {
    width: '100vw', height: '100vh', position: 'fixed',
    left: 0,
    top: 0,
    transformOrigin: '50% 50%'
  },

  hover(...props: (CSSProperties|CssClass)[]) {
    var pr = [] as CSSProperties[]
    for (var p of props)
      if (p instanceof CssClass)
        pr = [...pr, ...p.props]
      else
        pr.push(p)
    rule `${'.' + this.last()}:hover`(...pr)
  }
})


flex.absoluteGrow(1)
flex.absoluteGrow(2)
flex.absoluteGrow(3)
flex.absoluteGrow(4)
flex.absoluteGrow(5)