const validators = require('types-validate-assert')
const { validateTypes } = validators;
const fetch = require('node-fetch');

module.exports = class ClearingHouse_API{
    constructor(){
        this.url = 'https://tokenswap.lamden.io'
    }

    //This will throw an error if the protocol wasn't included in the host string
    send(method, path, data, callback){
        let options = {}
        if (method === 'POST'){
            let headers = {'Content-Type': 'application/json'}
            options.method = method
            options.headers = headers;
            options.body = JSON.stringify(data);
        }
        
        return fetch(`${this.url}${path}`, options)
            .then((res) => {
                const contentType = res.headers.get('Content-Type')
                if (contentType.includes('application/json')) {
                    return res.json()
                }else{
                    return res.text()
                }
            })
            .then(data => {
                    return callback(data, undefined)
            })
            .catch(err => {
                console.log(err)
                return callback(undefined, err)
                })
    }

    async startSwap(swapObject){
        if (!validateTypes.isStringWithValue(swapObject.tx)) throw new Error('Cannot Start Swap: Missing paramater Ethereum Tx Hash <string>.')
        if (!validateTypes.isArrayWithValues(swapObject.answers)) throw new Error('Cannot Start Swap: Missing paramater Answers <array>.')

        return this.send('POST', '/swap', swapObject, (res, err) => {
            if (err) return err;
            else return res;
        })
    }
}