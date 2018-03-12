const should = require("should"),
  serviceUtilsManager = require('../../../../app/service/managers/server-utils-manager');

describe("service-utils-manager", () => {
  describe("status", () => {
    it("should resolve successfully", () => {
      const expectedResult = {
        status: "OK"
      };

      return serviceUtilsManager.status().should.be.fulfilled()
      .then((result) => {
        should.deepEqual(result, expectedResult);
      });
    });
  });
});
