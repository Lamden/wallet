import { writable, get, derived } from 'svelte/store';

export const createBalancesStore = () => {
    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"balances": []}, function(getValue) {
            console.log('getting balances store value')
            console.log(getValue.balances)
            BalancesStore.set(getValue.balances)
        });
    }

    //Create Intial Store
    const BalancesStore = writable({});

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'balances') {
                console.log('setting BalancesStore from listener')
                console.log(changes[key])
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(BalancesStore))) {
                    BalancesStore.set(changes[key].newValue)
                }
            }
        }
    });

    //Set the Coinstore to the value of the chome.storage.local
    getStore()

    let subscribe = BalancesStore.subscribe;
    let update = BalancesStore.update;
    let set = BalancesStore.set;

    return {
        subscribe,
        set,
        update
    };
}
//Create BalancesStore instance
export const BalancesStore = createBalancesStore();

//Create a derived store to total all wallets
export const balanceTotal = derived(BalancesStore, ($BalancesStore) => {
    let totals = {};
    Object.keys($BalancesStore).forEach(network =>{
        totals[network] = 0;
        Object.keys($BalancesStore[network]).forEach(vk => {
            totals[network] = totals[network] + $BalancesStore[network][vk];
        })
    })
    console.log(totals)
    return totals;
});
