<script context="module">
//Layout
import NavForApp from './nav/NavForApp.svelte';
import Nav from './nav/Nav.svelte';
import NavLogo from './nav/NavLogo.svelte';
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
import FirstRunGenMnemonic from './firstrun/FirstRunGenMnemonic.svelte';
import FirstRunVerifyMnemonic from './firstrun/FirstRunVerifyMnemonic.svelte';
import FirstRunRemember from './firstrun/FirstRunRemember.svelte';
import FirstCreateVault from './firstrun/FirstCreateVault.svelte';
import FirstCreateVaultIntro from './firstrun/FirstCreateVaultIntro.svelte';

//Coins
import CoinsMain from './coins/CoinsMain.svelte';
import Coin from './coins/Coin.svelte';
import CoinDivider from './coins/CoinDivider.svelte';
import CoinDetails from './coins/CoinDetails.svelte';
import CoinModify from './coins/CoinModify.svelte';
import CoinOptions from './coins/CoinOptions.svelte';
import CoinDappOptions from './coins/CoinDappOptions.svelte';
import CoinDappSettings from './coins/CoinDappSettings.svelte';
import CoinDappTrusted from './coins/CoinDappTrusted.svelte';
import CoinDappRevoke from './coins/CoinDappRevoke.svelte';
import CoinAdd from './coins/CoinAdd.svelte';
import CoinAddDetails from './coins/CoinAddDetails.svelte';
import CoinAddToken from './coins/CoinAddToken.svelte'
import CoinAddAccount from './coins/CoinAddAccount.svelte';
import CoinEmpty from './coins/CoinEmpty.svelte';
import CoinLamdenSend from './coins/CoinLamdenSend.svelte';
import CoinLamdenContract from './coins/CoinLamdenContract.svelte';
import CoinLamdenSimpleContract from './coins/CoinLamdenSimpleContract.svelte';
import CoinConfirmTx from './coins/CoinConfirmTx.svelte';
import CoinSendingTx from './coins/CoinSendingTx.svelte';
import CoinEditNickname from './coins/CoinEditNickname.svelte'; 
import CoinDelete from './coins/CoinDelete.svelte'; 
import CoinDeleting from './coins/CoinDeleting.svelte'; 
import CoinLamdenReceive from './coins/CoinLamdenReceive.svelte';
import ConiLamdenSendWarningBox from './coins/ConiLamdenSendWarningBox.svelte';
import CoinLegacyModal from './coins/CoinLegacyModal.svelte';
import CoinWatchedModal from './coins/CoinWatchedModal.svelte';
import CoinView from './coins/CoinView.svelte';

//Backup and Restore
import BackupLeagcyAccounts from './backup_restore/BackupLeagcyAccounts.svelte';
import BackupMnemonicComplete from './backup_restore/BackupMnemonicComplete.svelte'
import BackupMnemonic from './backup_restore/BackupMnemonic.svelte';
import Backup from './backup_restore/Backup.svelte';
import BackupMain from './backup_restore/BackupMain.svelte';
import BackupIntro from './backup_restore/BackupIntro.svelte';
import BackupEnterPassword from './backup_restore/BackupEnterPassword.svelte';
import BackupViewKeys from './backup_restore/BackupViewKeys.svelte';
import BackupKeystorePassword from './backup_restore/BackupKeystorePassword.svelte';
import BackupKeystoreCreate from './backup_restore/BackupKeystoreCreate.svelte';
import BackupKeystoreComplete from './backup_restore/BackupKeystoreComplete.svelte';
import BackupNotificationModal from './backup_restore/BackupNotificationModal.svelte'; 
import Restore from './backup_restore/Restore.svelte';
import RestoreMain from './backup_restore/RestoreMain.svelte';
import RestoreUpload from './backup_restore/RestoreUpload.svelte';
import RestoreCheck from './backup_restore/RestoreCheck.svelte';
import RestorePassword from './backup_restore/RestorePassword.svelte';
import RestoreAddWallets from './backup_restore/RestoreAddWallets.svelte';
import RestoreSaveWallets from './backup_restore/RestoreSaveWallets.svelte';
import RestoreComplete from './backup_restore/RestoreComplete.svelte';
import RestoreOptions from './backup_restore/RestoreOptions.svelte';
import RestoreIntro from './backup_restore/RestoreIntro.svelte';
import RestoreMnemonic from './backup_restore/RestoreMnemonic.svelte';
import RestorePrivateKey from './backup_restore/RestorePrivateKey.svelte';
import RestoreMnemonicRemember from './backup_restore/RestoreMnemonicRemember.svelte';
import RestoreMnemonicWarning from './backup_restore/RestoreMnemonicWarning.svelte';
import RestoreMnemonicSuccess from './backup_restore/RestoreMnemonicSuccess.svelte';
import RestoreMnemonicPassword from './backup_restore/RestoreMnemonicPassword.svelte';

