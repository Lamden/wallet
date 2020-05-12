const validators = require('types-validate-assert')
const { validateTypes } = validators;
const fetch = require('node-fetch');

module.exports = class ClearingHouse_API{
    constructor(){
        this.url = 'http://167.99.173.97/swap'
    }

    //This will throw an error if the protocol wasn't included in the host string
    send(method, path, data, callback){
        let parms = '';
        if (Object.keys(data).includes('parms')) {
            parms = this.createParms(data.parms)
        }

        let options = {}
        if (method === 'POST'){
            let headers = {'Content-Type': 'application/json'}
            options.method = method
            options.headers = headers;
            options.body = data;
        }
        return fetch(`${this.url}${path}${parms}`, options)
            .then(res => {
                return res.json()
            } )
            .then(json => {
                    return callback(json, undefined)
            })
            .catch(err => {
                    console.log(err)
                    return callback(undefined, err.toString())
                })
    }

    createParms(parms){
        if (Object.keys(parms).length === 0) return ''
        let parmString = '?'
        Object.keys(parms).forEach(key => {
            parmString = `${parmString}${key}=${parms[key]}&`
        });
        return parmString.slice(0, -1);
    }

    async startSwap(swapObject){
        if (!validateTypes.isStringWithValue(swapObject.ethAddress)) throw new Error('Cannot Start Swap: Missing paramater Ethereum Address <string>.')
        if (!validateTypes.isStringWithValue(swapObject.lamdenAddress)) throw new Error('Cannot Start Swap: Missing paramater Lamden Address <string>.')

        let parms = {};
        parms.eth = swapObject.ethAddress
        parms.tau = swapObject.lamdenAddress

        let path = `/start`
        return this.send('POST', path, {parms}, (res, err) => {
            try{
                if (res) return res
            } catch (e){throw new Error(e)}
            throw new Error(err)
        })
    }
    async checkSwapStatus(uuid){
        if (!validateTypes.isStringWithValue(uuid)) throw new Error('Missing paramater UUID <string>.')
        const parms = {uuid};
        return this.send('GET', '/lookup', {parms}, (res, err) => {
            try{
                if (res) return res
            } catch (e){throw new Error(e)}
            throw new Error(err)
        })  
    }
}