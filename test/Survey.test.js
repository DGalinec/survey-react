const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../Ethereum/compile');

let survey; //formerly 'instance'
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    survey = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [] })
        .send({ from: accounts[0], gas: '1000000' });

    survey.setProvider(provider);
});

describe('Survey contract tests', () => {

    it('contract is deployed on the network', () => {
        assert.ok(survey.options.address);
    });
    
    it("number of choices is equal to 0", async () => {
        const nbChoices = await survey.methods.choicesCount().call();
        assert.equal(nbChoices, 0);
    });

    it("contract manager sets survey question and it emits an event", async () => {
        const managerAdr = await survey.methods.manager().call();
        const receipt = await survey.methods.setSurveyQuestion("Elections 2018").send({ from: managerAdr });
        const readQuestion = await survey.methods.surveyQuestion().call();
        assert.equal(readQuestion, "Elections 2018");

        //test event
        assert.equal(receipt.events.addedQuestionEvent.event, "addedQuestionEvent");
        assert.equal(receipt.events.addedQuestionEvent.returnValues._question, "Elections 2018");
    });

    it("only the contract manager can change the survey question", async () => {
        try {
            await survey.methods.setSurveyQuestion("Monsieur Univers").send({ from: accounts[2] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }
    });

    it("votes for choice 1 and emits event", async () => {
        //add 'choice 1'
        const managerAdr = await survey.methods.manager().call();
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });
        //vote for 'choice 1'
        const voterAdr = accounts[1];
        const receipt = await survey.methods.vote(1).send({ from: voterAdr });
        const choice = await survey.methods.choices(1).call();
        assert.equal(choice[2], 1);
        const voted = await survey.methods.voters(voterAdr).call();
        assert.equal(voted, true);
        //test event
        assert.equal(receipt.events.votedEvent.event, "votedEvent");
        assert.equal(receipt.events.votedEvent.returnValues._choiceId, 1);
    });

    it("throws an exception for invalid choice id", async () => {
        //add 'choice 1'
        const managerAdr = await survey.methods.manager().call();
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });   
        let nbChoices = await survey.methods.choicesCount().call();
        nbChoices = parseInt(nbChoices);
        try {
            await survey.methods.vote(nbChoices+1).send({ from: accounts[1] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        } 
    });

    it("throws an exception for double voting", async () => {
        //add 'choice 1'
        const managerAdr = await survey.methods.manager().call();
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });
        //vote once for 'choice 1'
        const voterAdr = accounts[2]; 
        await survey.methods.vote(1).send({ from: voterAdr });
        let choice = await survey.methods.choices(1).call();
        let beforeCount = parseInt(choice[2]);
        try {
            await survey.methods.vote(1).send({ from: voterAdr });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }
        choice = await survey.methods.choices(1).call();
        let afterCount = parseInt(choice[2]);
        assert.equal(beforeCount - afterCount, 0);
    });

    it("contract manager adds a new choice and emits an event", async () => {
        //add a 'Choice 1'
        const managerAdr = await survey.methods.manager().call();
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });
        //add a 'Choice 2'
        const receipt = await survey.methods.addChoice("Choice 2").send({ from: managerAdr, gas: 3000000 });
        let nbChoices = await survey.methods.choicesCount().call();
        //check number of choices - should be 2
        nbChoices = parseInt(nbChoices);
        assert.equal(nbChoices, 2);

        const choice = await survey.methods.choices(nbChoices).call();
        assert.equal(choice[0], nbChoices);
        assert.equal(choice[1], "Choice 2");
        assert.equal(choice[2], 0);
        assert.equal(choice[3], false);

        //test event
        assert.equal(receipt.events.addedChoiceEvent.event, "addedChoiceEvent");
        assert.equal(receipt.events.addedChoiceEvent.returnValues._newChoice, "Choice 2");
    });

    it("only the contract manager can add a new choice", async () => {
        try {
            await survey.methods.addChoice("Choice X").send({ from: accounts[2], gas: 3000000 });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }
    });

    it("survey manager delete a choice and emits an event", async () => {
        const managerAdr = await survey.methods.manager().call();
        //add a 'Choice 1'
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });
        //check 'deleted' status of 'Choice 1'
        let choice = await survey.methods.choices(1).call();
        assert.equal(choice[3], false);
        //change the 'deleted' status of 'Choice 1'
        const receipt = await survey.methods.deleteChoice(1).send({ from: managerAdr });
        //check if 'deleted' status of 'Choice 1' has changed to 'true'
        choice = await survey.methods.choices(1).call();
        assert.equal(choice[3], true);

        //test event
        assert.equal(receipt.events.deletedEvent.event, "deletedEvent");
        assert.equal(receipt.events.deletedEvent.returnValues._choiceId, 1);
    });

    it("survey manager undelete a choice", async () => {
        const managerAdr = await survey.methods.manager().call();
        //add a 'Choice 1'
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });
        //change the 'deleted' status of 'Choice 1'
        await survey.methods.deleteChoice(1).send({ from: managerAdr });
        //check if 'deleted' status of 'Choice 1' has changed to 'true'
        let choice = await survey.methods.choices(1).call();
        assert.equal(choice[3], true);
        //undelete 'Choice 1'
        const receipt = await survey.methods.undeleteChoice(1).send({ from: managerAdr });
        //check if 'deleted' status of 'Choice 1' has changed to 'false'
        choice = await survey.methods.choices(1).call();
        assert.equal(choice[3], false);

        //test event
        assert.equal(receipt.events.undeletedEvent.event, "undeletedEvent");
        assert.equal(receipt.events.undeletedEvent.returnValues._choiceId, 1);
    });

    it("only the survey manager can delete a choice", async () => {
        const managerAdr = await survey.methods.manager().call();
        //add a 'Choice 1'
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });

        try {
            await survey.methods.deleteChoice(1).send({ from: accounts[3] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }

        //check if 'deleted' status of 'Choice 1' has not changed
        const choice = await survey.methods.choices(1).call();
        assert.equal(choice[3], false);
    });

    it("only the survey manager can undelete a deleted choice", async () => {
        const managerAdr = await survey.methods.manager().call();
        //add a 'Choice 1'
        await survey.methods.addChoice("Choice 1").send({ from: managerAdr, gas: 3000000 });
        //change the 'deleted' status of 'Choice 1'
        await survey.methods.deleteChoice(1).send({ from: managerAdr });
        //check if 'deleted' status of 'Choice 1' has changed to 'true'
        let choice = await survey.methods.choices(1).call();
        assert.equal(choice[3], true);

        try {
            await survey.methods.undeleteChoice(1).send({ from: accounts[3] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }

        //check if 'deleted' status of 'Choice 1' has not changed to 'false'
        choice = await survey.methods.choices(1).call();
        assert.equal(choice[3], true);
    });
});