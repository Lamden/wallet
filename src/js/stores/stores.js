import { writable} from 'svelte/store';

export { obscure, supportedCoins } from './defaults.js';
export { CoinStore, coinsDropDown } from './coinStore.js';
export { TokenStore, tokensDropDown } from './tokenStore.js';
export { BalancesStore, balanceTotal} from './balancesStore.js';
export { TokenBalancesStore, tokenBalanceTotal} from './tokenBalancesStore.js';
export { PendingTxStore} from './pendingTxStore.js';
export { SettingsStore, currentPage, needsBackup  } from './settingsStore.js';
export { SwapsStore, swapsbyCreatedDate } from './swapsStore.js';
export { DappStore, dappsDropDown } from './dappStore.js';
export { NetworksStore, allNetworks, networksDropDownList, currentNetwork, networkTypesDropDownList } from './networksStore.js';
export { FilesStore, activeTab }  from './filesStore.js';
export { CacheStore }  from './cacheStore.js';

//MISC Stores
export const CURRENT_KS_VERSION = writable("1.0");
export const breadcrumbs = writable([]);
export const steps = writable({current:0, stepList:[]});
export const clicked = writable({id:''});
export const currentThemeName = writable()

//Store Utils
export function networkKey(networkObj){
    return `${networkObj.name}|${networkObj.type}|${networkObj.lamden ? 'lamden': 'user'}`
}

export function copyItem(item){
    return JSON.parse(JSON.stringify(item))
}