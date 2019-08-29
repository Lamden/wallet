//Coins
import CoinsMain from '../svelte/coins/CoinsMain.svelte'
import Coin from '../svelte/coins/Coin.svelte';
import CoinDetails from '../svelte/coins/CoinDetails.svelte'
import CoinPublicKey from '../svelte/coins/CoinPublicKey.svelte'
import CoinSend from '../svelte/coins/CoinSend.svelte'


//Swaps
import SwapsMain from '../svelte/swaps/SwapsMain.svelte'

//Misc
import LockScreen from '../svelte/misc/LockScreen.svelte'
import Modal from '../svelte/misc/Modal.svelte'

export const Pages = { 
                CoinsMain,
                CoinDetails,
                SwapsMain, 
                LockScreen,
                };

export {
    CoinsMain,
    Coin,
    CoinDetails,
    CoinPublicKey,
    CoinSend,
    SwapsMain,
    LockScreen,
    Modal,
};
