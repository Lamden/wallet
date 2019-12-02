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
import CoinModify from '../svelte/coins/CoinModify.svelte';
import CoinOptions from '../svelte/coins/CoinOptions.svelte';
import CoinAdd from '../svelte/coins/CoinAdd.svelte';
import CoinAddDetails from '../svelte/coins/CoinAddDetails.svelte';
import CoinEmpty from '../svelte/coins/CoinEmpty.svelte';
import CoinLamdenSend from '../svelte/coins/CoinLamdenSend.svelte';
import CoinLamdenContract from '../svelte/coins/CoinLamdenContract.svelte';
import CoinConfirmTx from '../svelte/coins/CoinConfirmTx.svelte';
import CoinSendingTx from '../svelte/coins/CoinSendingTx.svelte';
import CoinEditNickname from '../svelte/coins/CoinEditNickname.svelte'; 
import CoinDelete from '../svelte/coins/CoinDelete.svelte'; 
import CoinDeleting from '../svelte/coins/CoinDeleting.svelte'; 

//Backup and Restore
import Backup from '../svelte/backup_restore/Backup.svelte';
import BackupMain from '../svelte/backup_restore/BackupMain.svelte';
import Restore from '../svelte/backup_restore/Restore.svelte';
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
import Card from '../svelte/components/Card.svelte';
import Modal from '../svelte/components/Modal.svelte';
import DropDown from '../svelte/components/DropDown.svelte';
import MessageBox from '../svelte/components/MessageBox.svelte';
import ResultBox from '../svelte/components/ResultBox.svelte';

//Misc
import LockScreen from '../svelte/misc/LockScreen.svelte';
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

export const BackupPages = {
    BackupMain
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
    CoinsMain, CoinDetails, 
    LockScreen, 
    BackupMain, 
    Restore,
    Backup,
    DevToolsMain, 
    HistoryMain, 
    About, 
    Feedback, 
    ...FirstRun 
};

export const Components = { 
    Button, 
    Switch, 
    InputBox, 
    Steps, 
    Step, 
    Loading, 
    ErrorBox,
    Card,
    Modal,
    DropDown,
};

export const Modals = {
    CoinLamdenSend, 
    CoinLamdenContract,
    CoinModify,
    CoinOptions,
    CoinEditNickname,
    CoinLamdenContract,
    CoinDelete,
    CoinAdd, CoinAddDetails,
    CoinConfirmTx,
    CoinSendingTx,
    ResultBox,
    MessageBox,
    CoinDeleting
}

export {
    Nav,
    Menu, MenuBox, MenuItem,
    CoinsMain, 
    Coin, CoinDivider, CoinDetails, CoinEmpty,
    DevToolsMain, DevToolsDocumentation,
    BackupMain,
    Restore,
    LockScreen,
    Modal,
    HistoryMain,
    Transaction,
    Feedback,
    About
};


