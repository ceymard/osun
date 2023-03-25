
import { CssClass, CSSProperties } from "./utils"

//////////////// THE HELPERS

function px(px: string | number) {
  return typeof px === "number" ? `${px}px` : px
}

function col<T>(col: T | number): string | T {
  return typeof col === "number" ?
    (col < 0 ? `rgba(0, 0, 0, ${-col})` : `rgba(255, 255, 255, ${col})`)
  : col
}

const _curs = (s: string) => ({cursor: s} as CSSProperties)

/////////////////////////////////////////

export class Builder extends CssClass {
  protected _(val: CSSProperties) {
    Object.assign(this.props, val)
    return this
  }

  // FLEX
  get row() { return this._({ display: "flex", flexDirection: "row" }) }
  get column() { return this._({ display: "flex", flexDirection: "column" }) }
  get inline() { return this._({ display: "inline-flex" }) }
  get wrap() { return this._({ flexWrap: "wrap" }) }
  get wrapReverse() { return this._({ flexWrap: "wrap-reverse" }) }
  get justifyCenter() { return this._({justifyContent:"center"}) }
  get justifyStretch() { return this._({justifyContent:"stretch"}) }
  get justifyStart() { return this._({justifyContent:"flex-start"}) }
  get justifyEnd() { return this._({justifyContent:"flex-end"}) }
  get justifyLeft() { return this._({justifyContent:"left"}) }
  get justifyRight() { return this._({justifyContent:"right"}) }
  get justifySpaceBetween() { return this._({justifyContent:"space-between"}) }
  get justifySpaceEvenly() { return this._({justifyContent:"space-evenly"}) }
  get justifySpaceAround() { return this._({justifyContent:"space-around"}) }
  get alignCenter() { return this._({alignItems:"center"}) }
  get alignStretch() { return this._({alignItems:"stretch"}) }
  get alignStart() { return this._({alignItems:"flex-start"}) }
  get alignEnd() { return this._({alignItems:"flex-end"}) }
  get alignBaseline() { return this._({alignItems:"baseline"}) }
  get alignFirstBaseline() { return this._({alignItems:"first baseline"}) }
  get alignLastBaseline() { return this._({alignItems:"last baseline"}) }

  /// methods
  gap(size: string | number) { return this._({ gap: px(size) }) }
  absoluteGrow(n: number) { return this._({ flexGrow: n, flexBasis: 0 }) }
  grow(n: number) { return this._({ flexGrow: n }) }
  get grower() { return this._({ flexGrow: 1, flexBasis: 0 }) }
  justify(val: CSSProperties["justifyContent"]) { return this._({justifyContent: val}) }
  // TEXT
  get bold() { return this._({ fontWeight: "bolder" } ) }
  get bolder() { return this._({ fontWeight: "bolder" }) }
  get italic() { return this._({ fontStyle: "italic" } ) }
  get underline() { return this._({ textDecoration: "underline" } ) }
  get uppercase() { return this._({ textTransform: "uppercase"} ) }
  get lowercase() { return this._({ textTransform: "lowercase"} ) }
  get capitalize() { return this._({ textTransform: "capitalize"} ) }
  get superscript() { return this._({ verticalAlign: "super"} ) }
  get subscript() { return this._({ verticalAlign: "sub"} ) }
  get textCenter() { return this._({ textAlign: "center"} ) }
  get textRight() { return this._({ textAlign: "right"} ) }
  get textJustified() { return this._({ textAlign: "justify"} ) }
  get alignMiddle() { return this._({ verticalAlign: "middle"} ) }
  get preLine() { return this._({ whiteSpace: "pre-line" } ) }
  get pre() { return this._({ whiteSpace: "pre" } ) }
  get preWrap() { return this._({ whiteSpace: "pre-wrap" } ) }
  get nowrap() { return this._({ whiteSpace: "nowrap" } ) }
  color(color: string | number) { return this._({ color: col(color) }) }
  fontSize(size: string | number) { return this._({ fontSize: px(size) }) }
  fontWeight(weight: CSSProperties["fontWeight"]) { return this._({ fontWeight: weight })}

  fill(color: string | number) { return this._({ fill: col(color) }) }
  stroke(color: string | number) { return this._({ stroke: col(color) }) }
  content(str: string) { return this._({ content: `"${str}"` }) }

  background(bg: CSSProperties["background"] | number) { return this._({ background: col(bg) }) }

  get positionAbsolute() { return this._({position: "absolute"}) }
  get positionRelative() { return this._({position: "relative"}) }
  get positionStatic() { return this._({position: "static"}) }
  get positionFixed() { return this._({position: "fixed"}) }
  get positionSticky() { return this._({position: ["-webkit-sticky", "sticky"]}) }
  top(n: string | number) { return this._({ top: px(n) }) }
  bottom(n: string | number) { return this._({ bottom: px(n) }) }
  left(n: string | number) { return this._({ left: px(n) }) }
  right(n: string | number) { return this._({ right: px(n) }) }

