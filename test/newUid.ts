import chai from "chai";
import newUid from "../src/newUid";

const should = chai.should();

describe("newUid", () => {
  it("test uniqueid", () => {
    const a = newUid();
    const b = newUid();
    a.should.not.equal(b);
  });
});
