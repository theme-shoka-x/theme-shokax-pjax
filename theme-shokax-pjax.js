(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Pjax = factory());
})(this, (function () { 'use strict';

  function forEachEls (els, fn, context) {
    if (
      els instanceof HTMLCollection ||
      els instanceof NodeList ||
      els instanceof Array
    ) {
      return Array.prototype.forEach.call(els, fn, context);
    }
    return fn.call(context, els);
  }

  function evalScript (el) {
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
      script.async = false;
    }
    if (code !== "") {
      script.appendChild(document.createTextNode(code));
    }
    parent.appendChild(script);
    if (
      (parent instanceof HTMLHeadElement || parent instanceof HTMLBodyElement) &&
      parent.contains(script)
    ) {
      parent.removeChild(script);
    }
    return true;
  }

  function executeScripts(el) {
    if (el.tagName.toLowerCase() === "script") {
      evalScript(el);
    }
    forEachEls(el.querySelectorAll("script"), function(script) {
      if (!script.type || script.type.toLowerCase() === "text/javascript") {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        evalScript(script);
      }
    });
  }

  function outerHTML(oldEl, newEl) {
    oldEl.outerHTML = newEl.outerHTML;
    this.onSwitch();
  }
  function innerHTML(oldEl, newEl) {
    oldEl.innerHTML = newEl.innerHTML;
    if (newEl.className === "") {
      oldEl.removeAttribute("class");
    } else {
      oldEl.className = newEl.className;
    }
    this.onSwitch();
  }
  function switchElementsAlt(oldEl, newEl) {
    oldEl.innerHTML = newEl.innerHTML;
    if (newEl.hasAttributes()) {
      let attrs = newEl.attributes;
      for (let i = 0; i < attrs.length; i++) {
        oldEl.attributes.setNamedItem(attrs[i].cloneNode());
      }
    }
    this.onSwitch();
  }

  function parseOptions (options = {}) {
    options.elements = options.elements || "a[href], form[action]";
    options.selectors = options.selectors || ["title", ".js-Pjax"];
    options.switches = options.switches || {};
    options.switchesOptions = options.switchesOptions || {};
    options.history =
      typeof options.history === "undefined" ? true : options.history;
    options.scrollTo =
      typeof options.scrollTo === "undefined" ? 0 : options.scrollTo;
    options.scrollRestoration =
      typeof options.scrollRestoration !== "undefined"
        ? options.scrollRestoration
        : true;
    options.cacheBust =
      typeof options.cacheBust === "undefined" ? true : options.cacheBust;
    options.timeout = options.timeout || 0;
    options.currentUrlFullReload =
      typeof options.currentUrlFullReload === "undefined"
        ? false
        : options.currentUrlFullReload;
    if (!options.switches.head) {
      options.switches.head = switchElementsAlt;
    }
    if (!options.switches.body) {
      options.switches.body = switchElementsAlt;
    }
    return options;
  }

  function foreachSelectors(selectors, cb, context, DOMcontext = document) {
    selectors.forEach(selector => {
      forEachEls(DOMcontext.querySelectorAll(selector), cb, context);
    });
  }

  function switchesSelectors(
    switches,
    switchesOptions,
    selectors,
    fromEl,
    toEl,
    options
  ) {
    const switchesQueue = [];
    selectors.forEach(function(selector) {
      const newEls = fromEl.querySelectorAll(selector);
      const oldEls = toEl.querySelectorAll(selector);
      if (newEls.length !== oldEls.length) {
        throw `DOM doesn’t look the same on new loaded page: ’${selector}’ - new ${newEls.length}, old ${oldEls.length}`;
      }
      forEachEls(
        newEls,
        function(newEl, i) {
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
    switchesQueue.forEach(queuedSwitch => {
      queuedSwitch();
    });
  }

  var newUid = (function () {
    let counter = 0;
    return function () {
      const id = `pjax${new Date().getTime()}_${counter}`;
      counter++;
      return id;
    };
  })();

  function eventForEach(events, fn) {
    events = typeof events === "string" ? events.split(" ") : events;
    events.forEach(fn);
  }
  function on(els, events, listener, useCapture) {
    eventForEach(events, e => {
      forEachEls(els, el => {
        el.addEventListener(e, listener, useCapture);
      });
    });
  }
  function trigger(els, events, opts = {}) {
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

  function contains(doc, selectors, el) {
    for (let i = 0; i < selectors.length; i++) {
      const selectedEls = doc.querySelectorAll(selectors[i]);
      for (let j = 0; j < selectedEls.length; j++) {
        if (selectedEls[j].contains(el)) {
          return true;
        }
      }
    }
    return false;
  }

  const attrState = "data-pjax-state";
  const isDefaultPrevented = function(event) {
    return event.defaultPrevented || event.returnValue === false;
  };
  const linkAction = function (el, event) {
    if (isDefaultPrevented(event)) {
      return;
    }
    const options = {...this.options};
    const attrValue = checkIfShouldAbort(el, event);
    if (attrValue) {
      el.setAttribute(attrState, attrValue);
      return;
    }
    event.preventDefault();
    if (
        this.options.currentUrlFullReload &&
        el.href === window.location.href.split("#")[0]
    ) {
      el.setAttribute(attrState, "reload");
      this.reload();
      return;
    }
    el.setAttribute(attrState, "load");
    options.triggerElement = el;
    this.loadUrl(el.href, options);
  };
  function checkIfShouldAbort(el, event) {
    if (
      event.which > 1 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return "modifier";
    }
    if (
      el.protocol !== window.location.protocol ||
      el.host !== window.location.host
    ) {
      return "external";
    }
    if (
      el.hash &&
      el.href.replace(el.hash, "") ===
        window.location.href.replace(location.hash, "")
    ) {
      return "anchor";
    }
    if (el.href === window.location.href.split("#")[0] + "#") {
      return "anchor-empty";
    }
  }
  function attachLink(el) {
    const that = this;
    el.setAttribute(attrState, "");
    on(el, "click", function(event) {
      linkAction.call(that, el, event);
    });
    on(
      el,
      "keyup",
      function(event) {
        if (event.keyCode === 13) {
          linkAction.call(that, el, event);
        }
      }.bind(this)
    );
  }

  function updateQueryString(uri, key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf("?") !== -1 ? "&" : "?";
    if (uri.match(re)) {
      return uri.replace(re, "$1" + key + "=" + value + "$2");
    } else {
      return uri + separator + key + "=" + value;
    }
  }

  function sendRequest(location, options = {}, callback) {
    const requestOptions = options.requestOptions || {};
    const requestMethod = (requestOptions.requestMethod || "GET").toUpperCase();
    const requestParams = requestOptions.requestParams || null;
    let requestPayload = null;
    const request = new XMLHttpRequest();
    const timeout = options.timeout || 0;
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          callback(request.responseText, request, location, options);
        } else if (request.status !== 0) {
          callback(null, request, location, options);
        }
      }
    };
    request.onerror = function(e) {
      console.log(e);
      callback(null, request, location, options);
    };
    request.ontimeout = function() {
      callback(null, request, location, options);
    };
    if (requestParams && requestParams.length) {
      let queryString = requestParams
        .map(function(param) {
          return param.name + "=" + param.value;
        })
        .join("&");
      switch (requestMethod) {
        case "GET":
          location = location.split("?")[0];
          location += "?" + queryString;
          break;
        case "POST":
          requestPayload = queryString;
          break;
      }
    }
    if (options.cacheBust) {
      location = updateQueryString(location, "t", Date.now());
    }
    request.open(requestMethod, location, true);
    request.timeout = timeout;
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.setRequestHeader("X-PJAX", "true");
    request.setRequestHeader(
      "X-PJAX-Selectors",
      JSON.stringify(options.selectors)
    );
    request.send(requestPayload);
    return request;
  }

  function handleResponse (responseText, request, href, options) {
    options = {...(options||this.options)};
    options.request = request;
    if (responseText === false) {
      trigger(document, "pjax:complete pjax:error", options);
      return;
    }
    const currentState = window.history.state || {};
    window.history.replaceState(
      {
        url: currentState.url || window.location.href,
        title: currentState.title || document.title,
        uid: currentState.uid || newUid(),
        scrollPos: [
          document.documentElement.scrollLeft || document.body.scrollLeft,
          document.documentElement.scrollTop || document.body.scrollTop
        ]
      },
      document.title,
      window.location.href
    );
    const oldHref = href;
    if (request.responseURL) {
      if (href !== request.responseURL) {
        href = request.responseURL;
      }
    } else if (request.getResponseHeader("X-PJAX-URL")) {
      href = request.getResponseHeader("X-PJAX-URL");
    } else if (request.getResponseHeader("X-XHR-Redirected-To")) {
      href = request.getResponseHeader("X-XHR-Redirected-To");
    }
    const a = document.createElement("a");
    a.href = oldHref;
    const oldHash = a.hash;
    a.href = href;
    if (oldHash && !a.hash) {
      a.hash = oldHash;
      href = a.href;
    }
    this.state.href = href;
    this.state.options = options;
    try {
      this.loadContent(responseText, options);
    } catch (e) {
      trigger(document, "pjax:error", options);
      console.error("Pjax switch fail: ", e);
      return this.latestChance(href);
    }
  }

  function parseElement (el) {
    switch (el.tagName.toLowerCase()) {
      case "a":
        if (!el.hasAttribute("data-pjax-state")) {
          this.attachLink(el);
        }
        break;
      default:
        throw "theme-shokax-pjax can only be applied on <a>";
    }
  }

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
            const opt = {...this.options};
            opt.url = st.state.url;
            opt.title = st.state.title;
            opt.history = false;
            opt.scrollPos = st.state.scrollPos;
            if (st.state.uid < this.lastUid) {
              opt.backward = true;
            } else {
              opt.forward = true;
            }
            this.lastUid = st.state.uid;
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
      if (
        document.activeElement &&
        contains(document, this.options.selectors, document.activeElement)
      ) {
        try {
          document.activeElement.blur();
        } catch (e) { }
      }
      this.switchSelectors(this.options.selectors, tmpEl, document, options);
    }
    loadUrl(href, options) {
      options =
        typeof options === "object"
          ? Object.assign({}, this.options, options)
          : {...this.options};
      this.abortRequest(this.request);
      trigger(document, "pjax:send", options);
      this.request = this.doRequest(
        href,
        options,
        this.handleResponse.bind(this)
      );
    }
    afterAllSwitches() {
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
      trigger(document, "pjax:complete pjax:success", state.options);
      if (state.options.history) {
        const a = document.createElement("a");
        a.href = this.state.href;
        if (a.hash) {
          let name = a.hash.slice(1);
          name = decodeURIComponent(name);
          let curTop = 0;
          let target =
            document.getElementById(name) || document.getElementsByName(name)[0];
          if (target) {
            if (target.offsetParent) {
              do {
                curTop += target.offsetTop;
                target = target.offsetParent;
              } while (target);
            }
          }
          window.scrollTo(0, curTop);
        } else if (state.options.scrollTo !== false) {
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
  Pjax.prototype.doRequest = sendRequest;
  Pjax.prototype.handleResponse = handleResponse;
  Pjax.switches = { innerHTML, outerHTML, switchElementsAlt };

  return Pjax;

}));
