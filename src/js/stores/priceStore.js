import { writable, get } from 'svelte/store';
import { getLastestTauPrice, getTokenPrice} from '../utils';
import { TokenStore } from './tokenStore';
import { networkKey } from './stores.js';

export const createPriceStore = () => {
    //Create Intial Store
    const PriceStore = writable({})
    getLastestTauPrice().then(res => {
        let priceStore = get(PriceStore)
        PriceStore.set({
            ...priceStore,
            currency: res,
        })
    })

    TokenStore.subscribe((value) => {
        console.log(value)
        if (value['Lamden Mainnet|mainnet|lamden'] && Array.isArray(value['Lamden Mainnet|mainnet|lamden'])) {
            value['Lamden Mainnet|mainnet|lamden'].forEach(token => {
                let contractName = token.contractName
                getTokenPrice(contractName).then(res => {
                    let priceStore = get(PriceStore)
                    priceStore[contractName] = res
                    PriceStore.set({
                        ...priceStore
                    })
                })
            });
        }
    })
    return PriceStore
}
//Create BalancesStore instance
export const PriceStore = createPriceStore();