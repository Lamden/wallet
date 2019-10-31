import { readable, writable} from 'svelte/store';
import { coin, pubkey, token } from './defaults.js';

export { HashStore } from './hashStore.js';
export { MarketInfoStore } from './marketInfoStore.js';
export { CoinStore, numberOfCoins, allTotals, symbolList } from './coinStore.js';
export { SwapStore, initialSwaps, participateSwaps, swapCount  } from './swapStore.js';
export { SettingsStore, firstRun, themeStyle, currentPage, loggedIn, currencies, calcRemainingStorage  } from './settingsStore.js';

//MISC Stores
export const CURRENT_KS_VERSION = writable("1.0");
export const defaultOjects = readable({coin, pubkey, token});




