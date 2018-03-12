const sinon = require("sinon"),
  should = require("should"),
  rewire = require('rewire'),
  util = require("util"),
  uuid = require("uuid"),
  httpStatusCodes = require('http-status-codes'),
  logger = require("../../../app/helpers/logger"),
  kafkaProducer = rewire("../../../app/connectors/kafka-producer");

describe("kafka-producer", () => {
  const kafkaProducerMock = {
    send: () => {}
  };

  let sandbox;
  let reverts = [];
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    reverts.push(kafkaProducer.__set__('producer', kafkaProducerMock));
  });
  afterEach(() => {
    sandbox.restore();
    reverts.forEach((revert) => revert());
    reverts = [];
  });

  describe("init", () => {
  });

  describe("send", () => {
    describe("successful", () => {
      [
        {name: "undefined result", result: undefined},
        {name: "data result", result: {example: uuid.v4()}},
      ].forEach((test) => {
        it(util.format("should resolve with empty data when kafka returns %s", test.name), () => {
          const inputData = {
            topic: uuid.v4(),
            message: uuid.v4(),
            requestId: uuid.v4()
          };

          const expectedPayload = [
            {
              topic: inputData.topic,
              message: inputData.message
            }
          ];

          const producerStub = sandbox.stub(kafkaProducerMock, 'send').callsFake((payload, callback) => (callback(undefined, test.result)));
          const loggerErrorStub = sandbox.stub(logger, "error");

          return kafkaProducer.send(inputData).should.be.fulfilled()
          .then((result) => {
            should.not.exists(result);

            producerStub.callCount.should.equal(1);
            producerStub.getCall(0).args[0].should.deepEqual(expectedPayload);

            loggerErrorStub.callCount.should.equal(0);
          });
        });
      });
    });

    describe("failures", () => {
      it("should reject if failed to push to kafka", () => {
        const inputData = {
          topic: uuid.v4(),
          message: uuid.v4(),
          requestId: uuid.v4()
        };

        const expectedPayload = [
          {
            topic: inputData.topic,
            message: inputData.message
          }
        ];

        const kafkaError = {
          someCode: uuid.v4(),
          someMessage: uuid.v4()
        };

        const expectedError = {
          type: "KAFKA_ERROR",
          code: httpStatusCodes.INTERNAL_SERVER_ERROR,
          message: kafkaError.message,
        };

        const producerStub = sandbox.stub(kafkaProducerMock, 'send').callsFake((payload, callback) => (callback(kafkaError, {something: uuid.v4()})));
        const loggerErrorStub = sandbox.stub(logger, "error");

        return kafkaProducer.send(inputData).should.be.rejected()
        .then((error) => {
          should.deepEqual(error, expectedError);

          producerStub.callCount.should.equal(1);
          producerStub.getCall(0).args[0].should.deepEqual(expectedPayload);

          loggerErrorStub.callCount.should.equal(1);
          loggerErrorStub.getCall(0).args.should.deepEqual([
            {requestId: inputData.requestId, topic: inputData.topic},
            "Failed to push message to kafka: %j",
            kafkaError
          ]);
        });
      });
    });
  });
});
