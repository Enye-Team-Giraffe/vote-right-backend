// import the required packages
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

// import the contracts we have compliled
const compiledFactory = require("../ethereum/build/ElectionFactory.json")
const compiledElection = require("../ethereum/build/Election.json");

// global variables to use throughout the tests
let accounts;
let factory;
let electionAddress;
let election;

// global candidate to push
const testCandidate={
    id:"123453434",
    name:"Shuaibu Alexander",
    age:35,
    party:"APC",
    quote:"All hail the queen",
    pictureLink:"123434",
    education:"University"
}

// global voter to test
const testVoter={
    age:20,
    gender:"MALE",
    latlong:"1.2345_-11.5834",
    phoneNumber:"09076299257",
    candidateId:"241999"
}

// globall election variables
const testElection={
    name:"presidential election",
    description:"an election for president",
    startdate:9009,
    enddate:90099
}

// constants for gas price
const smallGas = 1000000;
const largeGas = 3000000;

// run tis code to deploy teh contract after each run
beforeEach(async ()=>{
    // get all the accounts provided by our local network
    accounts = await web3.eth.getAccounts();
 
    // deploy this contract and return an instance
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
                    .deploy({data:compiledFactory.bytecode})
                    .send({from:accounts[0],gas:largeGas})
    // create an election instance using the factory we just deployed
    
    await factory.methods.createElection(testElection['name'],testElection['description'],
                                        testElection['startdate'],testElection['enddate']
                                        )
    .send({
        from:accounts[0],
        gas:largeGas
    })
    // get the address of the first instances of our deployed elections
    address = await factory.methods.getDeployedElections().call()
    electionAddress = address[0]
    // create a representation of this campaign and assign it to the global variable
    election = await new web3.eth.Contract(
        JSON.parse(compiledElection.interface),
        electionAddress
    )
});

// run the tests
describe("Elections",()=>{


    // test that both the factory and the election were sucessfully deployed to the network
    // by checking if they contain an address
    it("deploys a factory and a campaign ",()=>{
        assert.ok(true)
        assert.ok(factory.options.address);
        assert.ok(election.options.address);
    });




    // confirm from the campaign that accounts[0] is marked as the manager of the contrat
    it("marks creator of the creator of the election as the admin/manager",async()=>{
        const manager = await election.methods.manager().call();
        assert.equal(manager,accounts[0]);
    });




    // confirm that after creating an election we can add candidates
    it("can add a candidate to the election",async()=>{
        // add a candidate to the election
        await election.methods.addCandidate(
            testCandidate['id'],testCandidate['name'],
            testCandidate['age'],testCandidate['party'],
            testCandidate['quote'],testCandidate['pictureLink'],
            testCandidate['education']
        )
        .send({from:accounts[0],gas:largeGas})

        // confirm if the candidate was truly added to the array
        const candidateArray = await election.methods.candidates(0).call();
        // confirm if candidate added to election is the same as the one who was sent to it
        assert.equal(candidateArray['name'],testCandidate['name']);
    });




    // confirm that after we move the eleciton state to stage2,we can no longer add candidates
    it("cannot add candidates after voting has started",async()=>{
        await election.methods.concludeInitialisation().send({from:accounts[0],gas:smallGas});
        // then we try to add a candidate to the election

        try{
            await election.methods.addCandidate(
                testCandidate['id'],testCandidate['name'],
                testCandidate['age'],testCandidate['party'],
                testCandidate['quote'],testCandidate['pictureLink'],
                testCandidate['education']
            )
            .send({from:accounts[0],gas:largeGas})
            // if an error is not thrown then we did not secure properly
            assert.ok(false)
        }catch(err){
            // if an error is thrown then assert true
            assert.ok(err)
        }

    })




    // confirm that a voter can vote for a particular candidate
    it("can vote for candidate",async()=>{
        // vote for a particular client, then check for if the votecount increased
        // firstly add a candidate to the election
        await election.methods.addCandidate(
            testCandidate['id'],testCandidate['name'],
            testCandidate['age'],testCandidate['party'],
            testCandidate['quote'],testCandidate['pictureLink'],
            testCandidate['education']
        )
        .send({from:accounts[0],gas:largeGas})

        // get the candidate and confirm that the initial votecount is 0
        const candidateArray = await election.methods.candidates(0).call();
        // the initial vote count of this candidate must be zero
        assert.equal(candidateArray['voteCount'],0)
        // finalise the initialisaytion of the election so voting can commence
        await election.methods.concludeInitialisation().send({from:accounts[0],gas:smallGas});
        // add a vote to this candidate
        await election.methods.vote(
            testCandidate['id'],testVoter['age'],
            testVoter['gender'],testVoter['latlong'],
            testVoter['phoneNumber']
        )
        .send({from:accounts[0],gas:smallGas});

        // get the candidate again and confirm that his voteCount has increased by 1
        const votedCandidateArray = await election.methods.candidates(0).call();
        // after we vote this candidate his votecount must be 1
        assert.equal(votedCandidateArray['voteCount'],1)
    });




    // confirm that a voter cannot vote more than once
    it("cannot vote more than once",async()=>{
        // firstly add a candidate to the election
        await election.methods.addCandidate(
            testCandidate['id'],testCandidate['name'],
            testCandidate['age'],testCandidate['party'],
            testCandidate['quote'],testCandidate['pictureLink'],
            testCandidate['education']
        )
        .send({from:accounts[0],gas:300000})

        // get the candidate and confirm that the initial votecount is 0
        const candidateArray = await election.methods.candidates(0).call();
        // the initial vote count of this candidate must be zero
        assert.equal(candidateArray['voteCount'],0)
        // finalise the initialisaytion of the election so voting can commence
        await election.methods.concludeInitialisation().send({from:accounts[0],gas:smallGas});
        // add a vote to this candidate
        await election.methods.vote(
            testCandidate['id'],testVoter['age'],
            testVoter['gender'],testVoter['latlong'],
            testVoter['phoneNumber']
        )
        .send({from:accounts[0],gas:smallGas});

        // try to vote using the same phone Number
        try{
            // add a vote to this candidate
            await election.methods.vote(
                testCandidate['id'],testVoter['age'],
                testVoter['gender'],testVoter['latlong'],
                testVoter['phoneNumber']
            )
            .send({from:accounts[0],gas:smallGas});

            // if an error was not thrown then function is wrong
            assert.ok(false)
        }
        catch(err){
            // if there is an error then we are right
            assert.ok(err)
        }
    })


    // confirm that after election has been closed, no vote can be made again
    it("cannot vote again after election has closed",async()=>{
        // firstly add a candidate to the election
        await election.methods.addCandidate(
            testCandidate['id'],testCandidate['name'],
            testCandidate['age'],testCandidate['party'],
            testCandidate['quote'],testCandidate['pictureLink'],
            testCandidate['education']
        )
        .send({from:accounts[0],gas:300000})

        // conclude the voting
        await election.methods.concludeVoting().send({from:accounts[0],gas:smallGas});
        
        // try to vote after concluding election
        try{
            await election.methods.vote(
                testCandidate['id'],testVoter['age'],
                testVoter['gender'],testVoter['latlong'],
                testVoter['phoneNumber']
            )
            .send({from:accounts[0],gas:smallGas});

            // if an error was not thrown the guard isnt working and we can still cote after election ended
            assert.ok(false)
        }
        catch(err){
            // if there is an error then we are right
            assert.ok(err)
        }
    })
})