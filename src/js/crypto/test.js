const utils = require('../utils');

const { encryptStrHash, decryptStrHash,
        encryptObject, decryptObject,
        toCurrencyFormat,
        stripCoinRef,
        vailidateString } = utils;

const amount = 100

console.log( toCurrencyFormat(100, 'USD')  )
console.log( toCurrencyFormat(100, 'CAD')  )
console.log( toCurrencyFormat(100, 'EUR') )
console.log( toCurrencyFormat(100, 'JPY') )

/*
const  password = "test_password"
const  badPassword = "bad_password"

//const hash = "{\"ct\":\"eAeIzSNqcspjMOtYXezAsaCMT6VnKZpSHA8T7kKQF2js9h+LAuWKpbFjGzrdiajp\",\"iv\":\"5f6001bec8ab0882e759d8f2602fb93c\",\"s\":\"811c367ac3469fc7\"}"
//console.log(decryptObject("Summer0!0101", hash) )

const skhash = "U2FsdGVkX192vCZeO/juy0bNSFTmXwd4h1BYGDRKC3NNoSF7p6G7cIV7v0WZQ9Em"
const encryptedString = encryptStrHash(password, "This is a string")
console.log(encryptedString)
console.log(decryptStrHash(password, encryptedString) )
console.log(decryptStrHash(password, 'notagreatexample') )
console.log(decryptStrHash(badPassword, encryptedString) )
*/