//DevTools
import DevToolsMain from './devtools/DevToolsMain.svelte';
import DevToolsDocumentation from './devtools/DevToolsDocumentation.svelte';
import DevToolsNetworks from './devtools/DevToolsNetworks.svelte';
import DevToolsDeleteNetwork from './devtools/DevToolsDeleteNetwork.svelte';

//Dashboard
import DashboardMain from './dashboard/DashboardMain.svelte';
import DashboardNodeList from './dashboard/DashboardNodeList.svelte';
import AddNewNode from './dashboard/AddNewNode.svelte';
import AddNewMotion from './dashboard/AddNewMotion.svelte';
import Vote from './dashboard/Vote.svelte';
import MethodTx from './dashboard/MethodTx.svelte';
import NodeTx from './dashboard/NodeTx.svelte';
import NodeDetails from './dashboard/NodeDetails.svelte'; 
 
//Components
import Button from './components/Button.svelte';
import Switch from './components/Switch.svelte';
import InputBox from './components/InputBox.svelte';
import DatePicker from './components/DatePicker.svelte';
import TimeDelta from './components/TimeDelta.svelte';
import Steps from './components/Steps.svelte';
import Step from './components/Step.svelte';
import Loading from './components/Loading.svelte';
import ErrorBox from './components/ErrorBox.svelte';
import Card from './components/Card.svelte';
import Modal from './components/Modal.svelte';
import DropDown from './components/DropDown.svelte';
import MessageBox from './components/MessageBox.svelte';
import ResultBox from './components/ResultBox.svelte';
import StrongPW from './components/StrongPW.svelte';
import Kwargs from './components/Kwargs.svelte';
import Kwarg from './components/Kwarg.svelte';
import TokenLogo from './components/TokenLogo.svelte'
import LightDarkToggle from './components/LightDarkToggle.svelte'
import Identicons from './components/Identicons.svelte';
import QR from './components/QR.svelte';
import Mnemonic from './components/Mnemonic.svelte';

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
import About from './misc/About.svelte';

//Token
import TokenDetails from './tokens/TokenDetails.svelte';
import TokenLamdenSend from './tokens/TokenLamdenSend.svelte';
import Token from './tokens/Token.svelte';
import TokenModify from './tokens/TokenModify.svelte';
import TokenOptions from './tokens/TokenOptions.svelte';
import TokenDelete from './tokens/TokenDelete.svelte';
import TokenDeleting from './tokens/TokenDeleting.svelte';
import TokenEditDetails from './tokens/TokenEditDetails.svelte';

//Connections 
import ConnectionsMain from './connections/ConnectionsMain.svelte';
import Connection from './connections/Connection.svelte';
import ConnectionDetails from './connections/ConnectionDetails.svelte';
import ConnectionModify from './connections/ConnectionModify.svelte';
import ConnectionOption from './connections/ConnectionOption.svelte';
import ConnectionEmpty from './connections/ConnectionEmpty.svelte';
import ConnectionTrusted from './connections/ConnectionTrusted.svelte';
import ConnectionRevoke from './connections/ConnectionRevoke.svelte';

// Settings
import Settings from './misc/Settings.svelte';

// What's News
import News from './misc/News.svelte';
import WhatsnewModal from  './misc/WhatsnewModal.svelte';

// ChangePassword
import ChangePassword from './password/ChangePassword.svelte';
import ChangePasswordSlot from './password/ChangePasswordSlot.svelte';
import ChangePasswordFinish from './password/ChangePasswordFinish.svelte';

// NetWorks
import ManageNetwork from './networks/ManageNetwork.svelte';
import ManageNetworkMain from './networks/ManageNetworkMain.svelte';
import ManageNetwokFinish from './networks/ManageNetwokFinish.svelte';
import ManageNetwokDelete from './networks/ManageNetwokDelete.svelte';

// Layouts
import LeftSideFullPage from './layouts/LeftSideFullPage.svelte';

