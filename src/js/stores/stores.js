import { readable, writable} from 'svelte/store';
import { coin, pubkey } from './defaults.js';

export { obscure, supportedCoins } from './defaults.js';
export { coinMeta } from './coinMeta.js';
export { CoinStore, coinsDropDown, balanceTotal } from './coinStore.js';
export { SettingsStore, themeStyle, currentPage, storageInfo  } from './settingsStore.js';
export { NetworksStore, allNetworks, networksDropDownList, currentNetwork, networkTypesDropDownList  } from './networksStore.js';
export { TxStore }  from './txStore.js';
export { FilesStore, activeTab }  from './filesStore.js';
export { CacheStore }  from './cacheStore.js';

//MISC Stores
export const CURRENT_KS_VERSION = writable("1.0");
export const defaultOjects = readable({coin, pubkey });
export const breadcrumbs = writable([]);
export const steps = writable({current:0, stepList:[]});

//Store Utils
export function networkKey(networkObj){
    return `${networkObj.host}:${networkObj.port}`
}

export function copyItem(item){
    return JSON.parse(JSON.stringify(item))
}