//Layout
import Nav from '../svelte/nav/Nav.svelte';
import Menu from '../svelte/menu/Menu.svelte';

//FirstRun
import FirstRunMain from '../svelte/firstRun/FirstRunMain.svelte';
import FirstRunIntro from '../svelte/firstRun/FirstRunIntro.svelte';
import FirstRunRestore from '../svelte/firstRun/FirstRunRestore.svelte';
import FirstRunCreatePW from '../svelte/firstRun/FirstRunCreatePW.svelte';
import FirstRunTOS from '../svelte/firstRun/FirstRunTOS.svelte';

//Coins
import CoinsMain from '../svelte/coins/CoinsMain.svelte';
import Coin from '../svelte/coins/Coin.svelte';
import CoinDivider from '../svelte/coins/CoinDivider.svelte';
import CoinDetails from '../svelte/coins/CoinDetails.svelte';
import CoinRecieve from '../svelte/coins/CoinRecieve.svelte';
import CoinSend from '../svelte/coins/CoinSend.svelte';
import CoinAdd from '../svelte/coins/CoinAdd.svelte';

//DevTools
import DevToolsMain from '../svelte/devtools/DevToolsMain.svelte';
import DevToolsDocumentation from '../svelte/devtools/DevToolsDocumentation.svelte';
 
//Components
import Button from '../svelte/components/Button.svelte';
import Switch from '../svelte/components/Switch.svelte';
import InputBox from '../svelte/components/InputBox.svelte';

//Misc
import BackupMain from '../svelte/misc/BackupMain.svelte';
import RestoreMain from '../svelte/misc/RestoreMain.svelte';
import LockScreen from '../svelte/misc/LockScreen.svelte';
import Modal from '../svelte/misc/Modal.svelte';
import MyCoinsDropDown from '../svelte/misc/MyCoinsDropDown.svelte';
import History from '../svelte/misc/History.svelte';

const FirstRun = { FirstRunMain, FirstRunIntro, FirstRunRestore, FirstRunCreatePW, FirstRunTOS };

const Pages = { CoinsMain, CoinDetails, LockScreen, BackupMain, RestoreMain, DevToolsMain, ...FirstRun };

const Components = { Button, Switch, InputBox };

const Modals = { CoinSend, CoinRecieve, CoinAdd };

export {
    Nav,
    Menu,
    FirstRun,
    Pages,
    Modals,
    Components,
    CoinsMain,
    Coin,
    CoinDivider,
    CoinDetails,
    CoinRecieve,
    CoinSend,
    CoinAdd,
    DevToolsMain,
    DevToolsDocumentation,
    BackupMain,
    RestoreMain,
    LockScreen,
    Modal,
    MyCoinsDropDown,
    History,
};


