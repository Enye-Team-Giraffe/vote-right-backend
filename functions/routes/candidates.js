// import personalised packages
var express=require("express");
var router=express.Router();
var uuidv4=require("uuid/v4");

// import personal packages
const compiledElection = require("../ethereum/build/Election.json");
var web3 = require("../web3/configuredWeb3");
const largeGas = 3000000;

// route to get all the candidates in a particular election
router.get("/:electionId",async (request,response)=>{
    // get the address of this election as stored on the blockchain
    try{
        const electionAddress=request.params.electionId;
        // get an interface to the election contract
        election = await new web3.eth.Contract(
            JSON.parse(compiledElection.interface),
            electionAddress
        )
        // get the length of the candidates in this election
        const candidateArrayLength = await election.methods.getCandidatesLength().call();
        console.log(typeof(candidateArrayLength))
        // this line call gives us the range from zero to a number 4=>[0,1,2,3]
        const indexes=[...Array(Number(candidateArrayLength)).keys()]
        // get all the candidates from the contract
        const candidateDetails = await  Promise.all(indexes.map((_,index)=>{
            return election.methods.candidates(index).call()
        }))

        // respond with this candidate item
        return response.json({
            status:"success",
            data:candidateDetails
        });
    }
    // if there was an error respond with the message attached it it
    catch(err){
        return response.json({
            status:"error",
            message:err.message
        });
    }
});

// route to add a candidate to our election
router.post('/:electionId',async (request,response)=>{
    const electionAddress=request.params.electionId;
    
    const newCandidate={};
    const fields=['name','age','party','quote','pictureLink','education'];
    
    // check and make sure all the keys are present
    for (let key of fields){
        if (request.body[key] === undefined){
            return response.json({
                status:"error",
                message:`the key ${key} was absent, please enter it`
            });
        }
    }
    
    // assign the fields to an object
    newCandidate['id']=uuidv4();
    newCandidate[fields[0]]=request.body.name;
    newCandidate[fields[1]]=request.body.age;
    newCandidate[fields[2]]=request.body.party;
    newCandidate[fields[3]]=request.body.quote;
    newCandidate[fields[4]]=request.body.pictureLink;
    newCandidate[fields[5]]=request.body.education;
    
    // wrap all async calls in a try catch in case of errors
    try{
        // get an interface to the election contract
        election = await new web3.eth.Contract(
            JSON.parse(compiledElection.interface),
            electionAddress
        )
        // get all the accounts provided by our local network
        accounts = await web3.eth.getAccounts();
            // add a new candidate 
        await election.methods.addCandidate(
            newCandidate['id'],newCandidate['name'],
            newCandidate['age'],newCandidate['party'],
            newCandidate['quote'],newCandidate['pictureLink'],
            newCandidate['education']
        )
        .send({from:accounts[0],gas:largeGas})

        // respond with this candidate item
        return response.json({
            status:"success",
            data:"you have sucessfully added the candidate"
        });
    }
    // catch any errors
    catch(err){
        return response.json({
            status:"error",
            message:err.message
        });
    }

})


module.exports=router;