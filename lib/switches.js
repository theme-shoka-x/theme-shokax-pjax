export function outerHTML(oldEl, newEl) {
  oldEl.outerHTML = newEl.outerHTML;
  this.onSwitch();
}
export function innerHTML(oldEl, newEl) {
  oldEl.innerHTML = newEl.innerHTML;

  if (newEl.className === "") {
    oldEl.removeAttribute("class");
  } else {
    oldEl.className = newEl.className;
  }

  this.onSwitch();
}
export function switchElementsAlt(oldEl, newEl) {
  oldEl.innerHTML = newEl.innerHTML;

  // Copy attributes from the new element to the old one
  if (newEl.hasAttributes()) {
    let attrs = newEl.attributes;
    for (let i = 0; i < attrs.length; i++) {
      oldEl.attributes.setNamedItem(attrs[i].cloneNode());
    }
  }

  this.onSwitch();
}