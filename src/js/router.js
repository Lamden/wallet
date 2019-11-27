//Layout
import Nav from '../svelte/nav/Nav.svelte';
import Menu from '../svelte/menu/Menu.svelte';
import MenuBox from '../svelte/menu/MenuBox.svelte';
import MenuItem from '../svelte/menu/MenuItem.svelte';

//FirstRun
import FirstRunMain from '../svelte/firstRun/FirstRunMain.svelte';
import FirstRunIntro from '../svelte/firstRun/FirstRunIntro.svelte';
import FirstRunRestoreMain from '../svelte/firstRun/FirstRunRestoreMain.svelte';
import FirstRunCreatePW from '../svelte/firstRun/FirstRunCreatePW.svelte';
import FirstRunTOS from '../svelte/firstRun/FirstRunTOS.svelte';
import FirstRunGenWallets from '../svelte/firstRun/FirstRunGenWallets.svelte';
import FirstRunFinishing from '../svelte/firstRun/FirstRunFinishing.svelte';

//Coins
import CoinsMain from '../svelte/coins/CoinsMain.svelte';
import Coin from '../svelte/coins/Coin.svelte';
import CoinDivider from '../svelte/coins/CoinDivider.svelte';
import CoinDetails from '../svelte/coins/CoinDetails.svelte';
import CoinRecieve from '../svelte/coins/CoinRecieve.svelte';
import CoinSend from '../svelte/coins/CoinSend.svelte';
import CoinAdd from '../svelte/coins/CoinAdd.svelte';

//Backup and Restore
import BackupMain from '../svelte/backup_restore/BackupMain.svelte';
import RestoreMain from '../svelte/backup_restore/RestoreMain.svelte';
import RestoreUpload from '../svelte/backup_restore/RestoreUpload.svelte';
import RestoreCheck from '../svelte/backup_restore/RestoreCheck.svelte';
import RestorePassword from '../svelte/backup_restore/RestorePassword.svelte';
import RestoreAddWallets from '../svelte/backup_restore/RestoreAddWallets.svelte';
import RestoreSaveWallets from '../svelte/backup_restore/RestoreSaveWallets.svelte';
import RestoreComplete from '../svelte/backup_restore/RestoreComplete.svelte';

//History
import HistoryMain from '../svelte/history/HistoryMain.svelte';

//DevTools
import DevToolsMain from '../svelte/devtools/DevToolsMain.svelte';
import DevToolsDocumentation from '../svelte/devtools/DevToolsDocumentation.svelte';
 
//Components
import Button from '../svelte/components/Button.svelte';
import Switch from '../svelte/components/Switch.svelte';
import InputBox from '../svelte/components/InputBox.svelte';
import Steps from '../svelte/components/Steps.svelte';
import Step from '../svelte/components/Step.svelte';
import Loading from '../svelte/components/Loading.svelte';
import ErrorBox from '../svelte/components/ErrorBox.svelte';

//Misc
import LockScreen from '../svelte/misc/LockScreen.svelte';
import Modal from '../svelte/misc/Modal.svelte';
import MyCoinsDropDown from '../svelte/misc/MyCoinsDropDown.svelte';
import Transaction from '../svelte/misc/Transaction.svelte';
import About from '../svelte/misc/About.svelte';
import Feedback from '../svelte/misc/Feedback.svelte';

export const RestorePages = { 
    RestoreMain, 
    RestoreUpload, 
    RestoreCheck, 
    RestorePassword, 
    RestoreAddWallets,
    RestoreSaveWallets,
    RestoreComplete,  
};

export const FirstRun = { 
    FirstRunMain, 
    FirstRunIntro, 
    FirstRunRestoreMain, 
    FirstRunCreatePW, 
    FirstRunTOS, 
    FirstRunGenWallets, 
    FirstRunFinishing,
    ...RestorePages
};

export const Pages = { 
    CoinsMain, CoinDetails, CoinAdd, CoinSend, CoinRecieve, 
    LockScreen, 
    BackupMain, 
    RestoreMain, 
    DevToolsMain, 
    HistoryMain, 
    About, 
    Feedback, 
    ...FirstRun 
};




export const Components = { Button, Switch, InputBox, Steps, Step, Loading, ErrorBox };

export {
    Nav,
    Menu, MenuBox, MenuItem,
    CoinsMain,
    Coin, CoinDivider, CoinDetails, CoinRecieve, CoinSend, CoinAdd,
    DevToolsMain, DevToolsDocumentation,
    BackupMain,
    RestoreMain,
    LockScreen,
    Modal,
    MyCoinsDropDown,
    HistoryMain,
    Transaction,
    Feedback,
    About
};