  get block() { return this._({ display: "block" }) }
  get inlineBlock() { return this._({ display: "inline-block" }) }
  get displayNone() { return this._({ display: "none" }) }
  opacity(value: number) { return this._({ opacity: value }) }
  get cursorPointer() { return this._({cursor: "pointer"}) }
  get cursorHelp() { return this._({cursor: "help"}) }
  get cursorMove() { return this._({cursor: "move"}) }
  get cursorGrab() { return this._({cursor: "grab"}) }
  get cursorGrabbing() { return this._({cursor: "grabbing"}) }
  get cursorProgress() { return this._({cursor: "progress"}) }
  get cursorRowResize() { return this._({cursor: "row-resize"}) }
  get cursorText() { return this._({cursor: "text"}) }
  get cursorZoomIn() { return this._({cursor: "zoom-in"}) }
  get cursorZoomOut() { return this._({cursor: "zoom-out"}) }
  get eventsNone() { return this._({ pointerEvents: "none" }) }
  get eventsAuto() { return this._({ pointerEvents: "auto" }) }

  get overflowHidden() { return this._({overflow: "hidden"}) }
  get overflowYScroll() { return this._({overflowY: "scroll"}) }
  get overflowXScroll() { return this._({overflowX: "scroll"})}
  get zIndexAuto() { return this._({zIndex: "auto"}) }
  zIndex(z: number) { return this._({zIndex: z}) }

  translateZ(n: number) { return this._({ transform: `translateZ(${n})` })}

  height(size: number | string) { return this._({ height: px(size) }) }
  width(size: number | string) { return this._({ width: px(size) }) }
  minHeight(size: number | string) { return this._({ minHeight: px(size) }) }
  minWidth(size: number | string) { return this._({ minWidth: px(size) }) }
  maxHeight(size: number | string) { return this._({ maxHeight: px(size) }) }
  maxWidth(size: number | string) { return this._({ maxWidth: px(size) }) }

  // Margins
  margin(size: string | number) { return this._({ margin: px(size) }) }
  marginTop(size: string | number) { return this._({ marginTop: px(size) }) }
  marginBottom(size: string | number) { return this._({ marginBottom: px(size) }) }
  marginLeft(size: string | number) { return this._({ marginLeft: px(size) }) }
  marginRight(size: string | number) { return this._({ marginRight: px(size) }) }
  marginVertical(size: string | number) { return this._({ marginTop: px(size), marginLeft: px(size) }) }
  marginHorizontal(size: string | number) { return this._({ marginLeft: px(size), marginRight: px(size) }) }
  padding(size: string | number) { return this._({ padding: px(size) }) }
  paddingSquashed(size: number) { return this._({ padding: `${px(size / 1.512)} ${px(size)}` }) }
  paddingTop(size: string | number) { return this._({ paddingTop: px(size) }) }
  paddingBottom(size: string | number) { return this._({ paddingBottom: px(size) }) }
  paddingLeft(size: string | number) { return this._({ paddingLeft: px(size) }) }
  paddingRight(size: string | number) { return this._({ paddingRight: px(size) }) }
  paddingVertical(size: string | number) { return this._({ paddingTop: px(size), paddingLeft: px(size) }) }
  paddingHorizontal(size: string | number) { return this._({ paddingLeft: px(size), paddingRight: px(size) }) }

  get marginNone() { return this._({ margin: "0" }) }
  get paddingNone() { return this._({ padding: "0" }) }

  // Border
  borderTop(color: string | number, width: string | number = "1px", style: CSSProperties["borderTopStyle"] = "solid") {
    return this._(
      { borderTopStyle: style, borderTopColor: col(color), borderTopWidth: px(width)
  }) }
  borderBottom(color: string | number, width: string | number = "1px", style: CSSProperties["borderBottomStyle"] = "solid") {
    return this._(
      { borderBottomStyle: style, borderBottomColor: col(color), borderBottomWidth: px(width)
  }) }
  borderLeft(color: string | number, width: string | number = "1px", style: CSSProperties["borderLeftStyle"] = "solid") {
    return this._(
      { borderLeftStyle: style, borderLeftColor: col(color), borderLeftWidth: px(width)
  }) }
  borderRight(color: string | number, width: string | number = "1px", style: CSSProperties["borderRightStyle"] = "solid") {
    return this._(
      { borderRightStyle: style, borderRightColor: col(color), borderRightWidth: px(width)
  }) }
  border(color: string | number, width: string | number = "1px", style: CSSProperties["borderStyle"] = "solid") { return this._(
    { borderStyle: style, borderColor: col(color), borderWidth: px(width) }
   ) }
  get borderCircle() { return this._({ borderRadius: "50%" }) }
  get borderRound() { return this._({ borderRadius: `2px` }) }
  borderRadius(rad: CSSProperties["borderRadius"]) { return this._({ borderRadius: rad }) }

  boxShadow(shadow: string) { return this._({ boxShadow: shadow }) }

  get noSpuriousBorders() { return this._({
    WebkitTapHighlightColor: `rgba(0, 0, 0, 0)`,
    outline: 0
  }) }

  get noNativeAppearance() { return this._({
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none"
  }) }

  get fullWidth() { return this._({ width: "100%" }) }
  get fullHeight() { return this._({ height: "100%" }) }
  get fullScreen() { return this._({
    width: "100%", height: "100%", position: "fixed",
    left: 0,
    top: 0,
    transformOrigin: "50% 50%"
  }) }

}
