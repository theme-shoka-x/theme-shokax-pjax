export default function (
  els:
    | Window
    | Document
    | HTMLCollection
    | NodeList
    | Array<HTMLElement>
    | HTMLElement,
  fn: (el: HTMLElement, index: number, array: HTMLElement[]) => void,
  context?: any
): any {
  if (
    els instanceof HTMLCollection ||
    els instanceof NodeList ||
    els instanceof Array
  ) {
    return Array.prototype.forEach.call(els, fn, context);
  } else {
    // assume simple DOM element
    return fn.call(context, els, 0, [els]);
  }
}
