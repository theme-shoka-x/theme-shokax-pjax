import chai from "chai";
import "./jsdom";
import parseOptions from "../src/parseOptions";

const should = chai.should();

describe("parseOptions", () => {
  it('test parse initialization options function - default options', () => {
    const pjax = {
      options: parseOptions({})
    };
    pjax.options.elements.should.equal("a[href]");
    pjax.options.selectors.length.should.equal(2);
    pjax.options.selectors[0].should.equal("title");
    pjax.options.selectors[1].should.equal(".js-Pjax");

    pjax.options.switches.should.be.an("object");
    Object.keys(pjax.options.switches).length.should.equal(2);

    pjax.options.switchesOptions.should.be.an("object");
    Object.keys(pjax.options.switchesOptions).length.should.equal(0);

    pjax.options.history.should.equal(true);
    pjax.options.scrollTo.should.equal(0);
    pjax.options.scrollRestoration.should.equal(true);
    pjax.options.cacheBust.should.equal(true);
    pjax.options.currentUrlFullReload.should.equal(false);
  });

  it('test parse initialization options function - scrollTo remains false', () => {
    const pjax = {
      options: parseOptions({ scrollTo: false })
    };
    pjax.options.scrollTo.should.equal(false);
  });
});