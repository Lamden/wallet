//FirstRun
import FirstRunIntro from '../svelte/firstRun/FirstRunIntro.svelte';
import FirstRunWallet from '../svelte/firstRun/FirstRunWallet.svelte';
import FirstRunCreate from '../svelte/firstRun/FirstRunCreate.svelte';
import FirstRunRestore from '../svelte/firstRun/FirstRunRestore.svelte';
import FirstRunCreatePW from '../svelte/firstRun/FirstRunCreatePW.svelte';
import FirstRunTOS from '../svelte/firstRun/FirstRunTOS.svelte';

//Coins
import CoinsMain from '../svelte/coins/CoinsMain.svelte';
import Coin from '../svelte/coins/Coin.svelte';
import CoinDetails from '../svelte/coins/CoinDetails.svelte';
import CoinRecieve from '../svelte/coins/CoinRecieve.svelte';
import CoinSend from '../svelte/coins/CoinSend.svelte';
import CoinAdd from '../svelte/coins/CoinAdd.svelte';

//Misc
import BackupMain from '../svelte/misc/BackupMain.svelte';
import RestoreMain from '../svelte/misc/RestoreMain.svelte';
import LockScreen from '../svelte/misc/LockScreen.svelte';
import Modal from '../svelte/misc/Modal.svelte';
import MyCoinsDropDown from '../svelte/misc/MyCoinsDropDown.svelte';
import Transaction from '../svelte/misc/Transaction.svelte';

const FirstRun = { FirstRunIntro, FirstRunWallet, FirstRunCreate, FirstRunRestore, FirstRunCreatePW, FirstRunTOS };

const Pages = { CoinsMain, CoinDetails, LockScreen, BackupMain, RestoreMain, ...FirstRun };

const Modals = { CoinSend, CoinRecieve, CoinAdd };

export {
    FirstRun,
    Pages,
    Modals,
    CoinsMain,
    Coin,
    CoinDetails,
    CoinRecieve,
    CoinSend,
    CoinAdd,
    BackupMain,
    RestoreMain,
    LockScreen,
    Modal,
    MyCoinsDropDown,
    Transaction,
};


