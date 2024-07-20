import chai from "chai";
import "./jsdom";
import { innerHTML, outerHTML } from "../src/switches";

const should = chai.should();

const noop = () => {};

describe("switches", () => {
  it("test outerHTML switch", () => {
    const doc = document.implementation.createHTMLDocument();

    const container = doc.createElement("div");
    container.innerHTML = "<p id='p'>Original Text</p>";
    doc.body.appendChild(container);

    const p = doc.createElement("p");
    p.innerHTML = "New Text";

    outerHTML.bind({
      onSwitch: noop,
    })(doc.querySelector("p"), p);

    doc.querySelector("p")!.innerHTML.should.equal("New Text");
    doc.querySelector("p")!.id.should.not.equal("p");
  });

  it("test innerHTML switch", () => {
    const doc = document.implementation.createHTMLDocument();

    const container = doc.createElement("div");
    container.innerHTML = "<p id='p'>Original Text</p>";
    doc.body.appendChild(container);

    const p = doc.createElement("p");
    p.innerHTML = "New Text";
    p.className = "p";

    innerHTML.bind({
      onSwitch: noop,
    })(doc.querySelector("p"), p);

    doc.querySelector("p")!.innerHTML.should.equal("New Text");
    doc.querySelector("p")!.className.should.equal("p");
    doc.querySelector("p")!.id.should.equal("p");

    p.removeAttribute("class");

    innerHTML.bind({
      onSwitch: noop,
    })(doc.querySelector("p"), p);

    doc.querySelector("p")!.className.should.equal("");
  });
});
