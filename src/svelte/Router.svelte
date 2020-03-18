<script context="module">
//Layout
import Nav from './nav/Nav.svelte';
import NavLogo from './nav/NavLogo.svelte';
import NavBreadcrumb from './nav/NavBreadcrumb.svelte';
import NavControls from './nav/NavControls.svelte';
import NavStatus from './nav/NavStatus.svelte';
import Menu from './menu/Menu.svelte';
import MenuBox from './menu/MenuBox.svelte';
import MenuItem from './menu/MenuItem.svelte';

//FirstRun
import FirstRunMain from './firstrun/FirstRunMain.svelte';
import FirstRunIntro from './firstrun/FirstRunIntro.svelte';
import FirstRunRestoreMain from './firstrun/FirstRunRestoreMain.svelte';
import FirstRunCreatePW from './firstrun/FirstRunCreatePW.svelte';
import FirstRunTOS from './firstrun/FirstRunTOS.svelte';
import FirstRunGenWallets from './firstrun/FirstRunGenWallets.svelte';
import FirstRunFinishing from './firstrun/FirstRunFinishing.svelte';

//Coins
import CoinsMain from './coins/CoinsMain.svelte';
import Coin from './coins/Coin.svelte';
import CoinDivider from './coins/CoinDivider.svelte';
import CoinDetails from './coins/CoinDetails.svelte';
import CoinModify from './coins/CoinModify.svelte';
import CoinOptions from './coins/CoinOptions.svelte';
import CoinAdd from './coins/CoinAdd.svelte';
import CoinAddDetails from './coins/CoinAddDetails.svelte';
import CoinEmpty from './coins/CoinEmpty.svelte';
import CoinLamdenSend from './coins/CoinLamdenSend.svelte';
import CoinLamdenContract from './coins/CoinLamdenContract.svelte';
import CoinConfirmTx from './coins/CoinConfirmTx.svelte';
import CoinSendingTx from './coins/CoinSendingTx.svelte';
import CoinEditNickname from './coins/CoinEditNickname.svelte'; 
import CoinDelete from './coins/CoinDelete.svelte'; 
import CoinDeleting from './coins/CoinDeleting.svelte'; 
import CoinHistory from  './coins/CoinHistory.svelte'; 

//Backup and Restore
import Backup from './backup_restore/Backup.svelte';
import BackupMain from './backup_restore/BackupMain.svelte';
import BackupIntro from './backup_restore/BackupIntro.svelte';
import BackupEnterPassword from './backup_restore/BackupEnterPassword.svelte';
import BackupViewKeys from './backup_restore/BackupViewKeys.svelte';
import BackupKeystorePassword from './backup_restore/BackupKeystorePassword.svelte';
import BackupKeystoreCreate from './backup_restore/BackupKeystoreCreate.svelte';
import BackupKeystoreComplete from './backup_restore/BackupKeystoreComplete.svelte';
import Restore from './backup_restore/Restore.svelte';
import RestoreMain from './backup_restore/RestoreMain.svelte';
import RestoreUpload from './backup_restore/RestoreUpload.svelte';
import RestoreCheck from './backup_restore/RestoreCheck.svelte';
import RestorePassword from './backup_restore/RestorePassword.svelte';
import RestoreAddWallets from './backup_restore/RestoreAddWallets.svelte';
import RestoreSaveWallets from './backup_restore/RestoreSaveWallets.svelte';
import RestoreComplete from './backup_restore/RestoreComplete.svelte';

//History
import HistoryMain from './history/HistoryMain.svelte';
import PendingTransactions from './history/PendingTransactions.svelte'
import PendingTransaction from './history/PendingTransaction.svelte'

//DevTools
import DevToolsMain from './devtools/DevToolsMain.svelte';
import DevToolsDocumentation from './devtools/DevToolsDocumentation.svelte';
import DevToolsNetworks from './devtools/DevToolsNetworks.svelte';
import DevToolsDeleteNetwork from './devtools/DevToolsDeleteNetwork.svelte';
 
//Components
import Button from './components/Button.svelte';
import Switch from './components/Switch.svelte';
import InputBox from './components/InputBox.svelte';
import Steps from './components/Steps.svelte';
import Step from './components/Step.svelte';
import Loading from './components/Loading.svelte';
import ErrorBox from './components/ErrorBox.svelte';
import Card from './components/Card.svelte';
import Modal from './components/Modal.svelte';
import DropDown from './components/DropDown.svelte';
import MessageBox from './components/MessageBox.svelte';
import TxInfoBox from './components/TxInfoBox.svelte';
import ResultBox from './components/ResultBox.svelte';
import StrongPW from './components/StrongPW.svelte';
import Transaction from './components/Transaction.svelte';

//IDE
import IdeMain from './IDE/IdeMain.svelte';
import IdeErrorsBox from './IDE/IdeErrorsBox.svelte';
import IdeGetVariable from './IDE/IdeGetVariable.svelte';
import IdeMethods from './IDE/IdeMethods.svelte';
import IdeMonacoEditor from './IDE/IdeMonacoEditor.svelte';
import IdeTabs from './IDE/IdeTabs.svelte';
import IdeTab from './IDE/IdeTab.svelte';
import IdeModelNewTab from './IDE/IdeModelNewTab.svelte';
import IdeModelSubmit from './IDE/IdeModelSubmit.svelte';
import IdeSubmitContract from './IDE/IdeSubmitContract.svelte';
import IdeModelMethodTx from './IDE/IdeModelMethodTx.svelte';
import IdeMethodTx from './IDE/IdeMethodTx.svelte';

//Misc
import LockScreen from './misc/LockScreen.svelte';
import Transactions from './misc/Transactions.svelte';
import About from './misc/About.svelte';

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
    BackupMain,
    BackupIntro,
    BackupEnterPassword,
    BackupViewKeys,
    BackupKeystorePassword,
    BackupKeystoreCreate,
    BackupKeystoreComplete
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
    IdeMain,
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
    StrongPW,
    Transaction
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
    TxInfoBox,
    MessageBox,
    CoinDeleting,
    DevToolsDeleteNetwork,
    IdeModelNewTab, 
    IdeModelSubmit, IdeSubmitContract, 
    IdeModelMethodTx, IdeMethodTx
}

export {
    Nav, NavLogo, NavBreadcrumb, NavControls, NavStatus,
    Menu, MenuBox, MenuItem,
    CoinsMain, 
    Coin, CoinDivider, CoinDetails, CoinEmpty, CoinHistory,
    DevToolsMain, DevToolsDocumentation, DevToolsNetworks,
    BackupMain,
    Restore,
    LockScreen,
    Modal,
    HistoryMain, PendingTransactions, PendingTransaction,
    Transactions, Transaction,
    About,
    IdeMain, IdeMethods, IdeGetVariable, IdeMonacoEditor, IdeErrorsBox, IdeTabs, IdeTab, IdeMethodTx
};
</script>