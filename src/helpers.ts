
import { PropertiesFallback } from 'csstype'
import { MakeBuilder, rule } from './osun'
export type CSSProperties = PropertiesFallback


//////////////// THE HELPERS

function maybepx(prop: string) {
  return function (px: string | number) {
    return {[prop]: typeof px === 'number' ? `${px}px` : px} as CSSProperties
  }
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
  gap(size: string) {
    // FIXME : should probably check for presence of wrap, reverse, row or column

    rule`.${this.last()} > *`({
      marginTop: `${size}`,
      marginLeft: `${size}`
    })

    return {
      position: 'relative',
      top: `-${size}`,
      left: `-${size}`,
      marginBottom: `-${size}`,
      marginRight: `-${size}`,
    }
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

  positionAbsolute: _pos('absolute'),
  positionRelative: _pos('relative'),
  positionStatic: _pos('static'),
  positionFixed: _pos('fixed'),
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
  margin(size: string) { return { margin: size } },
  marginTop(size: string) { return { marginTop: size } },
  marginBottom(size: string) { return { marginBottom: size } },
  marginLeft(size: string) { return { marginLeft: size } },
  marginRight(size: string) { return { marginRight: size } },
  marginVertical(size: string) { return { marginTop: size, marginLeft: size } },
  marginHorizontal(size: string) { return { marginLeft: size, marginRight: size } },
  marginNone: { margin: '0' },

  // Paddings
  padding(size: string) { return { padding: size } },
  paddingTop(size: string) { return { paddingTop: size } },
  paddingBottom(size: string) { return { paddingBottom: size } },
  paddingLeft(size: string) { return { paddingLeft: size } },
  paddingRight(size: string) { return { paddingRight: size } },
  paddingVertical(size: string) { return { paddingTop: size, paddingLeft: size } },
  paddingHorizontal(size: string) { return { paddingLeft: size, paddingRight: size } },
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
  borderAll(color: string, width: string = '1px', style: CSSProperties['borderStyle'] = 'solid') { return { borderStyle: style, borderColor: color, borderWidth: width } },
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
  }
})
