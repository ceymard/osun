/**
 * CSSProperties are shamelessly stolen from typestyle.
 */
// import {CSSProperties} from "./types"
import { OsunSheet } from "./utils"
export { Builder } from "./helpers"

class GlobalSheet extends OsunSheet {
  __requested: number | null = null
  __styles: HTMLStyleElement[] = []

  addDocument(doc: Document) {

  }

  write(str: string): void {
    super.write(str)

    // Write a sheet
    if (this.__requested != null) return
    this.__requested = requestAnimationFrame(() => {
      // Append a sheet onto the body
      // Do we create another Stylesheet ?
      const styl = this.collectAsStyle()
      // Append the newly created style as a style
      document.head.insertBefore(styl, null)
      this.__requested = null
    })
  }
}

const global = new GlobalSheet()
export const style = global.style.bind(global)
export const rule = global.rule.bind(global)
export const raw = global.rule.bind(global)