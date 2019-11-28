var express=require("express");
var router=express.Router();

// a route which we will be using to authenticate API calls for NIN pending our approval, it requires a post request to be activated
router.post("/",(request,response)=>{
    // extract the phone number and NIN from the body of the response
    const {nin,phoneNumber}=request.body;

    // first check if the proper keys were passed along, if they were not return an error message
    if(!nin || !phoneNumber){
        return response.json({
            status:"error",
            message:"Please pass in the correct parameters 'nin' and 'phoneNumber'"

        });
    }
    /*
        make a call to NIN API and confirm if the given phone number is the same as the entered phone number
        after that assign a value to a variable called authenticated, which would be either true or false depending on the authentication state
    */
   let authenticated=true;
   let message="The phone number entered id not the same as the one atached to your NIN, please cross check"
   // if the authentication was successful, return back an object containing the status and the data which would be the nin and the phone number
   if(authenticated){
    return response.json({
        status:"success",
        data:{
            phoneNumber,
            nin
        }
    });
   }
   //if the authentication was unsuccessfull, then send an error message
   else{
    return response.json({
        status:"error",
        message:message
    });
   }
})

// export this instance of our router
module.exports=router;

