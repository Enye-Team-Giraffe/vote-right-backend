const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

// get the path of the build folder, where we store our compiled contracts
const buildPath = path.resolve(__dirname,'build');
fs.removeSync(buildPath) //if the build path exists we delete it and its contents

// get the paths to he contract source and read it to memory
const campaignPath = path.resolve(__dirname,"contracts","Campaign.sol")
const source = fs.readFileSync(campaignPath,'utf-8');
// compile our contract to bytecodes for deployment
const output = solc.compile(source,1).contracts;

fs.ensureDirSync(buildPath)//make sure the path exists, and recreate it if it doesnt

// for each contract, save it to a file
for (let contract in output){
    fs.outputJSONSync(
        path.resolve(buildPath,contract.replace(":","") + ".json"),
        output[contract]
    );
}