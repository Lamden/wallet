import * as capnp from 'capnp-ts';
import { TransactionPayload, Transaction } from './transaction.capnp';
import { Value } from './values.capnp';
import * as wallet from './wallet';
import * as pow from './pow';
export class TransactionBuilder {
    constructor(networkNode, sender, contract, func, kwargs, stamps, nonce = undefined, processor = undefined) {
        function checkUndefined(value, name){
            if (typeof value !== 'undefined') return value;
            throw new Error(`${name} is undefined`)
        }

        //Stores variables in self for convenience
        this.networkNode = checkUndefined(networkNode, 'networkNode')
        this.sender = checkUndefined(sender, 'sender')
        this.stamps = checkUndefined(stamps, 'stamps');
        this.contract = checkUndefined(contract, 'contract');;
        this.func = checkUndefined(func, 'func');
        this.kwargs = checkUndefined(kwargs, 'kwargs');
        this.nonce = nonce;
        this.processor = processor;
        this.proofGenerated = false;
        this.transactionSigned = false;
        //Create Capnp messages and transactionMessages
        this.payloadMessage = new capnp.Message();
        this.payload = this.payloadMessage.initRoot(TransactionPayload);
        this.transactionMessage = new capnp.Message();
        this.transaction = this.transactionMessage.initRoot(Transaction);
        this.transactionMetadata = this.transaction.initMetadata();
        this.transaction.initPayload();
        //Start creating Payload by setting the values in the capnp message
        //Set Nonce will need to called externally to compelte the Payload

        //If Nonce or Processor are not provided then getNonce can be called to set both from the masternode
        if (this.nonce != null) this.nonce = nonce;
        if (this.processor != null) this.processor = processor;
    }
    numberToUnit64(number) {
        if (number == null)
            return;
        return capnp.Uint64.fromNumber(number);
    }
    isStringHex(string = '') {
        let hexRegEx = /([0-9]|[a-f])/gim;
        return typeof string === 'string' &&
            (string.match(hexRegEx) || []).length === string.length;
    }
    hexStringToByte(string = '') {
        let a = [];
        for (let i = 0, len = string.length; i < len; i += 2) {
            a.push(parseInt(string.substr(i, 2), 16));
        }
        return new Uint8Array(a);
    }
    byteToHexString(uint8arr) {
        var hexStr = '';
        for (var i = 0; i < uint8arr.length; i++) {
          var hex = (uint8arr[i] & 0xff).toString(16);
          hex = (hex.length === 1) ? '0' + hex : hex;
          hexStr += hex;
        }
        return hexStr.toUpperCase();
    }
    stringToArrayBuffer(string) {
        var buffer = new ArrayBuffer(string.length);
        var bufferView = new Uint8Array(buffer);
        for (var i=0, strLen=string.length; i<strLen; i++) {
          bufferView[i] = string.charCodeAt(i);
        }
        return buffer;
    }
    kwargsCount() {
        return Object.keys(this.kwargs).length;
    }
    setKwargsInPayload() {
        let kwargs = this.payload.initKwargs();
        let kwargsEntries = kwargs.initEntries(this.kwargsCount());
        
        if (this.kwargsCount() > 0) {
            Object.keys(this.kwargs).map((key, index) => {
                //Check for type and value object properties
                this.vaildateKwarg(key, this.kwargs[key]);
                //Create a value pointer to set the Key (text)
                // ** This does not compile in Typescript but does create the correct
                // result in javascript.  This is uncommented in the javascript implementation
                // but commented out here so this can compile.

                let keyMessage = new capnp.Message().initRoot(capnp.Text);
                keyMessage.set(0, key)
                kwargsEntries.get(index).setKey(keyMessage)

                //Set the assocaited Value for the kwarg entry
                kwargsEntries.get(index).setValue(this.mapTypes(this.kwargs[key]));
            });
        }
    }
    vaildateKwarg(key = undefined, value) {
        //Match what the user provided as the type typeof results with.
        const typeLookup = {
            address: "string",
            bool: "boolean",
            fixedPoint: "number",
            text: "string",
            data: "string"
        };
        if (key == null)
            //Error if key not provided
            throw new TypeError(`"key" cannot be empty string`);
        if (value.type === undefined)
            //Error if the user did not specifiy the type of kwarg data
            throw new TypeError(`"${key}" kwarg has no type (bool, string, uint64, fixedPoint)`);
        if (!typeLookup.hasOwnProperty(value.type))
            //Error if the user did not specifiy the type of kwarg data
            throw new TypeError(`Data type "${value.type}" is not supported by Lamden at this time.  Supported type are ${Object.keys(typeLookup).toString}`);
        if (value.value === undefined)
            //Error if the user did not specifiy any kwarg data
            throw new TypeError(`"${key}" kwarg has no value property.`);
        let valueType = typeof value.value;
        if (valueType !== typeLookup[value.type])
            //Error if the user supplied type does not match the actual kwarg data type
            throw new TypeError(`"${key}" kwarg value is incorrect type or type assignment is incorrect. Recieved value of type "${valueType}" with type property "${value.type}"`);
        if (value.type === 'data' && !this.isStringHex(value.value))
            //Make sure the value for data type can covert to hex
            throw new TypeError(`"${key}" kwarge value should be hex for "data" type`);
    }
    mapTypes(value) {
        let kwargValue = value.value;
        let kwargType = value.type;
        //Create a Value pointer that we will set with the appropriate Type
        //depending on the value supplied by the user
        let pointer = new capnp.Message().initRoot(Value);
        const setPointerType = {
            'text': () => pointer.setText(kwargValue),
            'address': () => pointer.setText(kwargValue),
            'bool': () => pointer.setBool(kwargValue),
            'fixedPoint': () => pointer.setFixedPoint(kwargValue.toString()),
            'data': () => {
                let dataBuffer = this.hexStringToByte(kwargValue);
                let dataPointer = pointer.initData(dataBuffer.length);
                dataPointer.copyBuffer(dataBuffer);
            },
        };
        try {
            setPointerType[kwargType]();
        }
        catch (e) {
            throw new Error(`Could not set value ${kwargValue} with type ${kwargType}. Error: ${e}`);
        }
        return pointer;
    }
    getNonce(callback = undefined) {
        return fetch(`${this.networkNode}/nonce/${this.sender}`)
            .then(res => { this.nonceResponse = res; return res.json(); })
            .then(res => {
            this.nonceResult = res;
            this.nonce = this.nonceResult.nonce;
            this.processor = this.nonceResult.processor;
            if (callback != null) {
                return callback(res);
            }
            return this.nonceResult;
        })
            .catch(err => callback(undefined, `Unable to get nonce for ${this.sender}. Error: ${err}`))
    }
    setNetworkNode(networkNode){
        this.networkNode = networkNode;
    }
    setSender() {
        let senderBuffer = this.hexStringToByte(this.sender);
        let senderPayload = this.payload.initSender(senderBuffer.byteLength);
        senderPayload.copyBuffer(senderBuffer);
    }
    setNonce() {
        this.payload.setNonce(this.numberToUnit64(this.nonce));
    }
    setProcessor() {
        let processorBuffer = this.hexStringToByte(this.processor);
        let processorPayload = this.payload.initProcessor(processorBuffer.byteLength);
        processorPayload.copyBuffer(processorBuffer);
    }
    setContract() {
        this.payload.setContractName(this.contract);
    }
    setFunctionName() {
        this.payload.setFunctionName(this.func);
    }
    setStamps() {
        this.payload.setStampsSupplied(this.numberToUnit64(this.stamps));
    }
    makePayload(){
        this.setSender(this.sender);
        this.setProcessor(this.processor);
        this.setNonce(this.processor);
        this.setContract(this.contract);
        this.setFunctionName(this.func);
        this.setStamps(this.stamps);
        this.setKwargsInPayload();
    }
    setPayloadBytes() {
        if (this.nonce == null)
            throw new Error('No Nonce Set');
        if (this.processor == null)
            throw new Error('No Processor Set');
        //Set the Transaction Paylaod to Uint8Array so it can be signed.
        this.makePayload();
        this.payloadBytes = new Uint8Array(this.payloadMessage.toPackedArrayBuffer());
    }
    sign(sk) {
        if (this.payloadBytes == null) this.setPayloadBytes();
        // Get signature
        this.signature = wallet.sign(sk, this.payloadBytes);
        this.transactionSigned = true;
    }
    setSignature() {
        // Set the signature in the transcation metadata
        if (!this.transactionSigned) throw new Error(`No signature present. Use the "sign" method then try again.`)
        const signatureBuffer = this.hexStringToByte(this.signature);
        const messageSignature = this.transactionMetadata.initSignature(signatureBuffer.byteLength);
        messageSignature.copyBuffer(signatureBuffer);
    }
    generate_proof() {
        // Generate a proof of work from the payloadBytes
        if (this.payloadBytes == null)
            this.setPayloadBytes();
        this.proof = pow.find(this.payloadBytes).pow;
        this.proofGenerated = true;
    }
    setProof() {
        // Store the proof of work in the transaction metadata
        if (!this.proofGenerated)
            this.generate_proof();
        const proofBuffer = this.hexStringToByte(this.proof);
        const messageProof = this.transactionMetadata.initProof(proofBuffer.byteLength);
        messageProof.copyBuffer(proofBuffer);
    }
    setTimeStamp() {
        // Store timstamp in the transaction metadata
        this.transactionMetadata.setTimestamp(+new Date/1000);
    }
    setTransactionPayload() {
        // Store Transaction Payload in the transaction
        this.transaction.setPayload(this.payload);
    }
    setTransactionMetadata() {
        // Store Transaction Payload in the transaction
        this.transaction.setMetadata(this.transactionMetadata);
    }
    setTransactionBytes() {
        this.transactonBytes = this.transactionMessage.toPackedArrayBuffer();
    }
    serialize() {
        this.setTransactionPayload();
        this.setSignature();
        this.setProof();
        this.setTimeStamp();
        this.setTransactionBytes();
        return this.transactonBytes;
    }
    send(sk = undefined, callback = undefined) {
        if (this.networkNode === '')
            throw new Error(`No Network information set`);
        if (sk == null && !this.transactionSigned)
            throw new Error(`Transation Not Signed: Private key needed to sign transaction.`);
        
        if (sk != null)
            this.sign(sk);
            
        
        const data = this.serialize();
        return fetch(this.networkNode, {
            method: 'POST',
            body: data
        })
            .then(res => { this.transactionResponse = res; return res.json(); })
            .then(res => {
                this.transactionResult = res;
                if (callback != null) {
                    return callback(res);
                }
                return this.transactionResult;
            })
            .catch(err => { return callback(undefined, err) });
    }
}
