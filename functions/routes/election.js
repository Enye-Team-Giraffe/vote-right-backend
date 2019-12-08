var express=require("express");
var electionFactory=require("../web3/electionFactory");
var router=express.Router();

// a route to get all the current elections in our blockchain
router.use("/",async (request,response)=>{
    
    try{
        const elections=[]
        const electionsLength = await electionFactory.methods.electionsLength().call()
        for(let i=0;i<electionsLength;i++){
            let newElection=await electionFactory.methods.summaries(i).call()
            elections.push(newElection)
        }
        response.json(elections);
    }
    catch(err){
        response.end(err.message)
    }
})


module.exports = router;