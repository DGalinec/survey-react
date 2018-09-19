In this Ethereum / React.js project, the logic of a multiple-choice questionnaire is stored in a smart contract. The number of choices is not limited. Only the creator of the contract has the opportunity to change the question and add, delete, undelete choices. The back-end part of the application is written in the Solidity programming language. The boilerplate interface was created using create-react-app and further developed with React.js code. This project involves the manipulation of events.

## Survey contract

- The contract [Survey.sol](https://github.com/DGalinec/lottery/blob/master/Ethereum/contracts/Lottery.sol) is written in the Solidity programming language.

- The contract has been pre-compiled and pre-tested on the [Remix](http://remix.ethereum.org/#optimize=false&version=soljson-v0.4.24+commit.e67f0147.js) Solidity IDE.

- The contract is compiled using the [solc](https://github.com/ethereum/solc-js) Solidity compiler. The script is called [compile.js](https://github.com/DGalinec/lottery/blob/master/Ethereum/compile.js).

- The [Mocha](https://mochajs.org/) JavaScript test framework paired with the [Ganache](https://github.com/trufflesuite/ganache) personnal blockchain for Ethereum development were used to test the behaviour of the different contract functions on the blockchain. The JavaScript file containing the different tests is named [Survey.test.js](https://github.com/DGalinec/lottery/blob/master/test/Lottery.test.js).

- The contract was deployed on the [Rinkeby](https://www.rinkeby.io/#stats) network (Ethereum testnet at address [0xee9fa53720cB568CcFaD8aAAEDd043Ab03AB463C](https://rinkeby.etherscan.io/address/0xee9fa53720cB568CcFaD8aAAEDd043Ab03AB463C) using [truffle hdwallet provider](https://github.com/trufflesuite/truffle-hdwallet-provider).

## User interface

- This project is was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

- Main JavaScript source code of the user interface with calls to the Ethreum blockchain is in [App.js](https://github.com/DGalinec/lottery/blob/master/src/App.js) file.

- A number of Solidity events are being watch in [App.js](https://github.com/DGalinec/survey-truffle/blob/master/src/js/app.js).

```
user account       - listenForEvents()         - fires when the user account has changed -
votedEvent         - watchVotedEvent()         - fires when a user voted -
addedChoiceEvent   - watchAddedChoiceEvent()   - fires when a new choice has been added by the creator of the contract -
addedQuestionEvent - watchAddedQuestionEvent() - fires when the survey manager changed the question of the survey -
deletedEvent       - watchDeletedEvent()       - fires when the survey manager deleted one of the choices -
undeletedEvent     - watchUndeletedEvent()     - fires when the survey manager undeleted one of the choices -
```

- Interface between the user interface and the contract running on the Ethereum blockchain is [survey.js](https://github.com/DGalinec/lottery/blob/master/src/lottery.js) file. It contains the JSON Application Binary Interface (ABI) and contract address on the Rinkeby network.

- Contract requires [MetaMask](https://metamask.io/) plugin to be installed in your Chrome or FireFox browser and be settled on the Rinkeby network in order to pay for transactions.

- To run the user interface type `~/$ npm start`. Application will start on `localhost: 3000` in your browser. 

## Folder structure

After cloning files and running `~/$ npm install` in your working directory, your project should look like this:

```
survey-react/
  Ethereum/
    compile.js
    contracts/
      Survey.sol
    deploy.js
  node_modules/
  package.json
  public/
    favicon.ico
    index.html
    manifest.json
  README.md
  src/
    App.css
    App.js
    App.test.js
    components/
      EnterText.js
      ListItem.js
    index.css
    index.js
    logo.svg
    registerServiceWorker.js
    survey.js
    web3.js
  test/
    Survey.test.js
```