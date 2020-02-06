import { writable, get, derived } from 'svelte/store';
import { encryptObject, decryptObject } from '../../js/utils.js';
import { isStringWithValue, copyItem, isCoinInfoObj, isNumber, isArray } from './stores.js';

const createCoinStore = () => {
    let startValue;
    //Create intial password as empty string
    const passwordStore = writable('');
    const lockedStore = writable(true);

    //If password hasn't beeen set then set the CoinStore inital value to an empty array
    //because we don't have a password to decrypt it yet (Wallet is locked)
    if ( get(passwordStore) === '' ) startValue = [];
    const CoinStore = writable(startValue);

    //This is called everytime the CoinStore updated
    CoinStore.subscribe(current => {
        //Make sure we have a password value before encrypting the store
        if ( !get(lockedStore) ){
            //Only accept object to be saved to the localstorage
            if (isArray(current)) {
                localStorage.setItem('coins', JSON.stringify( encryptObject( get(passwordStore), current)));
            }else{
                //Get the CoinStore from local storage
                const encryptedStorage = localStorage.getItem('coins');
                if (encryptedStorage) {
                    //Try and decrypt it with the passwordStore Value
                    let decryptedStorage = decryptObject( get(passwordStore), JSON.parse(encryptedStorage))
                    if (decryptedStorage) CoinStore.set(decryptedStorage)
                    console.log('Recovered from bad Coin Store Value')
                }                
            }
        }
    });

    //This is called everytime the password Store is updated
    passwordStore.subscribe(currPwd => {
        //Do this only if the password being send in isn't an empty string
        if (currPwd !== ''){

            CoinStore.update(curr => {
                //Get the CoinStore from local storage
                const encryptedStorage = localStorage.getItem('coins');

                if (encryptedStorage) {
                    //Try and decrypt it with the passwordStore Value
                    let decryptedStorage = decryptObject( get(passwordStore), JSON.parse(encryptedStorage))
                    startValue = decryptedStorage;
                    //If decryption was valid then save the store as a backup (incase the main store gets corrupted)
                    if (decryptedStorage) localStorage.setItem('backup', encryptedStorage);
                    //If there was an issue decrypting the store then try to use the backup
                    else if(localStorage.getItem('backup')) {
                        const encryptedBackupStorage = localStorage.getItem('backup');
                        startValue = decryptObject( get(passwordStore), JSON.parse(encryptedBackupStorage))
                    }
                }

                //Return the CoinStore value from localstorage if one was decrypted
                if (startValue) {
                    lockedStore.set(false);
                    return startValue;
                } 
                //Return an empty array if decryption was unsuccessful.
                return [];
            })
        }else{
            lockedStore.set(true);
            CoinStore.set([]);
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
        lockedStore,
        //Set the password to an empty string with will force the store
        //to return an empty array
        lockCoinStore: () =>{
            setPwd('')
        },
        //This function will attempt to decrypt the localstorage value with an installed password
        //and return true of false depending on the result
        validatePassword: (pwd) => {
            if (!isStringWithValue(pwd)) return false;
            if (!localStorage.getItem('coins')) return false;
            if(decryptObject( pwd, JSON.parse(localStorage.getItem('coins'))) === false) return false;
            return true;
        },
        //Add a coin to the internal coin storage
        addCoin: (coinInfo) => {
            //Reject missing or undefined arguments
            if (!isCoinInfoObj(coinInfo)) return {added: false, reason: 'badArg'};

            //Set the coin to watch only if no private key supplied
            if (!coinInfo.sk) coinInfo.sk = 'watchOnly'
            
            coinInfo = copyItem(coinInfo);
            //Check if the coin already exists in coinstore
            let coinFound = get(CoinStore).find( f => {
                return f.network === coinInfo.network && f.symbol === coinInfo.symbol && f.vk === coinInfo.vk;
            });
            if (!coinFound){
                //If the coin doesn't exists then push it to the array
                CoinStore.update(coinstore => {
                    coinstore.push(coinInfo)
                    return coinstore;
                })
                return {added: true, reason: 'new'}
            } else {
                //Check if we need to update the sk of a previously added "watch only" coin
                if (coinFound.sk === "watchOnly" && coinInfo.sk !== "watchOnly"){
                    CoinStore.update(coinstore => {
                        coinstore.map( coin => {
                            if(coin.network === coinInfo.network && coin.symbol === coinInfo.symbol && coin.vk === coinInfo.vk){
                                coin.sk = coinInfo.sk;
                            }
                        });
                        return coinstore;
                    })
                    return {added: true, reason: `${coinFound.nickname}'s Private Key Updated`}
                } else {
                    //Reject adding a dupliate Coin
                    return {added: false, reason: 'duplicate'}
                }
            }
        },
        //Retrive a specific coin from the Coin Store
        getCoin: (coinInfo) => {
            //Reject missing or undefined arguments
            if (!isCoinInfoObj(coinInfo)) return;

            //Return the matching coin (will be undefined if not matched)
            return get(CoinStore).find( f => {
                return  f.network === coinInfo.network && f.symbol === coinInfo.symbol && f.vk === coinInfo.vk;
            });
        },
        //Update the balance of a coin
        updateBalance: (coinInfo, balance) => {
            //Reject missing or undefined arguments
            if (!isCoinInfoObj(coinInfo) || !isNumber(balance)) return;
            
            CoinStore.update(coinstore => {
                //Find the coin to update in the store
                let coinToUpdate = coinstore.find( f => {
                    return  f.network === coinInfo.network && f.symbol === coinInfo.symbol && f.vk === coinInfo.vk;
                });
                
                //If the coin was matched then update the balance to the one provided
                if (coinToUpdate){
                    coinToUpdate.balance = balance;
                };
                return coinstore;
            })
        }
    };
}
//Create CoinStore instance
export const CoinStore = createCoinStore();

//Create a derived store to show if the store us locked
export const lockedStorage = derived(CoinStore.lockedStore, ($lockedStore) => $lockedStore);

//Create a derived store to share password to components
export const password = derived(CoinStore.passwordStore, ($passwordStore) => $passwordStore);

//Create a derived store to total all wallets
export const balanceTotal = derived(CoinStore, ($CoinStore) => {
    let total = 0;
    $CoinStore.map(coin => {
        if (!coin.balance) return
        total  = total + coin.balance;
    })
    return total;
});