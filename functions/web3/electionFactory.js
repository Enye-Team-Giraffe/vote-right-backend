const web3 = require("./configuredWeb3")
const { 
        interface:compiledElectionInterface, 
        bytecode:compiledElectionBytecode 
    } = require("../ethereum/build/ElectionFactory.json");

const instance = new web3.eth.Contract(
                     JSON.parse(compiledElectionInterface),
                     '0x12767cbb1441797c2BB6Df62240C4e476222bB56'
     );
// console.log(Object.keys(instance.methods))
module.exports = instance;