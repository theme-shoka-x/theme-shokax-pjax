export default function (el) {
  const code = el.text || el.textContent || el.innerHTML || "";
  const src = el.src || "";
  const parent =
      el.parentNode || document.querySelector("head") || document.documentElement;
  const script = document.createElement("script");

  if (code.match("document.write")) {
    return false;
  }

  script.type = "text/javascript";
  script.id = el.id;

  if (src !== "") {
    script.src = src;
    script.async = false; // force synchronous loading of peripheral JS
  }

  if (code !== "") {
    script.appendChild(document.createTextNode(code));
  }

  // execute
  parent.appendChild(script);
  // avoid pollution only in head or body tags
  if (
    (parent instanceof HTMLHeadElement || parent instanceof HTMLBodyElement) &&
    parent.contains(script)
  ) {
    parent.removeChild(script);
  }

  return true;
};
