import type Pjax from ".";

export function outerHTML(this: Pjax, oldEl: Element, newEl: Element): void {
  oldEl.outerHTML = newEl.outerHTML;
  this.onSwitch();
}

export function innerHTML(this: Pjax, oldEl: Element, newEl: Element): void {
  oldEl.innerHTML = newEl.innerHTML;

  if (newEl.className === "") {
    oldEl.removeAttribute("class");
  } else {
    oldEl.className = newEl.className;
  }

  this.onSwitch();
}

export function switchElementsAlt(
  this: Pjax,
  oldEl: Element,
  newEl: Element
): void {
  oldEl.innerHTML = newEl.innerHTML;

  // Copy attributes from the new element to the old one
  if (newEl.hasAttributes()) {
    const attrs = newEl.attributes;
    for (let i = 0; i < attrs.length; i++) {
      oldEl.attributes.setNamedItem(attrs[i].cloneNode() as Attr);
    }
  }

  this.onSwitch();
}
