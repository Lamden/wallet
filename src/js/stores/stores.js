import { readable, writable} from 'svelte/store';
import { coin, pubkey } from './defaults.js';

export { obscure } from './defaults.js';
export { coinMeta } from './coinMeta.js';
export { HashStore } from './hashStore.js';
export { CoinStore, numberOfCoins, symbolList, password } from './coinStore.js';
export { SettingsStore, firstRun, themeStyle, currentPage, loggedIn, calcRemainingStorage  } from './settingsStore.js';

//MISC Stores
export const CURRENT_KS_VERSION = writable("1.0");
export const defaultOjects = readable({coin, pubkey });
export const breadcrumbs = writable([]);
export const steps = writable({current:0, stepList:[]});
export const pageLoaded = writable(false);





