import jsdom from "jsdom";

const { JSDOM } = jsdom;

const dom = new JSDOM("", {
  url: "https://example.org/",
  runScripts: "dangerously",
});

// @ts-ignore
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.location = dom.window.location;
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLScriptElement = dom.window.HTMLScriptElement;
globalThis.HTMLHeadElement = dom.window.HTMLHeadElement;
globalThis.HTMLBodyElement = dom.window.HTMLBodyElement;
globalThis.Node = dom.window.Node;
globalThis.HTMLCollection = dom.window.HTMLCollection;
globalThis.NodeList = dom.window.NodeList;
globalThis.XMLHttpRequest = dom.window.XMLHttpRequest;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.Event = dom.window.Event;