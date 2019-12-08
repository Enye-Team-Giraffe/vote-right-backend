var express=require("express");
var electionFactory=require("../web3/electionFactory");
var router=express.Router();

// a route to get all the current elections in our blockchain
router.use("/elections",async (request,response)=>{
    console.log(electionFactory)
    try{
        const elections = await electionFactory.methods.getDeployedElections().call();
        response.json(elections);
    }
    catch(err){
        response.end(err.message)
    }
})


module.exports = router;