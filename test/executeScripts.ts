import chai from "chai";
import "./jsdom";
import executeScripts from "../src/executeScripts";

const should = chai.should();

describe("executeScripts", () => {
  it("test executeScripts method when the script tag is inside a container", () => {
    document.body.className = "";

    const container = document.createElement("div");
    container.innerHTML = `
    <script>document.body.className = 'executed';</script>
    <script>document.body.className += ' correctly';</script>`;
    document.body.className.should.equal("");
    executeScripts(container);
    document.body.className.should.equal("executed correctly");
  });

  it("test executeScripts method with just a script tag", () => {
    document.body.className = "";

    const script = document.createElement("script");
    script.innerHTML = "document.body.className = 'executed correctly';";
    document.body.className.should.equal("");
    executeScripts(script);
    document.body.className.should.equal("executed correctly");
  });
});
