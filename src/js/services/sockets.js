import { io } from "socket.io-client";
import Url from "url-parse";

export const createSocketService = () => {

    let socket;
    // eslint-disable-next-line no-unused-vars
    var connectionExist = false

    let currentService;

    function start(service, callback){
        if (currentService === service ) return;
        currentService = service;

        if (socket) {
            close()
            connectionExist = false
        }
        let sUrl = new Url(service)
        let path = sUrl.pathname.endsWith('/') ? sUrl.pathname.slice(0, -1) : sUrl.pathname
        socket = io(sUrl.origin, {path: `${path}/socket.io`});
        socket.on('connect', () => {
            console.log(`Client ${socket.id} connected to wallet block service: ${service}`)
            connectionExist = true;
            if (callback) callback()
        })  
    }

    function close(){
        if (socket.connected) {
            socket.disconnect()
        }
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
        isConnected: () => connectionExist,
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