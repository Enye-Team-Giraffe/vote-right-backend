var express=require("express");
var electionFactory=require("../web3/electionFactory");
var router=express.Router();

// a route to get all the current elections in our blockchain
router.use("/",async (request,response)=>{
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


module.exports = router;