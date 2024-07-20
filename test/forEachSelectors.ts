import chai from "chai";
import "./jsdom";
import forEachSelectors from "../src/forEachSelectors";

const should = chai.should();

const cb =  (el) =>{
  el.className = "modified";
};

describe("forEachSelectors", () => {
  it("test forEachSelector", () => {
    forEachSelectors(["html", "body"], cb);
    document.documentElement.className.should.equal("modified");
    document.body.className.should.equal("modified");

    document.documentElement.className = "";
    document.body.className = "";

    forEachSelectors(["html", "body"], cb, null, document.documentElement);

    document.documentElement.className.should.equal("");
    document.body.className.should.equal("modified");
  });
});