export const RestorePages = {
    RestoreMain, 
    RestoreUpload, 
    RestoreCheck, 
    RestorePassword, 
    RestoreAddWallets,
    RestoreSaveWallets,

    RestoreComplete,  
    RestoreOptions,
    RestoreIntro,
    RestoreMnemonic,
    RestorePrivateKey,
    RestoreMnemonicRemember,
    RestoreMnemonicWarning,
    RestoreMnemonicSuccess,
    RestoreMnemonicPassword
};

export const BackupPages = {
    BackupMain,
    BackupIntro,
    BackupEnterPassword,
    BackupViewKeys,
    BackupKeystorePassword,
    BackupKeystoreCreate,
    BackupKeystoreComplete,
    BackupMnemonic,
    FirstRunVerifyMnemonic,
    BackupMnemonicComplete,
    BackupLeagcyAccounts
};

export const FirstRun = { 
    FirstRunMain, 
    FirstRunIntro, 
    FirstRunRestoreMain, 
    FirstRunCreatePW, 
    FirstRunTOS, 
    FirstRunGenWallets, 
    FirstRunFinishing,
    FirstRunGenMnemonic,
    FirstRunVerifyMnemonic,
    FirstRunRemember,
    FirstCreateVault,
    FirstCreateVaultIntro,
    ...RestorePages
};

export const Pages = { 
    ManageNetwokDelete,
    ManageNetwokFinish,
    ManageNetworkMain,
    ManageNetwork,
    ChangePasswordSlot, ChangePasswordFinish,
    Settings, ChangePassword,
    News,
    CoinsMain, CoinDetails, 
    TokenDetails,
    LockScreen, 
    BackupMain,
    Restore,
    Backup,
    DevToolsMain, 
    About, 
    IdeMain,
    ConnectionsMain, ConnectionDetails,
    DashboardMain,
    DashboardNodeList,
    NodeDetails,
    ...FirstRun 
};

export const Components = { 
    Mnemonic,
    Button, 
    Switch, 
    InputBox, 
    DatePicker, TimeDelta,
    Steps, 
    Step, 
    Loading, 
    ErrorBox,
    Card,
    Modal,
    DropDown,
    StrongPW,
    Kwargs, Kwarg,
    TokenLogo, TokenEditDetails,
    LightDarkToggle,
    Identicons,
    QR
};

export const Modals = {
    CoinView,
    CoinLegacyModal,
    ConiLamdenSendWarningBox,
    CoinLamdenSend, TokenLamdenSend,
    CoinModify, CoinOptions, CoinDelete, CoinDeleting, CoinEditNickname,
    TokenModify, TokenOptions, TokenDelete, TokenDeleting,
    CoinDappOptions, CoinDappSettings, CoinDappTrusted, CoinDappRevoke,
    CoinLamdenContract, CoinLamdenSimpleContract, CoinLamdenReceive,
    CoinAdd, CoinAddDetails,
    CoinConfirmTx,
    CoinSendingTx,
    ResultBox,
    MessageBox,
    DevToolsDeleteNetwork,
    IdeModelNewTab, 
    IdeModelSubmit, IdeSubmitContract, 
    IdeModelMethodTx, IdeMethodTx,
    ConnectionModify, ConnectionOption, ConnectionTrusted, ConnectionRevoke,
    BackupNotificationModal,
    Settings,
    WhatsnewModal,
    CoinWatchedModal,
    AddNewNode,
    AddNewMotion,
    Vote,
    MethodTx,
    NodeTx
}

export const Layouts = {
    LeftSideFullPage
}

export {
    Nav, NavLogo, NavControls, NavStatus, NavForApp,
    Menu, MenuBox, MenuItem,
    CoinsMain, 
    Coin, Token, CoinDivider, CoinDetails, CoinEmpty, CoinAddToken, CoinAddAccount,
    TokenDetails,
    DevToolsMain, DevToolsDocumentation, DevToolsNetworks,
    BackupMain,
    Restore,
    LockScreen,
    Modal,
    About,
    IdeMain, IdeMethods, IdeGetVariable, IdeMonacoEditor, IdeErrorsBox, IdeTabs, IdeTab, IdeMethodTx,
    ConnectionsMain, Connection, ConnectionEmpty,
    ChangePassword,
    LeftSideFullPage,
    ChangePasswordSlot, ChangePasswordFinish,
    ManageNetwork,
    ManageNetworkMain,
    ManageNetwokFinish,
    DashboardMain,
    DashboardNodeList
};
</script>