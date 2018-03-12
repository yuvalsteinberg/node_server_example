const sinon = require("sinon"),
  should = require("should"),
  _ = require('lodash'),
  util = require("util"),
  uuid = require("uuid"),
  personConfig = require("../../../app/config/persons-config"),
  logger = require("../../../app/helpers/logger"),
  restConnector = require("../../../app/connectors/rest-connector"),
  personsConnector = require("../../../app/connectors/persons-connector");

describe("persons-connector", () => {
  let sandbox;
  const requestTimeout = uuid.v4();
  const personsServiceUrl = uuid.v4();
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(personConfig, "serviceRequestTimeout").value(requestTimeout);
    sandbox.stub(personConfig, "serviceUrl").value(personsServiceUrl);
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
            path: uuid.v4(),
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
            serviceRequestTimeout: uuid.v4(),
          }
        },
        {
          name: "partial data with extra parameters",
          data: {
            method: "POST",
            path: uuid.v4(),
            headers: uuid.v4(),
            body: {
              something: uuid.v4(),
              value: uuid.v4(),
            },
            requestId: uuid.v4(),
            somethingNested: {
              test: uuid.v4()
            },
          }
        },
        {
          name: "minimal data",
          data: {
            method: "POST",
            path: uuid.v4(),
          }
        },
      ].forEach((test) => {
        it(util.format("should send request as expected with all %s", test.name), () => {
          const expectedRequestValues = {
            method: test.data.method,
            url: personsServiceUrl+"/"+test.data.path,
            body: test.data.body,
            headers: test.data.headers,
            queryString: test.data.queryString,
            requestId: test.data.requestId,
            timeout: requestTimeout
          };

          const expectedResult = {
            demo: true,
            value: 100,
            nested: {
              test: uuid.v4(),
            }
          };

          const restConnectorStub = sandbox.stub(restConnector, 'execute').resolves(expectedResult);
          const loggerErrorStub = sandbox.stub(logger, "error");

          return personsConnector.execute(test.data).should.be.fulfilled()
          .then((result) => {
            result.should.deepEqual(expectedResult);

            restConnectorStub.callCount.should.equal(1);
            restConnectorStub.getCall(0).args.should.deepEqual([expectedRequestValues]);

            loggerErrorStub.callCount.should.equal(0);
          });
        });
      });

    });
  });

  describe("failures", () => {
      it("failure response should reject", () => {
        const data = {
          method: "GET",
          url: uuid.v4(),
        };

        const expectedError = {
          demo: true,
          value: 100,
          nested: {
            test: uuid.v4(),
          },
        };

        const restConnectorStub = sandbox.stub(restConnector, 'execute').rejects(expectedError);
        const loggerErrorStub = sandbox.stub(logger, "error");

        return personsConnector.execute(data).should.be.rejected()
        .then((error) => {
          error.should.deepEqual(expectedError);

          restConnectorStub.callCount.should.equal(1);

          loggerErrorStub.callCount.should.equal(0);
        });
      });
  });
});
