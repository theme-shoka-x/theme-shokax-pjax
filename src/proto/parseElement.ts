import type Pjax from "..";

export default function (this: Pjax, el: HTMLElement): void {
  switch (el.tagName.toLowerCase()) {
    case "a":
      // only attach link if el does not already have link attached
      if (!el.hasAttribute("data-pjax-state")) {
        this.attachLink(el as HTMLAnchorElement);
      }
      break;

    // form does not exist in shokax
    default:
      throw new Error("theme-shokax-pjax can only be applied on <a>");
  }
}
