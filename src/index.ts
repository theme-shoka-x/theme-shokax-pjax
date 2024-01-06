import { on, trigger } from "./events/events";
import executeScripts from "./executeScripts";
import forEachEls from "./forEachEls";
import forEachSelectors from "./forEachSelectors";
import newUid from "./newUid";
import parseOptions from "./parseOptions";
import attachLink from "./proto/attachLink";
import handleResponse from "./proto/handleResponse";
import parseElement from "./proto/parseElement";
import sendRequest from "./sendRequest";
import { innerHTML, outerHTML } from "./switches";
import switchesSelectors from "./switchesSelectors";
import { DefaultSwitches, PjaxOptions, SwitchFunction } from "./types";
import contains from "./util/contains";

class Pjax {
  state: {
    numPendingSwitches: number;
    href: string | null;
    options: PjaxOptions | null;
  };
  options: PjaxOptions;
  private maxUid: string;
  private lastUid: string;
  private request: XMLHttpRequest | null;
  attachLink: typeof attachLink;
  doRequest: typeof sendRequest;
  handleResponse: typeof handleResponse;
  static switches: {
    [key in DefaultSwitches]: SwitchFunction;
  };

  constructor(options?: Partial<PjaxOptions>) {
    this.state = {
      numPendingSwitches: 0,
      href: null,
      options: null,
    };

    this.options = parseOptions(options);

    if (this.options.scrollRestoration && "scrollRestoration" in history) {
      (history as any).scrollRestoration = "manual";
    }

    this.maxUid = this.lastUid = newUid();

    this.parseDOM(document);

    on(window, "popstate", (e: Event) => {
      const st = e as PopStateEvent;
      if (st.state) {
        const opt: PjaxOptions = { ...this.options };
        opt.url = st.state.url;
        opt.title = st.state.title;

        // Since state already exists, prevent it from being pushed again
        opt.history = false;
        opt.scrollPos = st.state.scrollPos;

        if (st.state.uid < this.lastUid) {
          opt.backward = true;
        } else {
          opt.forward = true;
        }

        this.lastUid = st.state.uid;

        // @todo implement history cache here, based on uid
        this.loadUrl(st.state.url, opt);
      }
    });
  }

  getElements(el: Element | Document): NodeListOf<Element> {
    return el.querySelectorAll(this.options.elements as string);
  }

  parseDOM(el: Element | Document): void {
    forEachEls(this.getElements(el), parseElement, this);
  }

  refresh(el: Element): void {
    this.parseDOM(el || document);
  }

  reload(): void {
    window.location.reload();
  }

  forEachSelectors(
    cb: (el: Element) => void,
    context: Pjax,
    DOMcontext?: Element | Document
  ) {
    return forEachSelectors.bind(this)(
      this.options.selectors,
      cb,
      context,
      DOMcontext
    );
  }

  switchSelectors(
    selectors: string[],
    fromEl: Element | Document,
    toEl: Element | Document,
    options: PjaxOptions
  ): void {
    return switchesSelectors.bind(this)(
      this.options.switches,
      this.options.switchesOptions,
      selectors,
      fromEl,
      toEl,
      options
    );
  }

  latestChance(href: string): void {
    window.location = href as any;
  }

  onSwitch(): void {
    trigger(window, "resize scroll");

    this.state.numPendingSwitches--;

    // debounce calls, so we only run this once after all switches are finished.
    if (this.state.numPendingSwitches === 0) {
      this.afterAllSwitches();
    }
  }

