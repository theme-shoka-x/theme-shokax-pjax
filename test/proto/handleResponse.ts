import chai from "chai";
import "../jsdom";
import handleResponse from "../../src/proto/handleResponse";
import Pjax from "../../src";

const loadContent = Pjax.prototype.loadContent;
const noop = () => {};
const should = chai.should();

const href = "https://example.org/";

describe("handleResponse", () => {
  let storeEventHandler;
  let pjaxErrorEventTriggerTest;

  it("test events triggered when handleResponse(false) is called", (done) => {
    const pjax = {
      options: {
        test: 1,
      },
    };

    const events: string[] = [];

    let i = 0;

    storeEventHandler = (e) => {
      events.push(e.type as string);
      e.test.should.equal(1);
      i++;
      if (i === 2) {
        done();
      }
    };

    document.addEventListener("pjax:complete", storeEventHandler);
    document.addEventListener("pjax:error", storeEventHandler);

    handleResponse.bind(pjax)(false, null);

    events.should.deep.equal(["pjax:complete", "pjax:error"]);

    document.removeEventListener("pjax:complete", storeEventHandler);
    document.removeEventListener("pjax:error", storeEventHandler);
  });

  it("test when handleResponse() is called normally", () => {
    const pjax = {
      options: {
        test: 1,
      },
      loadContent: noop,
      state: {} as any,
    };

    const request = {
      getResponseHeader: noop,
    };

    handleResponse.bind(pjax)("", request, "href");

    delete window.history.state.uid;

    window.history.state.should.deep.equal({
      url: href,
      title: "",
      scrollPos: [0, 0],
    });
    pjax.state.href.should.equal("href");
    Object.keys(pjax.state.options).length.should.equal(2);
    pjax.state.options.request.should.equal(request);
  });

  it("test when handleResponse() is called normally with request.responseURL", () => {
    const pjax = {
      options: {},
      loadContent: noop,
      state: {} as any,
    };

    const request = {
      responseURL: href + "1",
      getResponseHeader: noop,
    };

    handleResponse.bind(pjax)("", request, "");

    pjax.state.href.should.equal(request.responseURL);
  });

  it("test when handleResponse() is called normally with X-PJAX-URL", () => {
    const pjax = {
      options: {},
      loadContent: noop,
      state: {} as any,
    };

    const request = {
      getResponseHeader: (header) => {
        if (header === "X-PJAX-URL") {
          return href + "2";
        }
      },
    };

    handleResponse.bind(pjax)("", request, "");

    pjax.state.href.should.equal(href + "2");
  });

  it("test when handleResponse() is called normally with X-XHR-Redirected-To", () => {
    const pjax = {
      options: {},
      loadContent: noop,
      state: {} as any,
    };

    const request = {
      getResponseHeader: (header) => {
        if (header === "X-XHR-Redirected-To") {
          return href + "3";
        }
      },
    };

    handleResponse.bind(pjax)("", request, "");

    pjax.state.href.should.equal(href + "3");
  });

  it("test when handleResponse() is called normally with a hash", () => {
    const pjax = {
      options: {},
      loadContent: noop,
      state: {} as any,
    };

    const request = {
      responseURL: href + "2",
      getResponseHeader: noop,
    };

    handleResponse.bind(pjax)("", request, href + "1#test");

    pjax.state.href.should.equal(href + "2#test");
  });

  it("test try...catch for loadContent()", () => {
    const pjax = {
      options: {},
      loadContent: () => {
        throw new Error();
      },
      latestChance: () => true,
      state: {},
    };

    const request = {
      getResponseHeader: noop,
    };

    document.removeEventListener("pjax:error", pjaxErrorEventTriggerTest);

    should.not.throw(() => {
      handleResponse.bind(pjax)("", request, "").should.equal(true);
    });
  });

  it("test events triggered when loadContent() is called with a non-string html argument", (done) => {
    const options = {
      test: 1,
    };

    const events: string[] = [];

    let i = 0;

    storeEventHandler = (e) => {
      events.push(e.type);
      e.test.should.equal(1);
      i++;
      if (i === 2) done();
    };

    document.addEventListener("pjax:complete", storeEventHandler);
    document.addEventListener("pjax:error", storeEventHandler);

    // @ts-expect-error
    loadContent(null, options);

    events.should.deep.equal(["pjax:complete", "pjax:error"]);

    document.removeEventListener("pjax:complete", storeEventHandler);
    document.removeEventListener("pjax:error", storeEventHandler);
  });
});
