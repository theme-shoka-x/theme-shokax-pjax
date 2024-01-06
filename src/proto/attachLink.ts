import type Pjax from "..";
import { on } from "../events/events";
import { PjaxOptions } from "../types";

const attrState = "data-pjax-state";

function linkAction(this: Pjax, el: HTMLAnchorElement, event: MouseEvent) {
  if (event.defaultPrevented || event.returnValue === false) {
    return;
  }

  // Since loadUrl modifies options, and we may add our own modifications below,
  // clone it so the changes don't persist
  const options: PjaxOptions = { ...this.options };

  const attrValue = checkIfShouldAbort(el, event);
  if (attrValue) {
    el.setAttribute(attrState, attrValue);
    return;
  }

  event.preventDefault();

  // don’t do "nothing" if the user tries to reload the page by clicking the same link twice
  if (
    this.options.currentUrlFullReload &&
    el.href === window.location.href.split("#")[0]
  ) {
    el.setAttribute(attrState, "reload");
    this.reload();
    return;
  }

  el.setAttribute(attrState, "load");

  options.triggerElement = el;
  this.loadUrl(el.href, options);
}

function checkIfShouldAbort(
  el: HTMLAnchorElement,
  event: MouseEvent
): string | null {
  // Don’t break browser special behavior on links (like opening in a new window)
  if (
    event.which > 1 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return "modifier";
  }

  // we do test on href now to prevent unexpected behavior if for some reason
  // the user has an href that can be dynamically updated

  // Ignore external links.
  if (
    el.protocol !== window.location.protocol ||
    el.host !== window.location.host
  ) {
    return "external";
  }

  // Ignore anchors on the same page (keep native behavior)
  if (
    el.hash &&
    el.href.replace(el.hash, "") ===
      window.location.href.replace(location.hash, "")
  ) {
    return "anchor";
  }

  // Ignore empty anchor "foo.html#"
  if (el.href === window.location.href.split("#")[0] + "#") {
    return "anchor-empty";
  }

  return null;
}

export default function (this: Pjax, el: HTMLAnchorElement): void {
  el.setAttribute(attrState, "");

  on(el, "click", (event: Event) => linkAction.call(this, el, event));

  on(el, "keyup", (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.keyCode === 13) {
      linkAction.call(this, el, keyboardEvent);
    }
  });
}
