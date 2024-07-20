import chai from "chai";
import "../jsdom";
import contains from "../../src/util/contains";

const should = chai.should();

describe("contains", () => {
  it("test contains function", () => {
    const tempDoc = document.implementation.createHTMLDocument();
    tempDoc.body.innerHTML =
      "<div><p id='el' class='js-Pjax'></p></div><span></span>";
    let selectors = ["div"];
    const el = tempDoc.body.querySelector("#el")!;
    contains(tempDoc, selectors, el).should.equal(true);

    selectors = ["span"];

    contains(tempDoc, selectors, el).should.equal(false);
  });
});
