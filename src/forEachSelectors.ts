import forEachEls from "./forEachEls";

export default function (
  selectors: string[],
  cb: (el: HTMLElement, index: number, array: HTMLElement[]) => void,
  context: any,
  DOMcontext: Document = document
): void {
  selectors.forEach((selector) => {
    forEachEls(DOMcontext.querySelectorAll(selector), cb, context);
  });
}
