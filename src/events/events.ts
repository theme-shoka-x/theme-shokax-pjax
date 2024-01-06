import forEachEls from "../forEachEls";
import { PjaxOptions } from "../types";

const eventForEach = (
  events: string | string[],
  fn: (event: string) => void
): void => {
  events = typeof events === "string" ? events.split(" ") : events;
  events.forEach(fn);
};

export function on(
  els:
    | Window
    | Document
    | HTMLElement
    | NodeList
    | Array<HTMLElement>
    | HTMLCollection,
  events: string | string[],
  listener: EventListener,
  useCapture?: boolean
): void {
  eventForEach(events, (e) => {
    forEachEls(els, (el) => {
      el.addEventListener(e, listener, useCapture);
    });
  });
}

// do not support IE !!!
export function trigger(
  els:
    | Window
    | Document
    | HTMLElement
    | NodeList
    | Array<HTMLElement>
    | HTMLCollection,
  events: string | string[],
  opts: Partial<PjaxOptions> = {}
): void {
  eventForEach(events, (e) => {
    const event = new CustomEvent(e, {
      bubbles: true,
      cancelable: true,
      ...opts,
    });
    forEachEls(els, (el) => {
      el.dispatchEvent(event);
    });
  });
}
