import chai from "chai";
import "./jsdom";
import switchesSelectors from "../src/switchesSelectors";

const should = chai.should();

const noop = () => {};

const pjax = {
  onSwitch: () => {
    console.log("Switched");
  },
  state: {},
  log: noop,
};

describe("switchesSelectors", () => {
  it("test switchesSelectors", () => {
    const tmpEl = document.implementation.createHTMLDocument();

    // a div container is used because swapping the containers
    // will generate a new element, so things get weird
    // using "body" generates a lot of testling cruft that I don't
    // want so let's avoid that
    const container = document.createElement("div");
    container.innerHTML = "<p>Original Text</p><span>No Change</span>";
    document.body.appendChild(container);

    const container2 = tmpEl.createElement("div");
    container2.innerHTML = "<p>New Text</p><span>New Span</span>";
    tmpEl.body.appendChild(container2);

    switchesSelectors.bind(pjax)(
      {}, // switches
      {}, // switchesOptions
      ["p"], // selectors,
      tmpEl, // fromEl
      document, // toEl,
      {} // options
    );

    container.innerHTML.should.equal("<p>New Text</p><span>No Change</span>");
  });

  it("test switchesSelectors when number of elements don't match", () => {
    const newTempDoc = document.implementation.createHTMLDocument();
    const originalTempDoc = document.implementation.createHTMLDocument();
  
    // a div container is used because swapping the containers
    // will generate a new element, so things get weird
    // using "body" generates a lot of testling cruft that I don't
    // want so let's avoid that
    const container = originalTempDoc.createElement("div");
    container.innerHTML = "<p>Original text</p><span>No change</span>";
    originalTempDoc.body.appendChild(container);
  
    const container2 = newTempDoc.createElement("div");
    container2.innerHTML =
      "<p>New text</p><p>More new text</p><span>New span</span>";
    newTempDoc.body.appendChild(container2);
  
    const switchSelectorsFn = switchesSelectors.bind(
      pjax,
      {}, // switches
      {}, // switchesOptions
      ["p"], // selectors,
      newTempDoc, // fromEl
      originalTempDoc, // toEl,
      {} // options
    );
    should.Throw(switchSelectorsFn);
  
  });
});
