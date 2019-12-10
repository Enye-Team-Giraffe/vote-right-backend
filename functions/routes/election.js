var express=require("express");
var router=express.Router();
var electionFactory = require("../web3/electionFactory");
const compiledElection = require("../ethereum/build/Election.json");
var web3 = require("../web3/configuredWeb3");

// define gas prices
const largeGas=3000000;
const smallGas=1000000;

// a route to get all the current elections in our blockchain
router.get("/",async (request,response)=>{
    // wrap it in a try catch in case there are any errors
    try{
        // get an array that determines the length of elections we have
        const electionsLength = await electionFactory.methods.getDeployedElections().call()
        // for each election we have get the details of said election
        const electionDetails = await  Promise.all(electionsLength.map((_,index)=>{
            return electionFactory.methods.summaries(index).call()
        }))
        // if no error was encountered, then we can go on and return the details
        return response.json({
            status:"success",
            data:electionDetails
        });
    }
    catch(err){
        // if any error was encountered return with the message
        return response.json({
            status:"error",
            message:err.message
        });
    }
})


// a route to create an election 
// the response recieves a body containing the following
// response.body = {name@string,description@string,
//                  startDate@timestamp,endDate@timestamp}
router.post("/create",async (request,response)=>{
    // get a key of all the details of the election
    const keys=['name','description','startDate','endDate'];
    // check and make sure all the keys are present
    for (let key of keys){
        if (request.body[key] === undefined){
            return response.json({
                status:"error",
                message:`the key ${key} was absent, please enter it`
            });
        }
    }
    // transfer this items to my variable body
    body={};
    body['name'] = request.body['name']
    body['description'] = request.body['description']
    body['startDate'] = request.body['startDate']
    body['endDate'] = request.body['startDate']

    // create my election in the blockchain
    try{
        
        // get all the accounts provided by our local network
        accounts = await web3.eth.getAccounts();

        await electionFactory.methods.createElection(body['name'],body['description'],
        body['startDate'],body['endDate']
        ).send({
            from:accounts[0],
            gas:largeGas
        })
        return response.json({
            status:"success",
            data:"Election sucessfully created"
        });
    }
    // if there
    catch(err){
        return response.json({
            status:"error",
            message:err.message
        });
    }
    
})

// a route to begin an election
router.get("/begin/:electionId",async (request,response)=>{
    // get the id of the election we want to begin
    const electionAddress=request.params.electionId;
    
    // create my election in the blockchain
    try{
        // get all the accounts provided by our local network
        accounts = await web3.eth.getAccounts();
        // get an interface to the election contract
        election = await new web3.eth.Contract(
            JSON.parse(compiledElection.interface),
            electionAddress
        )
        // get all the accounts provided by our local network
        await election.methods.concludeInitialisation().send({from:accounts[0],gas:smallGas})
        // respond with a sucessful message
        return response.json({
            status:"success",
            data:"Election sucessfully initialised"
        });
    }
    // if there
    catch(err){
        return response.json({
            status:"error",
            message:err.message
        });
    }
})




module.exports = router;