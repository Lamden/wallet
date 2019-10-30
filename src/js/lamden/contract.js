import * as capnp from 'capnp-ts';
import * as md5 from 'md5';
import * as bigInt from 'big-integer';
import * as transactionSchemas from './transaction.capnp';
import * as valueSchemas from './values.capnp';
import * as helpers from './helpers';
import * as wallet from './wallet';
import * as pow from './pow';
export class ContractTransactionContainer {
    constructor() {
    }
    create(contractTransaction) {
        this.payload = contractTransaction.toPackedArrayBuffer();
        const struct = new capnp.Message();
        const txContainer = struct.initRoot(transactionSchemas.TransactionContainer);
        const txbytes = new Uint8Array(this.payload);
        const pl = txContainer.initPayload(txbytes.byteLength);
        pl.copyBuffer(txbytes);
        // Hack to recreate md5 registry for contract transaction in python w/ javascript
        var md5Hash = md5('ContractTransaction');
        var l = bigInt(md5Hash, 16).divmod(Math.pow(2, 16)).remainder.valueOf();
        txContainer.setType(l);
        this.tx = struct;
    }
    createFromBytesPacked(i) {
        this.tx = new capnp.Message(i);
        const tc = this.tx.getRoot(transactionSchemas.TransactionContainer);
        this.payload = tc.getPayload().toUint8Array();
    }
    toBytesPacked() {
        return this.tx.toPackedArrayBuffer();
    }
    toBytes() {
        return this.tx.toArrayBuffer();
    }
    deserializeData(i) {
        const msg = new capnp.Message(i);
        const tc = msg.getRoot(transactionSchemas.TransactionContainer);
        return tc;
    }
}
export class ContractTransaction {
    constructor(nonce_enabled) {
        // TODO: come up with a deterministic way to request nonces so we do not need to do a 
        if (nonce_enabled) {
            throw "Requesting nonces is currently not supported in CilantroJS";
        }
        else {
            this.nonce_enabled = false;
        }
    }
    // PSUEDO-CONSTRUCTOR
    //   kwargs is reference to a dictionary object emulating the usage of kwargs in python for unknown, dynamic
    //          keyword argument assignment
    create(contract_name, func_name, stamps_supplied, kwargobj) {
        // Fill the class objects for later use
        // These are initialized here instead of in the constructor so we can emulate having multiple
        // constructors (as with in python @class_method)
        this.contract_name = contract_name;
        this.func_name = func_name;
        this.stamps_supplied = stamps_supplied;
        this.kwargs = kwargobj;
        // Initialize capnp objects
        const struct = new capnp.Message();
        const tx = struct.initRoot(transactionSchemas.ContractTransaction);
        this.metadata = tx.initMetadata();
        const message = new capnp.Message();
        const payload = message.initRoot(transactionSchemas.ContractPayload);
        const valuebuffer = new capnp.Message(); // In order to set the value we need to
        // construct it as a message than deepcopy
        // it over
        const valuebuf = valuebuffer.initRoot(valueSchemas.Value);
        const kwargs = payload.initKwargs();
        const kwargcount = Object.keys(this.kwargs).length; // Get the number of kwargs supplied via the kwarg object for
        // the dynamic section of the transaction container
        const entries = kwargs.initEntries(kwargcount); // Set to static length of 2 for currency contract
        // Cast required inputs to capnp types
        const stamps = capnp.Uint64.fromNumber(this.stamps_supplied);
        // Build the deterministic section of the payload
        payload.setContractName(this.contract_name);
        payload.setFunctionName(this.func_name);
        payload.setStampsSupplied(stamps);
        // Build the non-deterministic section of the payload (kwargs)
        Object.entries(this.kwargs).forEach(function (value, i) {
            // Set the key to the entry (foreach on on object will give [ [ <key>, <value> ], ... ]
            entries.get(i).setKey(value[0]);
            // Set the value based on the provided type
            switch (value[1]["type"]) {
                default:
                    throw "argument type " + value[1]["type"] + " is either unknown or unsupported by cilantro-js";
                case 'bool':
                    if (typeof value[1]['value'] === "boolean") {
                        valuebuf.setBool(value[1]['value']);
                    }
                    else {
                        throw "(case bool): Value provided to key '" + value[0] + "' of '" + value[1]['value'] + "' (type: '" + typeof value[1]['value'] + "') did not match expected type '" + value[1]['type'] + "'";
                    }
                    break;
                case 'uint64':
                    if (typeof value[1]['value'] === "number") {
                        valuebuf.setUint64(capnp.Uint64.fromNumber(value[1]['value']));
                    }
                    else {
                        throw "(case uint64): Value provided to key '" + value[0] + "' of '" + value[1]['value'] + "' (type: '" + typeof value[1]['value'] + "') did not match expected type '" + value[1]['type'] + "'";
                    }
                    break;
                case 'fixedPoint':
                    if (typeof value[1]['value'] === "number") {
                        valuebuf.setFixedPoint(value[1]['value'].toString());
                    }
                    else {
                        throw "(case fixedPoint): Value provided to key '" + value[0] + "' of '" + value[1]['value'] + "' (type: '" + typeof value[1]['value'] + "') did not match expected type '" + value[1]['type'] + "'";
                    }
                    break;
                case 'text':
                    if (typeof value[1]['value'] === "string") {
                        valuebuf.setText(value[1]['value']);
                    }
                    else {
                        throw "(case text): Value provided to key '" + value[0] + "' of '" + value[1]['value'] + "' (type: '" + typeof value[1]['value'] + "') did not match expected type '" + value[1]['type'] + "'";
                    }
                    break;
            }
            entries.get(i).setValue(valuebuf);
        });
        // Set the payload to the completed message, this will be needed later to sign the transaction
        this.payload_data = message;
        this.payload = payload;
        this.tx = struct;
        this.tx_data = tx;
    }
    sign(sender_sk) {
        this.sender_vk = wallet.get_vk(sender_sk);
        // set the sender
        this.payload.setSender(this.sender_vk);
        // Request the nonce if nonces enabled, otherwise calculate it locally
        if (this.nonce_enabled) {
            throw "Requesting nonces is currently not supported in CilantroJS";
        }
        else {
            this.nonce = this.sender_vk + 'B'.repeat(64);
        }
        this.payload.setNonce(this.nonce);
        // Get the payload bytes
        const plbytes = new Uint8Array(this.payload_data.toArrayBuffer());
        // Get signature
        this.signature = wallet.sign(sender_sk, plbytes);
        const sigbuf = helpers.str2ab(this.signature);
        const msig = this.metadata.initSignature(sigbuf.byteLength);
        msig.copyBuffer(sigbuf);
        // Calculate POW
        this.pow = pow.find(plbytes).pow;
        const powbuf = helpers.str2ab(this.pow);
        const mpow = this.metadata.initProof(powbuf.byteLength);
        mpow.copyBuffer(powbuf);
        // Set payload of tx -- payload binary
        const pl = this.tx_data.initPayload(plbytes.byteLength);
        pl.copyBuffer(plbytes);
    }
    // NOTE: On deserialization, we cannot extract the sender sk, only the sender
    //       vk. This is the desired behavior.
    createFromBytesPacked(i) {
        this.tx = new capnp.Message(i);
        const tx = this.tx.getRoot(transactionSchemas.ContractTransaction);
        const metadata = tx.getMetadata();
        // Since the stored payload is an array buffer, we need to put it into a message
        // in order to properly deserialize it into a readable object
        const payloadMessage = new capnp.Message(tx.getPayload().toUint8Array(), false);
        const payload = payloadMessage.getRoot(transactionSchemas.ContractPayload);
        this.sender_vk = payload.getSender();
        this.stamps_supplied = payload.getStampsSupplied().toNumber();
        this.nonce = payload.getNonce();
        this.contract_name = payload.getContractName();
        this.func_name = payload.getFunctionName();
        this.signature = metadata.getSignature().toString();
        this.pow = metadata.getProof().toString();
        // Unpacking kwargs is going to be tricky
        const kwargsEntries = payload.getKwargs().getEntries();
        this.kwargs = {};
        // Iterate over the entries in the kwargs entries map
        kwargsEntries.forEach(function (entry) {
            // Get the key and set it in the kwargs object
            var key = entry.getKey();
            this.kwargs[key] = {};
            // Setup a new capnp struct to load in the underlying pointer and cast it into a
            // Value structure
            var entryMessage = new capnp.Message();
            var entryData = entryMessage.initRoot(valueSchemas.Value);
            entryMessage.setRoot(entry.getValue());
            // Figure out what type (of the supported types) the current value is in order
            // to properly pull it out back into its original form
            var which = entryData.which();
            var which_key = Object.keys(valueSchemas.Value_Which).find(k => valueSchemas.Value_Which[k] === which);
            var value = null;
            var _type = null;
            if (which === valueSchemas.Value.BOOL) {
                value = entryData.getBool();
                _type = 'bool';
            }
            else if (which === valueSchemas.Value.UINT64) {
                value = entryData.getUint64();
                _type = 'uint64';
            }
            else if (which === valueSchemas.Value.FIXED_POINT) {
                value = Number(entryData.getFixedPoint());
                _type = 'fixedPoint';
            }
            else if (which === valueSchemas.Value.TEXT) {
                value = entryData.getText();
                _type = 'text';
            }
            else {
                throw "cilantro-js does not support Value of type " + which_key;
            }
            this.kwargs[key]['value'] = value;
            this.kwargs[key]['type'] = _type;
        }.bind(this));
    }
    toBytesPacked() {
        return this.tx.toPackedArrayBuffer();
    }
    toBytes() {
        return this.tx.toArrayBuffer();
    }
    deserializePayload(i) {
        const msg = new capnp.Message(i);
        const payload = msg.getRoot(transactionSchemas.ContractPayload);
        return payload;
    }
    deserializeData(i) {
        const msg = new capnp.Message(i);
        const tx = msg.getRoot(transactionSchemas.ContractTransaction);
        return tx;
    }
}
