"use strict";
exports.__esModule = true;
var capnp = require("capnp-ts");
var md5 = require("md5");
var bigInt = require("big-integer");
var transactionSchemas = require("./transaction.capnp");
var helpers = require("./helpers");
var wallet = require("./wallet");
var pow = require("./pow");
var ContractTransaction = transactionSchemas.ContractTransaction;
var TransactionContainer = transactionSchemas.TransactionContainer;
var Metadata = transactionSchemas.MetaData;
var ContractPayload = transactionSchemas.ContractPayload;
var Kwargs = transactionSchemas.Kwargs;
var Value = transactionSchemas.Value;
var Map = transactionSchemas.Map;
var CurrencyTransactionContainer = /** @class */ (function () {
    function CurrencyTransactionContainer() {
    }
    CurrencyTransactionContainer.prototype.create = function (currencyTransaction) {
        var struct = new capnp.Message();
        var txContainer = struct.initRoot(TransactionContainer);
        var txbytes = new Uint8Array(currencyTransaction.toPackedArrayBuffer());
        var pl = txContainer.initPayload(txbytes.byteLength);
        pl.copyBuffer(txbytes);
        // Hack to recreate md5 registry for contract transaction in python w/ javascript
        var md5Hash = md5('ContractTransaction');
        var l = bigInt(md5Hash, 16).divmod(Math.pow(2, 16)).remainder.valueOf();
        txContainer.setType(l);
        this.tx = struct;
        return struct;
    };
    CurrencyTransactionContainer.prototype.toBytesPacked = function () {
        return this.tx.toPackedArrayBuffer();
    };
    CurrencyTransactionContainer.prototype.toBytes = function () {
        return this.tx.toArrayBuffer();
    };
    CurrencyTransactionContainer.prototype.deserializeData = function (i) {
        var msg = new capnp.Message(i);
        var tc = msg.getRoot(TransactionContainer);
        return tc;
    };
    return CurrencyTransactionContainer;
}());
exports.CurrencyTransactionContainer = CurrencyTransactionContainer;
var CurrencyContractTransaction = /** @class */ (function () {
    function CurrencyContractTransaction(contract_name, func_name) {
        if (contract_name === void 0) { contract_name = 'currency'; }
        if (func_name === void 0) { func_name = 'transfer'; }
        this.contract_name = contract_name;
        this.func_name = func_name;
    }
    // PSUEDO-CONSTRUCTOR
    CurrencyContractTransaction.prototype.create = function (sender_sk, stamps_supplied, nonce, to, amount) {
        // Fill the class objects for later use
        // These are initialized here instead of in the constructor so we can emulate having multiple
        // constructors (as with in python @class_method)
        this.sender_sk = sender_sk;
        this.stamps_supplied = stamps_supplied;
        this.nonce = nonce;
        this.to = to;
        this.amount = amount;
        // Initialize capnp objects
        var struct = new capnp.Message();
        var tx = struct.initRoot(ContractTransaction);
        var metadata = tx.initMetadata();
        var message = new capnp.Message();
        var payload = message.initRoot(ContractPayload);
        var valuebuffer = new capnp.Message(); // In order to set the value we need to
        // construct it as a message than deepcopy
        // it over
        var valuebuf = valuebuffer.initRoot(Value);
        var kwargs = payload.initKwargs();
        var entries = kwargs.initEntries(2); // Set to static length of 2 for currency contract
        // Cast required inputs to capnp types
        var stamps = capnp.Uint64.fromNumber(this.stamps_supplied);
        // Build the deterministic section of the payload
        payload.setContractName(this.contract_name);
        payload.setFunctionName(this.func_name);
        payload.setNonce(this.nonce);
        payload.setSender(wallet.get_vk(this.sender_sk));
        payload.setStampsSupplied(stamps);
        // Build the non-deterministic section of the payload (kwargs)
        entries.get(0).setKey('to');
        entries.get(1).setKey('amount');
        valuebuf.setText(this.to); // Fill the buffer with the 'to' text
        entries.get(0).setValue(valuebuf);
        valuebuf.setFixedPoint(this.amount.toString()); // Fill the buffer with the amount
        entries.get(1).setValue(valuebuf);
        // Get the payload bytes
        var plbytes = new Uint8Array(message.toArrayBuffer());
        // Get signature
        this.signature = wallet.sign(this.sender_sk, plbytes);
        var sigbuf = helpers.str2ab(this.signature);
        var msig = metadata.initSignature(sigbuf.byteLength);
        msig.copyBuffer(sigbuf);
        // Calculate POW
        this.pow = pow.find(plbytes).pow;
        var powbuf = helpers.str2ab(this.pow);
        var mpow = metadata.initProof(powbuf.byteLength);
        mpow.copyBuffer(powbuf);
        // Set payload of tx -- payload binary
        var pl = tx.initPayload(plbytes.byteLength);
        pl.copyBuffer(plbytes);
        this.tx = struct;
        return struct;
    };
    CurrencyContractTransaction.prototype.toBytesPacked = function () {
        return this.tx.toPackedArrayBuffer();
    };
    CurrencyContractTransaction.prototype.toBytes = function () {
        return this.tx.toArrayBuffer();
    };
    CurrencyContractTransaction.prototype.deserializePayload = function (i) {
        var msg = new capnp.Message(i);
        var payload = msg.getRoot(ContractPayload);
        return payload;
    };
    CurrencyContractTransaction.prototype.deserializeData = function (i) {
        var msg = new capnp.Message(i);
        var tx = msg.getRoot(ContractTransaction);
        return tx;
    };
    return CurrencyContractTransaction;
}());
exports.CurrencyContractTransaction = CurrencyContractTransaction;
