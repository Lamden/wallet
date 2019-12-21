import { writable, get, derived } from 'svelte/store';
import { encryptObject, decryptObject } from '../../js/utils.js';

const createCoinStore = () => {
    let startValue;
    const passwordStore = writable('');

    if ( get(passwordStore) === '' ) startValue = [];
    const CoinStore = writable(startValue);

    CoinStore.subscribe(current => {
        if ( get(passwordStore) !== '' ){
            localStorage.setItem('coins', JSON.stringify( encryptObject( get(passwordStore), current)));
        }
    });

    passwordStore.subscribe(currPwd => {
        if (currPwd !== ''){
            CoinStore.update(curr => {
                const encryptedStorage = localStorage.getItem('coins');

                if (encryptedStorage) {
                    let decryptedStorage = decryptObject( get(passwordStore), JSON.parse(encryptedStorage))
                    startValue = decryptedStorage;
                    if (decryptedStorage) localStorage.setItem('backup', encryptedStorage);
                    else if(localStorage.getItem('backup')) {
                        const encryptedBackupStorage = localStorage.getItem('backup');
                        startValue = decryptObject( get(passwordStore), JSON.parse(encryptedBackupStorage))
                    }
                }

                if (startValue) return startValue;
                return [];
            })
        }
    });

    let subscribe = CoinStore.subscribe;
    let update = CoinStore.update;
    let set = CoinStore.set;
	let setPwd = passwordStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        setPwd,
        passwordStore,
        password: () => {return get(passwordStore)},
        validatePassword: (pwd) => {
            if (typeof pwd  !== "undefined" && !pwd && pwd === '') return false;
            if (!localStorage.getItem('coins')) return false;
            if(decryptObject( pwd, JSON.parse(localStorage.getItem('coins'))) === false) return false;
            return true;
        },
        getCoin: (coin) => {
            return get(CoinStore).find( f => {
                return  f.network === coin.network && f.symbol === coin.symbol && f.vk === coin.vk;
            });
        },
        updateBalance: (coin, balance) => {
            CoinStore.update(coinstore => {
                let coinToUpdate = coinstore.find( f => {
                    return  f.network === coin.network && f.symbol === coin.symbol && f.vk === coin.vk;
                });
                if (coinToUpdate){
                    coinToUpdate.balance = balance;
                };
                return coinstore;
            })
        },
        updateBalances: (network) => {
            /*
            CoinStore.update(coinstore => {
                coinstore.map(coin => {
                    fetch(`http://${network.ip}:${network.port}/contracts/currency/balances/?key=${coin.vk}`)
                    .then(res => res.json())
                    .then(res => {
                        res.value ? res.value : 0;
                        if (res.value !== balance) CoinStore.updateBalance(coin, parseFloat(res.value))
                    })
                    .catch(err => CoinStore.updateBalance(coin, 0))
                })
            })*/
        },
        updateCoinTransaction: (txInfo) => {
            txInfo = JSON.parse(JSON.stringify(txInfo))
            CoinStore.update(coinstore => {
                let coinToUpdate = coinstore.find( f => {
                    return  f.network === txInfo.sender.network && f.symbol === txInfo.sender.symbol && f.vk === txInfo.sender.vk;
                });
                if (coinToUpdate){
                    txInfo.date = new Date().toUTCString();
                    if (!coinToUpdate.txList) coinToUpdate.txList = [txInfo];
                    else coinToUpdate.txList.push(txInfo);
                };
                return coinstore;
            })

        },
        clearCoinTxHistory: (coin) => {
            CoinStore.update(coinstore => {
                let coinToUpdate = coinstore.find( f => {
                    return  f.network === coin.network && f.symbol === coin.symbol && f.vk === coin.vk;
                });
                if (coinToUpdate){
                    coinToUpdate.txList = [];
                };
                return coinstore;
            })
        }
    };
}
export const CoinStore = createCoinStore();

export const password = derived(CoinStore.passwordStore, ($passwordStore) => $passwordStore);

export const balanceTotal = derived(CoinStore, ($CoinStore) => {
    let total = 0;
    $CoinStore.map(coin => {
        if (!coin.balance) return
        total  = total + coin.balance;
    })
    return total;
});