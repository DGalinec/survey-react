
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const surveyPath = path.resolve(__dirname, 'contracts', 'Survey.sol');

const source = fs.readFileSync(surveyPath, 'utf8');

//console.log(solc.compile(source, 1));

module.exports = solc.compile(source, 1).contracts[':Survey'];