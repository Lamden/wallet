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
            if (typeof pwd  !== "undefined" && !pwd) return false;
            if(decryptObject( pwd, JSON.parse(localStorage.getItem('coins'))) == false) return false;
            return true;
        },
        getCoin: (coin) => {
            return get(CoinStore).find( f => {
                return  f.network === coin.network && f.symbol === coin.symbol && f.vk === coin.vk;
            });
        },
        updateBalances: (storeValue) => {
            console.log('!! REFRESHING BALANCES !!')
        },
        updateCoinTransaction: (coinToUpdate, tx_info) => {
            update(coinstore => {
                let coin = getCoin(coinToUpdate, coinstore)
                coin.txList = !coin.txList ? [tx_info] : [...coin.txList, tx_info];
                return coinstore;
            })
        }
    };
}
export const CoinStore = createCoinStore();

export const password = derived(CoinStore.passwordStore, ($passwordStore) => $passwordStore);
