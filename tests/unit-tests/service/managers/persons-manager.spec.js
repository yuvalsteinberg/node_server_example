const sinon = require("sinon"),
  should = require("should"),
  _ = require('lodash'),
  util = require("util"),
  uuid = require("uuid"),
  logger = require('../../../../app/helpers/logger'),
  personModel = require('../../../../app/models/person'),
  personKafkaNotifications = require('../../../../app/models/person-kafka-notifications'),
  personsManager = require('../../../../app/service/managers/persons-manager');

describe("persons-manager", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("getPerson", () => {
    describe("successful", () => {
      it("should return a person model object", () => {
        const personId = uuid.v4();
        const requestId = uuid.v4();

        const personResponse = {
          personId: uuid.v4(),
          name: uuid.v4(),
          children: [
            uuid.v4(),
            uuid.v4(),
          ],
          somethingMadeUp: uuid.v4()
        };

        const expectedResponse = _.clone(personResponse);

        const personConnectorStub = sandbox.stub(personModel, 'getPerson').resolves(personResponse);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return personsManager.getPerson(personId, requestId).should.be.fulfilled()
        .then((result) => {
          should.deepEqual(result, expectedResponse);

          personConnectorStub.callCount.should.equal(1);
          personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);

          loggerErrorStub.callCount.should.equal(0);
        });
      });
    });

    describe("failures", () => {
      it("should reject", () => {
        const personId = uuid.v4();
        const requestId = uuid.v4();

        const personError = {
          code: uuid.v4(),
          somethingMadeUp: uuid.v4()
        };

        const personConnectorStub = sandbox.stub(personModel, 'getPerson').rejects(personError);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return personsManager.getPerson(personId, requestId).should.be.rejected()
        .then((error) => {
          should.deepEqual(error, personError);

          personConnectorStub.callCount.should.equal(1);
          personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);

          loggerErrorStub.callCount.should.equal(1);
          loggerErrorStub.getCall(0).args.should.deepEqual(["Failed to get a person", error]);
        });
      });
    });
  });

  describe("deletePerson", () => {
    describe("successful", () => {
      [
        {name: "no result from delete", deleteResult: false},
        {name: "has result from delete", deleteResult: true},
      ].forEach((test) => {
        it("should return a person model object", () => {
          const personId = uuid.v4();
          const requestId = uuid.v4();

          const personResponse = test.deleteResult ? {
            personId: uuid.v4(),
            name: uuid.v4(),
            children: [
              uuid.v4(),
              uuid.v4(),
            ],
            somethingMadeUp: uuid.v4()
          } : undefined;

          const personConnectorStub = sandbox.stub(personModel, 'deletePerson').resolves(personResponse);
          const personKafkaNotificationsStub = sandbox.stub(personKafkaNotifications, 'notifyDeletion').resolves({partition: 1});
          const loggerErrorStub = sandbox.stub(logger, 'error');

          return personsManager.deletePerson(personId, requestId).should.be.fulfilled()
          .then((result) => {
            should.not.exists(result);

            personConnectorStub.callCount.should.equal(1);
            personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);

            personKafkaNotificationsStub.callCount.should.equal(1);
            personKafkaNotificationsStub.getCall(0).args.should.deepEqual([personId, requestId]);

            loggerErrorStub.callCount.should.equal(0);
          });
        });
      });
    });

    describe("failures", () => {
      it("deletion fails - should reject", () => {
        const personId = uuid.v4();
        const requestId = uuid.v4();

        const personError = {
          code: uuid.v4(),
          somethingMadeUp: uuid.v4()
        };

        const personConnectorStub = sandbox.stub(personModel, 'deletePerson').rejects(personError);
        const personKafkaNotificationsStub = sandbox.stub(personKafkaNotifications, 'notifyDeletion').resolves({partition: 1});
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return personsManager.deletePerson(personId, requestId).should.be.rejected()
        .then((error) => {
          should.deepEqual(error, personError);

          personConnectorStub.callCount.should.equal(1);
          personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);

          personKafkaNotificationsStub.callCount.should.equal(0);

          loggerErrorStub.callCount.should.equal(1);
          loggerErrorStub.getCall(0).args.should.deepEqual(["Failed to delete a person", error]);
        });
      });

      it("kafka notification fails - should resolve with a logger error", () => {
        const personId = uuid.v4();
        const requestId = uuid.v4();

        const personResponse = {
          personId: uuid.v4(),
          name: uuid.v4(),
          children: [
            uuid.v4(),
            uuid.v4(),
          ],
          somethingMadeUp: uuid.v4()
        };

        const personKafkaNotificationError = {
          code: uuid.v4()
        };

        const personConnectorStub = sandbox.stub(personModel, 'deletePerson').resolves(personResponse);
        const personKafkaNotificationsStub = sandbox.stub(personKafkaNotifications, 'notifyDeletion').rejects(personKafkaNotificationError);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return personsManager.deletePerson(personId, requestId).should.be.fulfilled()
        .then((result) => {
          should.not.exists(result);

          personConnectorStub.callCount.should.equal(1);
          personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);

          personKafkaNotificationsStub.callCount.should.equal(1);
          personKafkaNotificationsStub.getCall(0).args.should.deepEqual([personId, requestId]);

          loggerErrorStub.callCount.should.equal(1);
          loggerErrorStub.getCall(0).args.should.deepEqual([{personId, requestId}, "Failed to send delete notification for message with error %j", personKafkaNotificationError]);
        });
      });

    });
  });

  describe("getPersonChildren", () => {
    const personId = uuid.v4();
    const requestId = uuid.v4();

    const child1Id = uuid.v4();
    const child2Id = uuid.v4();

    const personResponse = {
      personId: uuid.v4(),
      name: uuid.v4(),
      children: [
        child1Id,
        child2Id,
      ],
      somethingMadeUp: uuid.v4()
    };

    const child1Response = {
      personId: uuid.v4(),
      name: uuid.v4(),
      children: [
        uuid.v4(),
        uuid.v4(),
        uuid.v4(),
      ],
      somethingMadeUp: uuid.v4()
    };

    const child2Response = {
      personId: uuid.v4(),
      name: uuid.v4(),
      children: [
      ]
    };

    describe("successful - should return the person's children array", () => {
      it("has children", () => {
        const expectedResponse = [child1Response, child2Response];

        const personConnectorStub = sandbox.stub(personModel, 'getPerson')
        .onFirstCall().resolves(personResponse)
        .onSecondCall().resolves(child1Response)
        .onThirdCall().resolves(child2Response);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return personsManager.getPersonChildren(personId, requestId).should.be.fulfilled()
        .then((result) => {
          should.deepEqual(result.sort(), expectedResponse.sort()); // Order not important

          personConnectorStub.callCount.should.equal(3);
          personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);
          personConnectorStub.withArgs(personId, requestId).calledOnce.should.equal(true);
          personConnectorStub.withArgs(child1Id, requestId).calledOnce.should.equal(true);
          personConnectorStub.withArgs(child2Id, requestId).calledOnce.should.equal(true);

          loggerErrorStub.callCount.should.equal(0);
        });
      });

      [
        {
          name: "no children",
          children: [],
          expectedResponse: []
        },
        {
          name: "undefined children field",
          children: undefined,
          expectedResponse: []
        },
      ].forEach((test) => {
        it(test.name, () => {
          const testPersonResponse = _.clone(personResponse);
          testPersonResponse.children = test.children;

          const personConnectorStub = sandbox.stub(personModel, 'getPerson')
          .onFirstCall().resolves(testPersonResponse)
          .onSecondCall().resolves(child1Response)
          .onThirdCall().resolves(child2Response);
          const loggerErrorStub = sandbox.stub(logger, 'error');

          return personsManager.getPersonChildren(personId, requestId).should.be.fulfilled()
          .then((result) => {
            should.deepEqual(result, []);

            personConnectorStub.callCount.should.equal(1);
            personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);

            loggerErrorStub.callCount.should.equal(0);
          });
        });
      });
    });

    describe("failures - should reject", () => {
      const personError = {
        code: uuid.v4(),
        somethingMadeUp: uuid.v4()
      };

      it("when initial person fails without getting children", () => {
        const personConnectorStub = sandbox.stub(personModel, 'getPerson')
        .onFirstCall().rejects(personError)
        .onSecondCall().resolves(child1Response)
        .onThirdCall().resolves(child2Response);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return personsManager.getPersonChildren(personId, requestId).should.be.rejected()
        .then((error) => {
          should.deepEqual(error, personError);

          personConnectorStub.callCount.should.equal(1);
          personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);

          loggerErrorStub.callCount.should.equal(1);
          loggerErrorStub.getCall(0).args.should.deepEqual(["Failed to get a person's children", error]);
        });
      });

      it("when one of the children fails", () => {
        const personConnectorStub = sandbox.stub(personModel, 'getPerson')
        .onFirstCall().resolves(personResponse)
        .onSecondCall().rejects(personError)
        .onThirdCall().resolves(child2Response);
        const loggerErrorStub = sandbox.stub(logger, 'error');

        return personsManager.getPersonChildren(personId, requestId).should.be.rejected()
        .then((error) => {
          should.deepEqual(error, personError);

          personConnectorStub.callCount.should.equal(3);
          personConnectorStub.getCall(0).args.should.deepEqual([personId, requestId]);
          personConnectorStub.withArgs(personId, requestId).calledOnce.should.equal(true);
          personConnectorStub.withArgs(child1Id, requestId).calledOnce.should.equal(true);
          personConnectorStub.withArgs(child2Id, requestId).calledOnce.should.equal(true);

          loggerErrorStub.callCount.should.equal(1);
          loggerErrorStub.getCall(0).args.should.deepEqual(["Failed to get a person's children", error]);
        });
      });
    });
  });
});
