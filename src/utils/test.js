const ks = require('./key_storage');
const tokenInfo = require('./token_info');
const ethNetworks = require('./ethereum_networks');
const sign = require('./sign');


testObj = {
  A: {OneA: {'OneA': "Something 1A"}, TwoA: {'TwoA': "Something 2A"}},
  B: {OneA: {'OneB': "Something 1B"}, TwoA: {'TwoB': "Something 2B"}},
  C: {OneA: {'OneC': "Something 1C"}, TwoA: {'TwoC': "Something 2C"}},
  D: {OneA: {'OneD': "Something 1D"}, TwoA: {'TwoD': "Something 2D"}},
  E: {OneA: {'OneE': "Something 1E"}, TwoA: {'TwoE': "Something 2E"}},
  F: {OneA: {'OneF': "Something 1F"}, TwoA: {'TwoF': "Something 2F"}}
}

importObj = {
  A: {ThreeA: {'ThreeA': "Something 3A"}},
  G: {OneG: {'OneG': "Something 1G"}, TwoG: {'TwoG': "Something 2G"}}
}

for (let letter in importObj){
  if (letter in testObj){
    console.log(letter + ' found');
  }else{
    console.log(letter + ' does not exist')
    testObj[letter] = {};
  }
  
  for (let l in importObj[letter]){
    let checkKey =  l in testObj[letter]
    if (!checkKey){
      testObj[letter][l] = importObj[letter][l];
    }
  }
}

console.log(testObj);
console.log(importObj);