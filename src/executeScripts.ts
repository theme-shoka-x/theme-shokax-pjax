import evalScript from "./evalScript";
import forEachEls from "./forEachEls";

// Finds and executes scripts (used for newly added elements)
// Needed since innerHTML does not run scripts
export default function (el: Element): void {
  if (el.tagName.toLowerCase() === "script") {
    evalScript(el as HTMLScriptElement);
  }

  forEachEls(el.querySelectorAll("script"), (script) => {
    const scriptElement = script as HTMLScriptElement;
    if (
      !scriptElement.type ||
      scriptElement.type.toLowerCase() === "text/javascript"
    ) {
      if (scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      evalScript(scriptElement);
    }
  });
}
