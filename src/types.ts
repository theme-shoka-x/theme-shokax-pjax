export interface PjaxOptions {
  elements: string;
  selectors: string[];
  switches: Record<string, SwitchFunction>;
  switchesOptions: Record<string, any>;
  history: boolean;
  scrollTo: number | [number, number] | false;
  scrollRestoration: boolean;
  cacheBust: boolean;
  timeout: number;
  currentUrlFullReload: boolean;
  requestOptions?: {
    requestUrl?: string;
    requestMethod?: string;
    requestParams?: RequestParams[];
  };
  request?: XMLHttpRequest; 
  triggerElement?: Element;
  [key: string]: any;
}

export interface RequestParams {
  name: string;
  value: string;
}

export type SwitchFunction = (
  oldEl: Element,
  newEl: Element,
  options?: PjaxOptions,
  switchesOptions?: Record<string, any>
) => void;

export enum DefaultSwitches {
  innerHTML = "innerHTML",
  outerHTML = "outerHTML",
}
