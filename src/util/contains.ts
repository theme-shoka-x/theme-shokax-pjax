export default function (
  doc: Document,
  selectors: string[],
  el: Element
): boolean {
  return selectors.some(selector =>
    Array.from(doc.querySelectorAll(selector)).some(selectedEl =>
      selectedEl.contains(el)
    )
  );
}
