const web3 = require("./configuredWeb3");

const { 
        interface:compiledFactoryInterface,
        bytecode:compiledFactoryBytecode 
    } = require("../ethereum/build/ElectionFactory.json")

const deploy = async ()=>{
    
    const accounts = await web3.eth.getAccounts();
    

    const result = await new web3.eth.Contract(JSON.parse(compiledFactoryInterface))
    .deploy({data:'0x' + compiledFactoryBytecode})
    .send({from:accounts[0]})

    console.log(result.options.address)
}
deploy();