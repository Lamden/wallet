import { io } from "socket.io-client";

export const createSocketService = () => {
    let testnet_socket
    let mainnet_socket

    function start(){
        testnet_socket = io("ws://165.227.181.34:3535");
        // testnet_socket = io("ws://localhost:3535");
        mainnet_socket = io("ws://165.22.47.195:3535");
        
        testnet_socket.on('connect', () => {
            console.log("connected to TESTNET wallet block service")
        })
        
        mainnet_socket.on('connect', () => {
            console.log("connected to MAINNET wallet block service")
        })
    }

    // Currency Balance Services Join and Leave

    function joinCurrencyBalanceFeed(accountVk){
        joinBalanceFeed_Mainnet('currency', 'balances', accountVk)
        joinBalanceFeed_Testnet('currency', 'balances', accountVk)
    }

    function leaveCurrencyBalanceFeed(accountVk){
        leaveBalanceFeed_Mainnet('currency', 'balances', accountVk)
        leaveBalanceFeed_Testnet('currency', 'balances', accountVk)
    }

    // Token Balance Services Join and Leave
    function joinTokenBalanceFeed(tokenContract, accountVk, network){
        if (network === 'mainnet') joinBalanceFeed_Mainnet(tokenContract, 'balances', accountVk)
        if (network === 'testnet') joinBalanceFeed_Testnet(tokenContract, 'balances', accountVk)
    }

    function leaveTokenBalanceFeed(tokenContract, accountVk, network){
        if (network === 'mainnet') leaveBalanceFeed_Mainnet(tokenContract, 'balances', accountVk)
        if (network === 'testnet') leaveBalanceFeed_Testnet(tokenContract, 'balances', accountVk)
    }

    // Global Joins and Leaves
    function joinBalanceFeed_Mainnet(contract, variable, key){
        mainnet_socket.emit('join', `${contract}.${variable}:${key}`)
    }

    function joinBalanceFeed_Testnet(contract, variable, key){
        testnet_socket.emit('join', `${contract}.${variable}:${key}`)
    }

    function leaveBalanceFeed_Mainnet(contract, variable, key){
        mainnet_socket.emit('leave', `${contract}.${variable}:${key}`)
    }

    function leaveBalanceFeed_Testnet(contract, variable, key){
        testnet_socket.emit('leave', `${contract}.${variable}:${key}`)
    }

    start()

    return {
        start,
        joinCurrencyBalanceFeed,
        leaveCurrencyBalanceFeed,
        joinTokenBalanceFeed,
        leaveTokenBalanceFeed,
        testnet_socket_on: (event, callback) => testnet_socket.on(event, callback),
        mainnet_socket_on: (event, callback) => mainnet_socket.on(event, callback),
        testnet_socket_off: (event) => testnet_socket.off(event),
        mainnet_socket_off: (event) => mainnet_socket.off(event)
    }
}