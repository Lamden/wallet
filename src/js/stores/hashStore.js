import { writable, get } from 'svelte/store';
import { decryptObject, encryptObject } from '../utils'

const createHashStore = (key, startValue) => {
    const json = localStorage.getItem(key);
    if (json) {
        startValue = JSON.parse(json)
    }
    const HashStore = writable(startValue);
    HashStore.subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
    });
    let subscribe = HashStore.subscribe;
    let update = HashStore.update;
    let set = HashStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        setPassword: (password) => {
            if (!password || password === '') return false;
            set( {'encode' : encryptObject(password, { 'date' : new Date() })} )
        },
        validatePassword: (password) => {
            //  Decrypts the wallets Password HASH and compares it to the password provided
            //  Return: Is Vaild Password (bool)
            if (!password || password === '') return false;
            try{
                if ( decryptObject( password, get(HashStore).encode ) ) return true;
            } catch (e) {
                console.log(e)
                return false;
            } 
          }
    };
}

export const HashStore = createHashStore('Hash', { 'encode' : undefined });
