export default function (
  doc: Document,
  selectors: string[],
  el: Element
): boolean {
  for (const selector of selectors) {
    const selectedEls = doc.querySelectorAll(selector);
    for (let j = 0; j < selectedEls.length; j++) {
      if (selectedEls[j].contains(el)) {
        return true;
      }
    }
  }

  return false;
}
