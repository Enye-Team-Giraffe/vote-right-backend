const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');

const provider= new HDWalletProvider(
    'zero apart reform rack west fire ramp twist popular repair envelope short',
    'https://rinkeby.infura.io/v3/727e5c1247204e3190766708acfebb4d'
);
const web3 = new Web3(provider);

module.exports = web3;