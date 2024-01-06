import type Pjax from ".";
import { outerHTML } from "../lib/switches";
import forEachEls from "./forEachEls";
import { PjaxOptions, SwitchFunction } from "./types";

export default function (
  this: Pjax,
  switches: Record<string, SwitchFunction>,
  switchesOptions: Record<string, any>,
  selectors: string[],
  fromEl: Element | Document,
  toEl: Element | Document,
  options: PjaxOptions
): void {
  const switchesQueue: (() => void)[] = [];

  selectors.forEach((selector) => {
    const newEls = fromEl.querySelectorAll(selector);
    const oldEls = toEl.querySelectorAll(selector);

    if (newEls.length !== oldEls.length) {
      throw new Error(
        `DOM doesn't look the same on new loaded page: '${selector}' - new ${newEls.length}, old ${oldEls.length}`
      );
    }

    forEachEls(
      newEls,
      (newEl, i) => {
        const oldEl = oldEls[i];

        const callback = switches[selector]
          ? switches[selector].bind(
              this,
              oldEl,
              newEl,
              options,
              switchesOptions[selector]
            )
          : outerHTML.bind(this, oldEl, newEl, options);

        switchesQueue.push(callback);
      },
      this
    );
  }, this);

  this.state.numPendingSwitches = switchesQueue.length;

  switchesQueue.forEach((queuedSwitch) => {
    queuedSwitch();
  });
}
