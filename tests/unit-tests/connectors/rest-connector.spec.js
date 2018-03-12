const sinon = require("sinon"),
  should = require("should"),
  request = require("request-promise"),
  util = require("util"),
  uuid = require("uuid"),
  logger = require("../../../app/helpers/logger"),
  restConnector = require("../../../app/connectors/rest-connector");

describe("rest-connector", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("successful", () => {
    describe("various data inputs", () => {
      [
        {
          name: "full data with extra parameters",
          data: {
            method: "POST",
            url: uuid.v4(),
            headers: uuid.v4(),
            body: {
              something: uuid.v4(),
              value: uuid.v4(),
              inner: {
                test: 123,
                test2: uuid.v4()
              }
            },
            queryString: {
              testValue: uuid.v4(),
              testNumber: 5,
            },
            requestId: uuid.v4(),
            somethingElse: uuid.v4(),
            timeout: uuid.v4(),
          }
        },
        {
          name: "partial data with extra parameters",
          data: {
            method: "POST",
            url: uuid.v4(),
            headers: uuid.v4(),
            body: {
              something: uuid.v4(),
              value: uuid.v4(),
            },
            requestId: uuid.v4(),
            somethingNested: {
              test: uuid.v4()
            },
            timeout: uuid.v4(),
          }
        },
        {
          name: "minimal data",
          data: {
            method: "POST",
            url: uuid.v4(),
          }
        },
      ].forEach((test) => {
        it(util.format("should send request as expected with all %s", test.name), () => {
          const expetedRequestValues = {
            uri: test.data.url,
            body: test.data.body,
            headers: test.data.headers,
            qs: test.data.queryString,
            json: true,
            timeout: test.data.timeout
          };

          const expectedResult = {
            demo: true,
            value: 100,
            nested: {
              test: uuid.v4(),
            }
          };

          const requestStub = sandbox.stub(request, test.data.method.toLowerCase()).resolves(expectedResult);
          const loggerErrorStub = sandbox.stub(logger, "error");

          return restConnector.execute(test.data).should.be.fulfilled()
          .then((result) => {
            result.should.deepEqual(expectedResult);

            requestStub.callCount.should.equal(1);
            requestStub.getCall(0).args.should.deepEqual([expetedRequestValues]);

            loggerErrorStub.callCount.should.equal(0);
          });
        });
      });

    });

    describe('support various methods', () => {
      [
        {method: "get", inputMethod: "get"},
        {method: "post", inputMethod: "POST"},
        {method: "put", inputMethod: "Put"},
        {method: "patch", inputMethod: "PaTcH"},
        {method: "delete", inputMethod: "DELETE"},
      ].forEach((test) => {
        it(test.method.toUpperCase(), () => {
          const data = {
            method: test.inputMethod,
            url: uuid.v4(),
            timeout: uuid.v4()
          };

          const expetedRequestValues = {
            uri: data.url,
            body: undefined,
            headers: undefined,
            qs: undefined,
            json: true,
            timeout: data.timeout
          };

          const expectedResult = {
            demo: true
          };

          const requestStub = sandbox.stub(request, test.method.toLowerCase()).resolves();
          const loggerErrorStub = sandbox.stub(logger, "error");

          return restConnector.execute(data).should.be.fulfilled()
          .then((result) => {
            requestStub.callCount.should.equal(1);
            requestStub.getCall(0).args.should.deepEqual([expetedRequestValues]);

            loggerErrorStub.callCount.should.equal(0);
          });
        });
      });
    });
  });

  describe("failures", () => {
    it("failure response should reject", () => {
      const requestId = uuid.v4();
      const data = {
        method: "GET",
        url: uuid.v4(),
        requestId: requestId
      };

      const expectedError = {
        demo: true,
        value: 100,
        nested: {
          test: uuid.v4(),
        }
      };

      const expetedLoggedData = {
        requestId: requestId,
        error: expectedError
      };

      const requestStub = sandbox.stub(request, data.method.toLowerCase()).rejects(expectedError);
      const loggerErrorStub = sandbox.stub(logger, "error");

      return restConnector.execute(data).should.be.rejected()
      .then((error) => {
        error.should.deepEqual(expectedError);

        requestStub.callCount.should.equal(1);

        loggerErrorStub.callCount.should.equal(1);
        loggerErrorStub.getCall(0).args.should.deepEqual([expetedLoggedData, "Failed with request to %s", data.url])
      });
    });
  });
});
