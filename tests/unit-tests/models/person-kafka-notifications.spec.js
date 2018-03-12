const sinon = require("sinon"),
  should = require("should"),
  httpStatusCodes = require('http-status-codes'),
  util = require("util"),
  uuid = require("uuid"),
  logger = require('../../../app/helpers/logger'),
  config = require('../../../app/config/persons-config'),
  kafkaProducer = require('../../../app/connectors/kafka-producer'),
  personKafkaNotifications = require('../../../app/models/person-kafka-notifications');

describe("person-kafka-notifications", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("notifyDeletion", () => {
    const kafkaDeleteNotificationTopic = uuid.v4();
    beforeEach(() => {
      sandbox.stub(config, 'kafkaDeleteNotificationTopic').value(kafkaDeleteNotificationTopic);
    });

    describe("successful", () => {
      [
        {name: "result contains data", result: {data: uuid.v4()}},
        {name: "result does not contain data", result: undefined},
      ].forEach((test) => {
        it("should resolve successfully with no data", () => {
          const personId = uuid.v4();
          const requestId = uuid.v4();

          const kafkaProducerStub = sandbox.stub(kafkaProducer, 'send').resolves(test.result);
          const loggerErrorStub = sandbox.stub(logger, 'error');

          const expectedKafkaMessage = {
            personId: personId,
            requestId: requestId
          };

          return personKafkaNotifications.notifyDeletion(personId, requestId).should.be.fulfilled()
          .then((result) => {
            should.not.exists(result);

            kafkaProducerStub.callCount.should.equal(1);
            kafkaProducerStub.getCall(0).args.should.deepEqual([kafkaDeleteNotificationTopic, expectedKafkaMessage]);

            loggerErrorStub.callCount.should.equal(0);
          });
        });
      });
    });

    describe("failures", () => {
      it("should reject with error message", () => {
        const personId = uuid.v4();
        const requestId = uuid.v4();

        const kafkaError = {
          message: uuid.v4(),
          something: uuid.v4()
        };

        const kafkaProducerStub = sandbox.stub(kafkaProducer, 'send').rejects(kafkaError);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        const expectedKafkaMessage = {
          personId: personId,
          requestId: requestId
        };

        const expectedError = {
          type: "KAFKA_NOTIFICATION_DELETE_PERSON",
          code: httpStatusCodes.INTERNAL_SERVER_ERROR,
          message: kafkaError.message
        };

        return personKafkaNotifications.notifyDeletion(personId, requestId).should.be.rejected()
        .then((error) => {
          should.deepEqual(error, expectedError);

          kafkaProducerStub.callCount.should.equal(1);
          kafkaProducerStub.getCall(0).args.should.deepEqual([kafkaDeleteNotificationTopic, expectedKafkaMessage]);

          loggerErrorStub.callCount.should.equal(1);
          loggerErrorStub.getCall(0).args.should.deepEqual(["Failed to send notification: %j", kafkaError]);
        });
      });
    });
  });

});
