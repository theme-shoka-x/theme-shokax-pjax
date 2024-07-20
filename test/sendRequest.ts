import chai from "chai";
import "./jsdom";
import sendRequest from "../src/sendRequest";

const should = chai.should();

describe("sendRequest", () => {
  it("test xhr request - request is made, gets a result, and is cache-busted", () => {
    const url = "https://httpbin.org/get";
    const r = sendRequest(url, { cacheBust: true }, (result: any) => {
      r.responseURL.indexOf("?").should.equal(url.length);
      try {
        result = JSON.parse(result!);
      } catch (e) {
        should.fail("xhr doesn't get a JSON response");
      }
      result.should.be.an("object");
    });
  });
  it("test xhr request - request is not cache-busted when configured not to be", () => {
    const url = "https://httpbin.org/get";
    const r = sendRequest(url, {}, () => {
      r.responseURL.should.equal(url);
    });
  });
  it("request headers are sent properly", () => {
    const url = "https://httpbin.org/headers";
    const options = {
      selectors: ["div.pjax", "div.container"],
    };

    sendRequest(url, options, (responseText) => {
      const headers = JSON.parse(responseText!).headers;

      headers["X-Requested-With"].should.equal("XMLHttpRequest");
      headers["X-Pjax"].should.equal("true");
      headers["X-Pjax-Selectors"].should.equal('["div.pjax","div.container"]');
    });
  });
  it("HTTP status codes other than 200 are handled properly", () => {
    const url = "https://httpbin.org/status/400";

    sendRequest(url, {}, (responseText, request) => {
      should.equal(responseText, null);
      request.status.should.equal(400);
    });
  });
  it("GET query data is sent properly", () => {
    const url = "https://httpbin.org/get";
    const params = [
      {
        name: "test",
        value: "1",
      },
    ];
    const options = {
      requestOptions: {
        requestParams: params,
      },
    };

    sendRequest(url, options, (responseText) => {
      const response = JSON.parse(responseText!);
      response.args[params[0].name].should.equal(params[0].value);
    });
  });

  it("XHR timeout is handled properly", () => {
    const url = "https://httpbin.org/delay/5";
    const options = {
      timeout: 1000,
    };

    sendRequest(url, options, (responseText) => {
      should.equal(responseText, null);
    });
  });
});
