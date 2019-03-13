"use strict";
exports.__esModule = true;
var jsSHA = require("jssha");
var helpers = require("./helpers");
var assert = require("assert");
/**
 * @param String o
 * @param String a
 *      o:      The object that is being used to generate POW in string form
 *      a:      The random seed to generate on for POW
 *
 * @return String hex
 *      hex:    The hex representation of the sha object for POW validation
 */
function _generate(o, a) {
    var shaObj = new jsSHA('SHA3-256', "TEXT");
    shaObj.update(o + a);
    return shaObj.getHash("HEX");
}
exports._generate = _generate;
/**
 * @param Uint8Array o
 * @param Number complexity
 *      o:          The bytes of the object to use to generate POW
 *      complexity: The number of leading zeros required in the POW
 *
 * @return Object(string, number) { pow, cts }
 *      pow:    The seed used to generate the POW
 *      cts:    calculation time in seconds (CTS) amount of time it took to
 *              generate the POW
 */
function find(o, complexity) {
    if (complexity === void 0) { complexity = 3; }
    var start = new Date();
    var strO = helpers.ab2str(o);
    var leadZeros = Array(complexity + 1).join('0');
    var a = helpers.randomString(16);
    while (_generate(strO, a).substring(0, complexity) != leadZeros) {
        a = helpers.randomString(16);
    }
    var end = new Date();
    return {
        pow: helpers.str2hex(a),
        cts: (end.valueOf() - start.valueOf()) / 1000
    };
}
exports.find = find;
/**
 * @param Uint8Array o
 * @param String proof
 * @param Number complexity
 *      o:          The bytes of the object to use to generate POW
 *      proof:      The hex string of the seed used to generate the POW
 *      complexity: The number of leading zeros required in the POW
 *
 * @return Boolean valid
 *      valid:      Whether or not the POW on the object checks out
 */
function check(o, proof, complexity) {
    if (complexity === void 0) { complexity = 3; }
    assert(proof.length === 32);
    var leadZeros = Array(complexity + 1).join('0');
    var shaObj = new jsSHA('SHA3-256', "TEXT");
    shaObj.update(helpers.ab2str(o) + helpers.hex2str(proof));
    if (shaObj.getHash("HEX").substring(0, complexity) == leadZeros) {
        return true;
    }
    else {
        return false;
    }
}
exports.check = check;
