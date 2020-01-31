const routes = {
    'ping': '/ping'
}

export function masternodeAPI(networkObj, endpoint, data, callback){
    return fetch(`${networkObj.ip}:${networkObj.port}${routes[endpoint]}`)
           .then(res => res.json())
           .then(json => {
                return callback(json, undefined)
           })
           .catch(err => {
                console.log(err)
                return callback(undefined, err)
            })
}
