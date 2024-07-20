import chai from "chai";
import "./jsdom";
import forEachEls from "../src/forEachEls";

const should = chai.should();

const div = document.createElement("div");
const span = document.createElement("span");
const cb = (el) => {
  el.innerHTML = "boom";
};

describe("forEachEls", () => {
  it("test forEachEls on one element", () => {
    div.innerHTML = "div tag";
    forEachEls(div, cb);
    div.innerHTML.should.equal("boom");
  });

  it("test forEachEls on an array", () => {
    div.innerHTML = "div tag";
    span.innerHTML = "span tag";

    forEachEls([div, span], cb);
    div.innerHTML.should.equal("boom");
    span.innerHTML.should.equal("boom");
  });

  it("test forEachEls on a NodeList", () => {
    div.innerHTML = "div tag";
    span.innerHTML = "span tag";

    const frag = document.createDocumentFragment();
    frag.appendChild(div);
    frag.appendChild(span);
    forEachEls(frag.childNodes, cb);
    div.innerHTML.should.equal("boom");
    span.innerHTML.should.equal("boom");
  });
});
