import chai from "chai";
import "./jsdom";
import evalScript from "../src/evalScript";

const should = chai.should();

describe("evalScript", () => {
  it("test evalScript method", () => {
    document.body.className = "";
    const script = document.createElement("script");
    script.innerHTML = "document.body.className = 'executed'";

    document.body.className.should.equal("");
    evalScript(script);
    document.body.className.should.equal("executed");

    script.innerHTML = "document.write('failure')";

    const bodyText = "document.write hasn't been executed";
    // @ts-expect-error
    document.body.text = bodyText;
    evalScript(script);
    // @ts-expect-error
    document.body.text.should.equal(bodyText);
  });

  it("evalScript should not throw an error if the script removed itself", () => {
    const script = document.createElement("script");
    script.id = "myScript";
    script.innerHTML =
      "const script = document.querySelector('#myScript');" +
      "script.parentNode.removeChild(script);";

    try {
      evalScript(script);
    } catch (e) {
      should.fail("evalScript should not throw an error if the script removed itself");
    }
  });
});
