declare class Pjax {
  options: Pjax.IOptions;

  constructor(options?: Partial<Pjax.IOptions>);

  static switches: {
    [key in DefaultSwitches]: Pjax.Switch
  };

  getElements(el: Element | Document): NodeListOf<Element>;

  parseDOM(el: Element | Document): void;

  refresh(el: Element): void;

  reload(): void;

  attachLink(el: HTMLAnchorElement): void;

  forEachSelectors(cb: (el: Element) => void, context: Pjax, DOMcontext?: Element | Document): void;

  switchesSelectors(selectors: string[], fromEl: Element | Document, toEl: Element | Document, options: Pjax.IOptions): void;

  latestChance(href: string): void;

  onSwitch(): void;

  loadContent(html: string, options: Pjax.IOptions): void;

  abortRequest(request: XMLHttpRequest): void;

  doRequest(location: string, options: Pjax.IOptions | null,
    callback: (requestText: string, request: XMLHttpRequest, href: string) => void): XMLHttpRequest;

  handleResponse(requestText: string, request: XMLHttpRequest, href: string, options?: Pjax.IOptions): void;

  loadUrl(href: string, options?: Pjax.IOptions): void;

  afterAllSwitches: VoidFunction;
}

declare namespace Pjax {
  export interface IOptions {
    elements: string;

    selectors: string[];

    switches: StringKeyedObject<Switch>;

    switchesOptions: StringKeyedObject;

    history: boolean;

    scrollTo: number | [number, number] | false;

    scrollRestoration: boolean;

    cacheBust: boolean;

    timeout: number;

    currentUrlFullReload: boolean;
    
    requestOptions?: {
      requestUrl?: string;
      requestMethod?: string;
      requestParams?: IRequestParams[];
    }
  }

  export type Switch = (oldEl: Element, newEl: Element, options?: IOptions, switchesOptions?: StringKeyedObject) => void;

  export interface IRequestParams {
    name: string,
    value: string
  }
}

interface StringKeyedObject<T = any> {
  [key: string]: T
}

declare enum DefaultSwitches {
  innerHTML = "innerHTML",
  outerHTML = "outerHTML"
}

export = Pjax;
