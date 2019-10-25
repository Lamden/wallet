import { writable, get } from 'svelte/store';
import { decryptObject, encryptObject } from '../utils'

const createHashStore = (key, startValue) => {
    const HashStore = writable(startValue);
    let subscribe = HashStore.subscribe;
    let update = HashStore.update;
    let set = HashStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
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
        setPassword: (password) => {
            set( {'encode' : encryptObject(password, { 'date' : new Date() })} )
        },
        validatePassword: (password) => {
            //  Decrypts the wallets Password HASH and compares it to the password provided
            //  Return: Is Vaild Password (bool)
            if ( decryptObject( password, get(HashStore).encode ) ) return true;
            return false;
          }
    };
}

export const HashStore = createHashStore('Hash', { 'encode' : undefined });
