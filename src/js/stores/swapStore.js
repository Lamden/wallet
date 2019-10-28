import { writable, get, derived } from 'svelte/store';

const createSwapStore = (key, startValue) => {
    const SwapStore = writable(startValue);
    let subscribe = SwapStore.subscribe;
    let update = SwapStore.update;
    let set = SwapStore.set;

    return {
        startValue,
        subscribe,
        update,
        set,
        useLocalStorage: () => {  
            const json = localStorage.getItem(key);
            if (json) {
                let returnstr = JSON.parse(json)
                set(returnstr);
            }
            
            subscribe(current => {
                localStorage.setItem(key, JSON.stringify(current));
            });
        },
        reset: () => {
            update(current => {current = startValue; return current;})
        },
        setSwap: (swap) => {
            console.log(swap)
            return update(current => {current.push(swap); return current;})
        },
        getSwap: (secret_hash) => {
            return get(SwapStore).find( f => f.secret_hash === secret_hash);
        },
        updateSwapKey: (secret_hash, key, data) => {
            update(current => {
                let swap = current.find( f => f.secret_hash === secret_hash );
                swap[key] = data;
                return current;
            })
        },
        updateSwapStore: (swapInfo) => {
            update(current => {
                let swap = current.find( f => f.secret_hash === swapInfo.secret_hash );
                if(swap) swap = swapInfo;
                return current;
            })
        },
        confirmTx: (swapInfo, txName) => {
            update(current => {
                let swap = current.find( f => f.secret_hash === swapInfo.secret_hash );
                if(swap) {
                    swap[txName].sent = new Date();
                }
                return current;
            })
        },
        deleteSwap: (secret_hash) => {
            console.log(secret_hash)
            update(current => {
                return current.filter(f => {
                    console.log(f.secret_hash)
                    return f.secret_hash !== secret_hash;
                })
            })
        }
    };
}

export const SwapStore = createSwapStore('swaps', []);

export const swapCount = derived(
	SwapStore,
	$SwapStore => $SwapStore.length
);

function determineSwapState(swap, swapstore){
    if (swap.hasOwnProperty('redeemTxResult')) return {text:'Completed', num:7};
    if (swap.hasOwnProperty('refundTxResult')) return {text:'Refunded', num:6};
    if (swap.hasOwnProperty('sendCoinsTxResult')){
        if (swap.sendCoinsTxResult.sent) return {text:'Sent Coins to Contract: Tx Confirmed!', num:5};
        confirmSwapTransaction(swap, 'sendCoinsTxResult', swap.sending, swapstore)
        return {text:'Sent Coins to Contract: Tx Unconfirmed', num:4};
    }
    if (swap.hasOwnProperty('approveTxResult')){
        if (swap.approveTxResult.sent) return {text:'Approval Transaction Sent: Tx Confirmed!', num:3};
        confirmSwapTransaction(swap, 'approveTxResult', swap.sending, swapstore)
        return {text:'Approval Transaction Sent: Tx Unconfirmed', num:2};
    }
    return {text:'Started', num:1};
}

function confirmSwapTransaction(swap, txName, coin, swapstore){
    waitUntilTransactionExists(coin.network_symbol, swap[txName].transaction_address)
        .then(result => {
            console.log(result)
            swapstore.confirmTx(swap, txName)
        })
        .catch(e => console.log(e));
}

export const initialSwaps = derived(
    SwapStore,
    $SwapStore => {
        let swaps = $SwapStore.filter(f => f.type === 'initial' )
        swaps.map(swap => {
            swap.swapState = determineSwapState(swap, SwapStore);
        })
        return swaps;
    }
);

export const participateSwaps = derived(
    SwapStore,
    $SwapStore => {
        let swaps = $SwapStore.filter(f => f.type === 'participate' )
        swaps.map(swap => {
            swap.swapState = determineSwapState(swap);
        })
        return swaps;
    }
);
