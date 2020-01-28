import { writable, get, derived } from 'svelte/store';
import { encryptObject, decryptObject } from '../../js/utils.js';

const createCoinStore = () => {
    let startValue;
    //Create intial password as empty string
    const passwordStore = writable('');

    //If password hasn't beeen set then set the CoinStore inital value to an empty array
    //because we don't have a password to decrypt it yet (Wallet is locked)
    if ( get(passwordStore) === '' ) startValue = [];
    const CoinStore = writable(startValue);

    //This is called everytime the CoinStore updated
    CoinStore.subscribe(current => {
        //Make sure we have a password value before encrypting the store
        if ( get(passwordStore) !== '' ){
            localStorage.setItem('coins', JSON.stringify( encryptObject( get(passwordStore), current)));
        }
    });

    //This is called everytime the password Store is updated
    passwordStore.subscribe(currPwd => {
        //Do this only if the password being send in isn't an empty string
        if (currPwd !== ''){
            
            CoinStore.update(curr => {
                //Get the CoinStore from local storage
                const encryptedStorage = localStorage.getItem('coins');
                
                //throw new Error(localStorage.getItem('coins'))
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
                if (startValue) return startValue;
                //Return an empty array if decryption was unsuccessful.
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
        //This function will attempt to decrypt the localstorage value with an installed password
        //and return true of false depending on the result
        validatePassword: (pwd) => {
            if (!pwd || typeof pwd === 'undefined') return false;
            if (!localStorage.getItem('coins')) return false;
            if(decryptObject( pwd, JSON.parse(localStorage.getItem('coins'))) === false) return false;
            return true;
        },
        //Add a coin to the internal coin storage
        addCoin: (coinInfo) => {
            //Reject missing or undefined arguments
            if (!coinInfo || typeof coinInfo === 'undefined') return {added: false, reason: 'undefinedObject'};
            if (!coinInfo.network || !coinInfo.name || !coinInfo.nickname || !coinInfo.symbol || !coinInfo.vk){
                return {added: false, reason: 'missingArg'};
            }
            //Set the coin to watch only if no private key supplied
            if (!coinInfo.sk) coinInfo.sk = 'watchOnly'
            
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
            //Return if object is undefined
            if (!coinInfo || typeof coinInfo === 'undefined') return;
            //Return if needed info was not provided
            if (!coinInfo.network || !coinInfo.symbol || !coinInfo.vk) return;
            //Return the matching coin (will be undefined if not matched)
            return get(CoinStore).find( f => {
                return  f.network === coinInfo.network && f.symbol === coinInfo.symbol && f.vk === coinInfo.vk;
            });
        },
        //Update the balance of a coin
        updateBalance: (coinInfo, balance) => {
            //Return if object is undefined
            if (!coinInfo || typeof coinInfo === 'undefined') return;
            if (Object.prototype.toString.call(coinInfo) !== "[object Object]") return;
            //Return if needed info was not provided
            if (!coinInfo.network || !coinInfo.symbol || !coinInfo.vk) return;
            //Return if balance is undefiend
            if (!balance || typeof balance === 'undefined') return;
            //Return if balance is Not a Number
            if (isNaN(balance)) return;
        
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
        },
        //Update the balances for all keys in the store
        //This may be refractored out of here.
        updateAllBalances: (networkInfo) => {
            //Returns if networkInfo is undefined
            if (!networkInfo || typeof networkInfo === 'undefined') return;
            //Returns if the networkInfo object doesn't contain ip or port
            if (!networkInfo.ip || !networkInfo.port) return;
            CoinStore.update(coinstore => {
                //Ask the masternode for the balance of each vk in the store
                coinstore.map(coin => {
                    fetch(`${networkInfo.ip}:${networkInfo.port}/contracts/currency/balances/?key=${coin.vk}`)
                    .then(res => res.json())
                    .then(res => {
                        //Set the balance of the coin
                        coin.balance = res.value ? parseFloat(res.value) : 0;
                    })
                    .catch(err => {console.log(err); coin.balance = 0})
                })
                return coinstore;
            })
        }
    };
}
//Create CoinStore instance
export const CoinStore = createCoinStore();

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