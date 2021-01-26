const validators = require('types-validate-assert')
const { validateTypes } = validators;

const fetch = require('node-fetch').default;


export class LamdenBlockexplorer_API{
    constructor(url){
        if (!validateTypes.isStringWithValue(url)) throw new Error(`Need blockexplorer URL`)
        this.url = url;        
    }

    send(method, path, data, overrideURL, callback){
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

        return fetch(`${overrideURL ? overrideURL : this.url}${path}${parms}`, options)
            .then(res => {
                return res.json()
            } )
            .then(json => {
                    return callback(json, undefined)
            })
            .catch(err => {
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

    async getKeys(data){
        let path = '/states/history/getKeys'
        return this.send('POST', path, JSON.stringify(data), undefined, (res, err) => {
            if (err) return;
            return res
        })
    }
}