// import { io } from "socket.io-client";
//import Url from "url-parse";

const networkKey = (networkObj) => {
    return `${networkObj.name}|${networkObj.type}|${networkObj.lamden ? 'lamden': 'user'}`
}

export const createSocketService = () => {

    let socket;
    // let connectionExist = false
    // chrome.storage.local.get({"networks":{}}, function(getValue) {
    //     let nets = getValue.networks;
    //     if (nets && Object.keys(nets).length > 0) {
    //         const networks = [...nets.lamden, ...nets.user]
    //         const foundNetwork = networks.find(network => nets.current === networkKey(network))
    //         let blockservice = foundNetwork.blockservice_hosts[0];
    //         // start socket server
    //         if (blockservice) {
    //             start(blockservice);
    //             //document.dispatchEvent(new Event('BlockServiceProvided'));
    //         } else {
    //            //document.dispatchEvent(new Event('BlockServiceNotProvided'));
    //             close();
    //         }
    //     }
    // })

    function start(service){
        // if (socket) {
        //     close()
        //     connectionExist = false
        // }
        // let sUrl = new Url(service)
        // let path = sUrl.pathname.endsWith('/') ? sUrl.pathname.slice(0, -1) : sUrl.pathname
        // socket = io.connect(sUrl.origin, {path: `${path}/socket.io`});
        // socket.on('connect', () => {
        //     console.log(`Client ${socket.id} connected to wallet block service: ${service}`)
        //     connectionExist = true;
        //     //document.dispatchEvent(new Event('BlockServiceConnected'));
        // })  
    }

    function close(){
        // if (socket.connected) {
        //     socket.disconnect()
        // }
    }

    // Currency Balance Services Join and Leave

    function joinCurrencyBalanceFeed(accountVk){
        joinBalanceFeed('currency', 'balances', accountVk)
    }

    function leaveCurrencyBalanceFeed(accountVk){
        leaveBalanceFeed('currency', 'balances', accountVk)
    }

    // Token Balance Services Join and Leave
    function joinTokenBalanceFeed(tokenContract, accountVk){
        joinBalanceFeed(tokenContract, 'balances', accountVk)
    }

    function leaveTokenBalanceFeed(tokenContract, accountVk){
        leaveBalanceFeed(tokenContract, 'balances', accountVk)
    }

    // Global Joins and Leaves
    function joinBalanceFeed(contract, variable, key){
        if (!socket) return
        socket.emit('join', `${contract}.${variable}:${key}`)
    }

    function leaveBalanceFeed(contract, variable, key){
        if (!socket) return
        socket.emit('leave', `${contract}.${variable}:${key}`)
    }

    function join(room) {
        if (!socket) return
        socket.emit('join', room)
    }

    function leave(room) {
        if (!socket) return
        socket.emit('leave', room)
    }

    function socket_on(event, callback) {
        if (!socket) return
        socket.on(event, callback)
    }

    function socket_off(listener) {
        if (!socket) return
        socket.offAny(listener);
    }

    return {
        start,
        joinCurrencyBalanceFeed,
        leaveCurrencyBalanceFeed,
        joinTokenBalanceFeed,
        leaveTokenBalanceFeed,
        socket_on,
        socket_off,
        close,
        join,
        leave,
    }
}