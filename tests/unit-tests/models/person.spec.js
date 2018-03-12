const sinon = require("sinon"),
  should = require("should"),
  HttpStatus = require('http-status-codes'),
  util = require("util"),
  uuid = require("uuid"),
  logger = require('../../../app/helpers/logger'),
  personConnector = require("../../../app/connectors/persons-connector"),
  person = require('../../../app/models/person');

describe("person", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  const errorResponsesScenarios = [
    {
      errorCode: HttpStatus.BAD_REQUEST,
      errorMessage: uuid.v4(),
      resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
      resultMessage: "Unexpected error"
    },
    {
      errorCode: HttpStatus.UNAUTHORIZED,
      errorMessage: uuid.v4(),
      resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
      resultMessage: "Unexpected error"
    },
    {
      errorCode: HttpStatus.NOT_FOUND,
      errorMessage: uuid.v4(),
      resultCode: HttpStatus.NOT_FOUND,
      resultMessage: "person not found"
    },
    {
      errorCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorMessage: uuid.v4(),
      resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
      resultMessage: "Unexpected error"
    },
    {
      errorCode: HttpStatus.BAD_GATEWAY,
      errorMessage: uuid.v4(),
      resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
      resultMessage: "Unexpected error"
    },
    {
      errorCode: undefined,
      errorMessage: undefined,
      resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
      resultMessage: "Unexpected error"
    },
  ];

  describe("getPerson", () => {
    const GET_PERSON_PATH = "v1/persons/%s";

    describe("successful", () => {
      it("should return a person model object", () => {
        const personId = uuid.v4();
        const requestId = uuid.v4();

        const personConnectorResponse = {
          person_id: uuid.v4(),
          personId: uuid.v4(),
          name: uuid.v4(),
          children: [
            uuid.v4(),
            uuid.v4(),
          ]
        };

        const expectedResponse = {
          personId: personConnectorResponse.person_id,
          name: personConnectorResponse.name,
          children: personConnectorResponse.children
        };

        const expectedPersonConnectorsArgs = {
          method: "GET",
          serviceUrl: util.format(GET_PERSON_PATH, personId),
          headers: {
            requestId: requestId
          }
        };

        const personConnectorStub = sandbox.stub(personConnector, 'execute').resolves(personConnectorResponse);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return person.getPerson(personId, requestId).should.be.fulfilled()
        .then((result) => {
          should.deepEqual(result, expectedResponse);

          personConnectorStub.callCount.should.equal(1);
          personConnectorStub.getCall(0).args.should.deepEqual([expectedPersonConnectorsArgs]);

          loggerErrorStub.callCount.should.equal(0);
        });
      });
    });

    describe("failures", () => {
      errorResponsesScenarios.forEach((test) => {
        it(util.format("should reject with %s when receives %s errro", test.resultCode, test.errorCode), () => {
          const personId = uuid.v4();
          const requestId = uuid.v4();

          const expectedError = {
            code: test.errorCode,
            message: test.errorMessage,
            extra: "to be ignored"
          };

          const expectedResult = {
            type: "GET_PERSON",
            code: test.resultCode,
            message: test.resultMessage
          };

          const expectedPersonConnectorsArgs = {
            method: "GET",
            serviceUrl: util.format(GET_PERSON_PATH, personId),
            headers: {
              requestId: requestId
            }
          };

          const personConnectorStub = sandbox.stub(personConnector, 'execute').rejects(expectedError);
          const loggerErrorStub = sandbox.stub(logger, 'error');

          return person.getPerson(personId, requestId).should.be.rejected()
          .then((error) => {
            should.deepEqual(error, expectedResult);

            personConnectorStub.callCount.should.equal(1);
            personConnectorStub.getCall(0).args.should.deepEqual([expectedPersonConnectorsArgs]);

            loggerErrorStub.callCount.should.equal(1);
          });
        });
      });

    });
  });

  describe("deletePerson", () => {
    const DELETE_PERSON_PATH = "v2/persons/%s";

    describe("successful", () => {
      it("should return a person model object", () => {
        const personId = uuid.v4();
        const requestId = uuid.v4();

        const personConnectorResponse = {
          person_id: uuid.v4(),
          personId: uuid.v4(),
          name: uuid.v4(),
          children: [
            uuid.v4(),
            uuid.v4(),
          ]
        };

        const expectedPersonConnectorsArgs = {
          method: "DELETE",
          serviceUrl: util.format(DELETE_PERSON_PATH, personId),
          headers: {
            requestId: requestId
          }
        };

        const personConnectorStub = sandbox.stub(personConnector, 'execute').resolves(personConnectorResponse);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return person.deletePerson(personId, requestId).should.be.fulfilled()
        .then((result) => {
          should.not.exists(result);

          personConnectorStub.callCount.should.equal(1);
          personConnectorStub.getCall(0).args.should.deepEqual([expectedPersonConnectorsArgs]);

          loggerErrorStub.callCount.should.equal(0);
        });
      });
    });

    describe("failures", () => {
      errorResponsesScenarios.forEach((test) => {
        it(util.format("should reject with %s when receives %s errro", test.resultCode, test.errorCode), () => {
          const personId = uuid.v4();
          const requestId = uuid.v4();

          const expectedError = {
            code: test.errorCode,
            message: test.errorMessage,
            extra: "to be ignored"
          };

          const expectedResult = {
            type: "DELETE_PERSON",
            code: test.resultCode,
            message: test.resultMessage
          };

          const expectedPersonConnectorsArgs = {
            method: "DELETE",
            serviceUrl: util.format(DELETE_PERSON_PATH, personId),
            headers: {
              requestId: requestId
            }
          };

          const personConnectorStub = sandbox.stub(personConnector, 'execute').rejects(expectedError);
          const loggerErrorStub = sandbox.stub(logger, 'error');

          return person.deletePerson(personId, requestId).should.be.rejected()
          .then((error) => {
            should.deepEqual(error, expectedResult);

            personConnectorStub.callCount.should.equal(1);
            personConnectorStub.getCall(0).args.should.deepEqual([expectedPersonConnectorsArgs]);

            loggerErrorStub.callCount.should.equal(1);
          });
        });
      });

    });
  });
});