  loadContent(html: string, options: PjaxOptions): void {
    if (typeof html !== "string") {
      trigger(document, "pjax:complete pjax:error", options);
      return;
    }

    const tmpEl = document.implementation.createHTMLDocument("pjax");

    // parse HTML attributes to copy them
    // since we are forced to use documentElement.innerHTML (outerHTML can't be used for <html>)
    const htmlRegex = /<html[^>]+>/gi;
    const htmlAttribsRegex = /\s?[a-z:]+(?:=['"][^'">]+['"])*/gi;
    let matches = html.match(htmlRegex);
    if (matches && matches.length) {
      matches = matches[0].match(htmlAttribsRegex)!;
      if (matches.length) {
        matches.shift();
        matches.forEach((htmlAttrib) => {
          const attr = htmlAttrib.trim().split("=");
          if (attr.length === 1) {
            tmpEl.documentElement.setAttribute(attr[0], "true");
          } else {
            tmpEl.documentElement.setAttribute(attr[0], attr[1].slice(1, -1));
          }
        });
      }
    }

    tmpEl.documentElement.innerHTML = html;

    if (
      document.activeElement &&
      contains(document, this.options.selectors!, document.activeElement)
    ) {
      try {
        (document.activeElement as any).blur();
      } catch (e) {} // eslint-disable-line no-empty
    }

    this.switchSelectors(this.options.selectors, tmpEl, document, options);
  }

  loadUrl(href: string, options?: PjaxOptions): void {
    options =
      typeof options === "object"
        ? { ...this.options, ...options }
        : { ...this.options };

    // Abort any previous request
    this.abortRequest(this.request);

    trigger(document, "pjax:send", options);

    // Do the request
    this.request = this.doRequest(
      href,
      options,
      this.handleResponse.bind(this)
    );
  }

  afterAllSwitches(): void {
    // execute scripts when DOM have been completely updated
    this.options.selectors!.forEach((selector) => {
      forEachEls(document.querySelectorAll(selector), (el) => {
        executeScripts(el);
      });
    });

    const state = this.state;

    if (state.options?.history) {
      if (!window.history.state) {
        this.lastUid = this.maxUid = newUid();
        window.history.replaceState(
          {
            url: window.location.href,
            title: document.title,
            uid: this.maxUid,
            scrollPos: [0, 0],
          },
          document.title
        );
      }

      // Update browser history
      this.lastUid = this.maxUid = newUid();

      window.history.pushState(
        {
          url: state.href,
          title: state.options.title,
          uid: this.maxUid,
          scrollPos: [0, 0],
        },
        state.options.title,
        state.href
      );
    }

    this.forEachSelectors((el: Element) => {
      this.parseDOM(el);
    }, this);

    // Fire Events
    trigger(document, "pjax:complete pjax:success", state.options!);

    if (state.options?.history) {
      // First parse url and check for hash to override scroll
      const a = document.createElement("a");
      a.href = this.state.href!;
      if (a.hash) {
        let name = a.hash.slice(1);
        name = decodeURIComponent(name);

        let curTop = 0;
        let target =
          document.getElementById(name) || document.getElementsByName(name)[0];
        if (target) {
          // http://stackoverflow.com/questions/8111094/cross-browser-javascript-function-to-find-actual-position-of-an-element-in-page
          if (target.offsetParent) {
            do {
              curTop += target.offsetTop;
              target = target.offsetParent as HTMLElement;
            } while (target);
          }
        }
        window.scrollTo(0, curTop);
      } else if (state.options.scrollTo !== false) {
        // Scroll page to top on new page load
        if (Array.isArray(state.options.scrollTo)) {
          window.scrollTo(state.options.scrollTo[0], state.options.scrollTo[1]);
        } else {
          window.scrollTo(0, state.options.scrollTo);
        }
      }
    } else if (state.options?.scrollRestoration && state.options.scrollPos) {
      window.scrollTo(state.options.scrollPos[0], state.options.scrollPos[1]);
    }

    this.state = {
      numPendingSwitches: 0,
      href: null,
      options: null,
    };
  }

  abortRequest(request: XMLHttpRequest | null) {
    if (request && request.readyState < 4) {
      request.onreadystatechange = () => {};
      request.abort();
    }
  }
}

Pjax.prototype.attachLink = attachLink;
Pjax.prototype.doRequest = sendRequest;
Pjax.prototype.handleResponse = handleResponse;
Pjax.switches = { innerHTML, outerHTML };

export default Pjax;
