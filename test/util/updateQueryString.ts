import chai from "chai";
import "../jsdom";
import updateQueryString from "../../src/util/updateQueryString";

const should = chai.should();

describe("updateQueryString", () => {
  it("test update query string method", () => {
    const url = "http://example.com";
    let updatedUrl = updateQueryString(url, "foo", "bar");

    url.should.not.equal(updatedUrl);
    updatedUrl.should.equal(url + "?foo=bar");

    updatedUrl = updateQueryString(updatedUrl, "foo", "baz");
    updatedUrl.should.equal(url + "?foo=baz");

    updatedUrl = updateQueryString(updatedUrl, "bar", "");
    updatedUrl.should.equal(url + "?foo=baz&bar=");
  });
});
