import { switchElementsAlt } from "./switches";
import { PjaxOptions } from "./types";

export default function pjax({
  elements = "a[href]",
  selectors = ["title", ".js-Pjax"],
  switches = {},
  switchesOptions = {},
  history = true,
  scrollTo = 0,
  scrollRestoration = true,
  cacheBust = true,
  timeout = 0,
  currentUrlFullReload = false,
}: Partial<PjaxOptions> = {}): PjaxOptions {
  const options = {
    elements,
    selectors,
    switches,
    switchesOptions,
    history,
    scrollTo,
    scrollRestoration,
    cacheBust,
    timeout,
    currentUrlFullReload,
  };
  // We can’t replace body.outerHTML or head.outerHTML.
  // It creates a bug where a new body or head are created in the DOM.
  // If you set head.outerHTML, a new body tag is appended, so the DOM has 2 body nodes, and vice versa
  if (!options.switches.head) {
    options.switches.head = switchElementsAlt;
  }
  if (!options.switches.body) {
    options.switches.body = switchElementsAlt;
  }
  return options;
}
