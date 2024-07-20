import chai from "chai";
import "../jsdom";
import attachLink from "../../src/proto/attachLink";
import { on, trigger } from "../../src/events/events";

const should = chai.should();

const attr = "data-pjax-state";

describe("attachLink", () => {
  it("test attachLink method", () => {
    const a = document.createElement("a");
    let loadUrlCalled = false;

    attachLink.call(
      {
        options: {},
        loadUrl: () => {
          loadUrlCalled = true;
        },
      },
      a
    );

    const internalUri =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      window.location.search;

    a.href = internalUri;
    trigger(a, "click", { metaKey: true });
    "modifier".should.equal(a.getAttribute(attr));

    a.href = "http://external.com/";
    trigger(a, "click");
    "external".should.equal(a.getAttribute(attr));

    window.location.hash = "#anchor";
    a.href = internalUri + "#anchor";
    trigger(a, "click");
    "anchor".should.equal(a.getAttribute(attr));

    a.href = internalUri + "#another-anchor";
    trigger(a, "click");
    "anchor".should.equal(a.getAttribute(attr));
    window.location.hash = "";

    a.href = internalUri + "#";
    trigger(a, "click");
    "anchor-empty".should.equal(a.getAttribute(attr));

    a.href =
      window.location.protocol + "//" + window.location.host + "/internal";
    trigger(a, "click");
    "load".should.equal(a.getAttribute(attr));
    loadUrlCalled.should.equal(true);
  });

  it("test attach link preventDefaulted events", () => {
    let loadUrlCalled = false;
    const a = document.createElement("a");

    // This needs to be before the call to attachLink()
    on(a, "click", (event) => {
      event.preventDefault();
    });

    attachLink.call(
      {
        options: {},
        loadUrl: () => {
          loadUrlCalled = true;
        },
      },
      a
    );

    a.href = "#";
    trigger(a, "click");

    loadUrlCalled.should.equal(false);
  });

  it("test options are not modified by attachLink", () => {
    const a = document.createElement("a");
    const options = { foo: "bar" };
    const loadUrl = () => {};

    attachLink.call({ options: options, loadUrl: loadUrl }, a);

    a.href =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      window.location.search;

    trigger(a, "click");

    Object.keys(options).length.should.equal(1);
    options.foo.should.equal("bar");
  });

  it("test link triggered by keyboard", (done) => {
    const a = document.createElement("a");
    const pjax = {
      options: {},
      loadUrl: () => {
        a.getAttribute(attr)!.should.equal("load");
        done();
      },
    };

    attachLink.call(pjax, a);

    a.href =
      window.location.protocol + "//" + window.location.host + "/internal";

    trigger(a, "keyup", { keyCode: 14 });
    a.getAttribute(attr)!.should.equal("");

    trigger(a, "keyup", { keyCode: 13, metaKey: true });
    a.getAttribute(attr)!.should.equal("modifier");

    trigger(a, "keyup", { keyCode: 13 });
  });

  it("test link with the same URL as the current one, when currentUrlFullReload set to true", (done) => {
    window.location.href = "https://example.org/";
    const a = document.createElement("a");
    const pjax = {
      options: {
        currentUrlFullReload: true,
      },
      reload: () => {
        done();
      },
      loadUrl: () => {
        should.fail("loadUrl() was called wrongly");
        done();
      },
    };

    attachLink.call(pjax, a);
    a.href = window.location.href;
    trigger(a, "click");
    a.getAttribute(attr)!.should.equal("reload");
  });
});
