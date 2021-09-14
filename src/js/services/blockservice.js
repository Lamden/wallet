const fetch = require('node-fetch').default;

export const getBlockservice = (url, port) => {
    const fullURL = `${url}:${port}`

    async function getCurrentKeyValue(contractName, variableName, key){
        try{
            let endpont = 'current/one'
            let data = await fetch(`${fullURL}/${endpont}/${contractName}/${variableName}/${key}`)
            .then(res => res.json())
            return data
        }catch(e){
            return e
        }
    }

    async function getCurrentKeysValues(keysToGet){
        try{
            let endpont = 'current/keys'
            let data = await fetch(`${fullURL}/${endpont}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(keysToGet)
            })
            .then(res => res.json())
            return data
        }catch(e){
            return e
        }
    }


    return{
        getCurrentKeyValue,
        getCurrentKeysValues
    }
}