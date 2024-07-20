import chai from "chai";
import "../jsdom";
import parseElement from "../../src/proto/parseElement";

const should = chai.should();

const pjax = {
  attachLink: () => true,
};

describe("parseElement", () => {
  it("test parse element prototype method", () => {
    should.not.throw(() => {
      const a = document.createElement("a");
      parseElement.call(pjax, a);
    });
    should.throw(() => {
      const el = document.createElement("div");
      parseElement.call(pjax, el);
    });
  });
});
