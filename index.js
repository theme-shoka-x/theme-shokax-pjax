import executeScripts from "./lib/execute-scripts";
import forEachEls from "./lib/foreach-els";
import parseOptions from "./lib/parse-options";
import foreachSelectors from "./lib/foreach-selectors";
import switchesSelectors from "./lib/switches-selectors";
import { innerHTML, outerHTML, switchElementsAlt } from "./lib/switches";
import newUid from "./lib/uniqueid";

import { on } from "./lib/events/events";
import { trigger } from "./lib/events/events";

import clone from "./lib/util/clone";
import contains from "./lib/util/contains";

import attachLink from './lib/proto/attach-link';
import sendRequest from "./lib/send-request";
import handleResponse from "./lib/proto/handle-response";
import parseElement from "./lib/proto/parse-element";

class Pjax {
  constructor(options) {
    this.state = {
      numPendingSwitches: 0,
      href: null,
      options: null
    };

    this.options = parseOptions(options);

    if (this.options.scrollRestoration && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    this.maxUid = this.lastUid = newUid();

    this.parseDOM(document);

    on(
      window,
      "popstate",
      function (st) {
        if (st.state) {
          const opt = clone(this.options);
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
      }.bind(this)
    );
  }
  getElements(el) {
    return el.querySelectorAll(this.options.elements);
  }

  parseDOM(el) {
    forEachEls(this.getElements(el), parseElement, this);
  }

  refresh(el) {
    this.parseDOM(el || document);
  }

  reload() {
    window.location.reload();
  }

  forEachSelectors(cb, context, DOMcontext) {
    return foreachSelectors.bind(this)(
      this.options.selectors,
      cb,
      context,
      DOMcontext
    );
  }

  switchSelectors(selectors, fromEl, toEl, options) {
    return switchesSelectors.bind(this)(
      this.options.switches,
      this.options.switchesOptions,
      selectors,
      fromEl,
      toEl,
      options
    );
  }

  latestChance(href) {
    window.location = href;
  }

  onSwitch() {
    trigger(window, "resize scroll");

    this.state.numPendingSwitches--;

    // debounce calls, so we only run this once after all switches are finished.
    if (this.state.numPendingSwitches === 0) {
      this.afterAllSwitches();
    }
  }

  loadContent(html, options) {
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
      matches = matches[0].match(htmlAttribsRegex);
      if (matches.length) {
        matches.shift();
        matches.forEach(function (htmlAttrib) {
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

    // Clear out any focused controls before inserting new page contents.
    if (
      document.activeElement &&
      contains(document, this.options.selectors, document.activeElement)
    ) {
      try {
        document.activeElement.blur();
      } catch (e) { } // eslint-disable-line no-empty
    }

    this.switchSelectors(this.options.selectors, tmpEl, document, options);
  }

  loadUrl(href, options) {
    options =
      typeof options === "object"
        ? Object.assign({}, this.options, options)
        : clone(this.options);

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

  afterAllSwitches() {
    // execute scripts when DOM have been completely updated
    this.options.selectors.forEach(selector => {
      forEachEls(document.querySelectorAll(selector), el => {
        executeScripts(el);
      });
    });

    const state = this.state;

    if (state.options.history) {
      if (!window.history.state) {
        this.lastUid = this.maxUid = newUid();
        window.history.replaceState(
          {
            url: window.location.href,
            title: document.title,
            uid: this.maxUid,
            scrollPos: [0, 0]
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
          scrollPos: [0, 0]
        },
        state.options.title,
        state.href
      );
    }

    this.forEachSelectors(function (el) {
      this.parseDOM(el);
    }, this);

    // Fire Events
    trigger(document, "pjax:complete pjax:success", state.options);

    if (state.options.history) {
      // First parse url and check for hash to override scroll
      const a = document.createElement("a");
      a.href = this.state.href;
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
              target = target.offsetParent;
            } while (target);
          }
        }
        window.scrollTo(0, curTop);
      } else if (state.options.scrollTo !== false) {
        // Scroll page to top on new page load
        if (state.options.scrollTo.length > 1) {
          window.scrollTo(state.options.scrollTo[0], state.options.scrollTo[1]);
        } else {
          window.scrollTo(0, state.options.scrollTo);
        }
      }
    } else if (state.options.scrollRestoration && state.options.scrollPos) {
      window.scrollTo(state.options.scrollPos[0], state.options.scrollPos[1]);
    }

    this.state = {
      numPendingSwitches: 0,
      href: null,
      options: null
    };
  }

  abortRequest(request) {
    if (request && request.readyState < 4) {
      request.onreadystatechange = function () { };
      request.abort();
    }
  }
}

Pjax.prototype.attachLink = attachLink;
// form does not exist in shokax
// Pjax.prototype.attachForm = attachForm;
Pjax.prototype.doRequest = sendRequest;
Pjax.prototype.handleResponse = handleResponse;
Pjax.switches = { innerHTML, outerHTML, switchElementsAlt };

// All browsers that support shokax theme by default support pjax.
export default Pjax;