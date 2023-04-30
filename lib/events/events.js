import forEachEls from "../foreach-els";

function eventForEach(events, fn) {
  events = typeof events === "string" ? events.split(" ") : events;
  events.forEach(fn);
}

export function on(els, events, listener, useCapture) {
  eventForEach(events, e => {
    forEachEls(els, el => {
      el.addEventListener(e, listener, useCapture);
    });
  });
}

// do not support IE !!!
export function trigger(els, events, opts = {}) {
  eventForEach(events, e => {
    const event = new CustomEvent(e, {
      bubbles: true,
      cancelable: true,
      ...opts
    });
    forEachEls(els, el => {
      el.dispatchEvent(event);
    });
  });
}
