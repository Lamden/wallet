import { EventEmitter } from 'events'
import { ValidateTypes } from './validateTypes'
import { LamdenMasterNode_API } from './masternode-api'
const validate = new ValidateTypes();

export class Network extends EventEmitter {
    // Constructor needs an Object with the following information to build Class.
    //
    // networkInfo: {
    //      host: <string> masternode webserver hostname/ip,
    //      port: <string> masternode webserver port,
    //      type: <string> "testnet", "mainnet" or "mockchain"
    //  },
    constructor(networkInfoObj){
        super();
        console.log(networkInfoObj)
        const lamdenNetworkTypes = ['mockchain', 'testnet', 'mainnet']
        //Reject undefined or missing info
        if (!validate.isObjectWithKeys(networkInfoObj)) throw new Error(`Expected Network Info Object and got Type: ${typeof networkInfoObj}`)
        if (!validate.isStringWithValue(networkInfoObj.host)) throw new Error(`HOST Required (Type: String)`)
        if (!validate.isStringWithValue(networkInfoObj.port)) throw new Error(`PORT Required (Type: String)`)
        if (!validate.isStringWithValue(networkInfoObj.type)) throw new Error(`Network Type Required (Type: String)`)

        this.type = networkInfoObj.type.toLowerCase();

        this.host = this.vaidateProtocol(networkInfoObj.host.toLowerCase());
        this.port = networkInfoObj.port;
        this.url = `${this.host}:${this.port}`
        this.name = validate.isStringWithValue(networkInfoObj.name) ? networkInfoObj.name : undefined;
        this.lamden = validate.isBoolean(networkInfoObj.lamden) ? networkInfoObj.lamden : undefined;
    
        this.online = false;
        try{
            this.API = new LamdenMasterNode_API(networkInfoObj)
        } catch (e) {
            throw new Error(e)
        }
        
        if (!lamdenNetworkTypes.includes(this.type)) {
            throw new Error(`${this.type} not in Lamden Network Types: ${JSON.stringify(lamdenNetworkTypes)}`)
        }
        
        this.mainnet = this.type === 'mainnet'
        this.testnet = this.type === 'testnet'
        this.mockchain = this.type === 'mockchain'

    }
    //This will throw an error if the protocol wasn't included in the host string
    vaidateProtocol(host){
        let protocols = ['https://', 'http://']
        if (protocols.map(protocol => host.includes(protocol)).includes(true)) return host
        throw new Error('Host String must include http:// or https://')
    }
    //Check if the network is online
    //Emits boolean as 'online' event
    //Also returns status as well as passes status to a callback
    async ping(callback = undefined){
        this.online = await this.API.pingServer()
        this.emit('online', this.online, `${this.url} is ${this.online}`);
        if (validate.isFunction(callback)) callback(this.online)
        return this.online
    }
    getNetworkInfo(){
        return {
            type: this.type,
            host: this.host,
            port: this.port,
            url: this.url,
            online: this.online,
            mainnet: this.mainnet,
            testnet: this.testnet,
            mockchain: this.mockchain
        }
    }
}