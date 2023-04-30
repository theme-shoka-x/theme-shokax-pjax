export default function (el) {
  switch (el.tagName.toLowerCase()) {
    case "a":
      // only attach link if el does not already have link attached
      if (!el.hasAttribute("data-pjax-state")) {
        this.attachLink(el);
      }
      break;

    // form does not exist in shokax

    default:
      throw "theme-shokax-pjax can only be applied on <a>";
  }
};
