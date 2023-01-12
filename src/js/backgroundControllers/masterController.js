import whitelabel from "../../../whitelabel.json";

import { networkController } from "./networkController.js";
import { dappController } from "./dappController.js";
import { controllerUtils } from "./controllerUtils.js";
import { accountsController } from "./accountsController.js";
import { balancesController } from "./balancesController.js";
import { transactionsController } from "./transactionsController.js";
import { tokenController } from "./tokenController.js";
import { queryStateController } from "./queryStateController.js";
import { eventController } from "./eventController.js";

// Services
import * as SocketService from "../services/sockets.js";
import * as BlockService from "../services/blockservice.js";
import fauna from "../services/fauna.js";

const makeTx = (data) => {
  return {
      "payload": {
          "contract": data.contractName,
          "function": data.methodName,
          "kwargs": data.kwargs,
          "sender": data.senderVk,
      }
  }
}

export const masterController = () => {
  const utils = controllerUtils;

  const services = {
    socketService: SocketService.createSocketService(),
    blockservice: BlockService,
  };

  document.addEventListener('BlockServiceConnected', (e) => {
    // join all sockets when a new blockservice is connected
    let accountsList = accounts.getSanatizedAccounts();
    balances.joinAllSockets(accountsList);
    tokens.joinAllTokenSockets(accountsList);
  })

  utils.networks = Object.freeze(networkController(utils, services));
  const accounts = Object.freeze(accountsController(utils, services));
  const balances = Object.freeze(
    balancesController(
      utils,
      services,
      (() => {
        return {
          isWatchOnly: accounts.isWatchOnly,
          walletIsLocked: accounts.walletIsLocked,
        };
      })()
    )
  );
  const transactions = Object.freeze(
    transactionsController(
      utils,
      services,
      (() => {
        return {
          decryptString: accounts.decryptString,
          getAccountByVK: accounts.getAccountByVK,
          signTx: accounts.signTx,
        };
      })()
    )
  );
  const dapps = Object.freeze(
    dappController(
      utils,
      fauna,
      (() => {
        return {
          walletIsLocked: accounts.walletIsLocked,
          addNewLamdenAccount: accounts.addNewLamdenAccount,
          sendCurrencyTransaction: transactions.sendCurrencyTransaction,
          sendLamdenTx: transactions.sendLamdenTx,
          getAccountByVK: accounts.getAccountByVK,
        };
      })()
    )
  );
  const tokens = Object.freeze(
    tokenController(
      utils,
      services,
      (() => {
        return {
          getSanatizedAccounts: accounts.getSanatizedAccounts,
          walletIsLocked: accounts.walletIsLocked,
        };
      })()
    )
  );
  const events = Object.freeze(eventController(fauna));

  const state = Object.freeze(queryStateController(utils));

  const createPassword = (string) => {
    let created = accounts.createPassword(string);
    if (created) broadcastLockStatus(created);
    return created;
  };

  const changePassword = (obj) => {
    let { oldpd, newpd } = obj;
    let created = accounts.changePassword(oldpd, newpd);
    if (created) broadcastLockStatus(created);
    return created;
  };

  const joinSockets = () => {
    let accountsList = accounts.getSanatizedAccounts();
    balances.joinAllSockets(accountsList);
    tokens.joinAllTokenSockets(accountsList);
    return true
  };

  const leaveSockets = () => {
    let accountsList = accounts.getSanatizedAccounts();
    balances.leaveAllSockets(accountsList);
    tokens.leaveAllTokenSockets(accountsList);
  };

  const joinTokenSocket = (tokenContractName) => {
    let accountsList = accounts.getSanatizedAccounts();
    tokens.joinTokenSocket(accountsList, tokenContractName);
  };

  const joinTokenSockets = (networkInfo) => {
    let accountsList = accounts.getSanatizedAccounts();
    tokens.joinAllTokenSockets(accountsList, networkInfo);
  };

  const unlock = (pwd) => {
    let unlocked = accounts.unlock(pwd);
    broadcastLockStatus(unlocked);
    if (unlocked) {
      updateAllBalances();
      updateAllTokenBalances();
      joinSockets();
      fauna.fetchUpdates();
    }
    return unlocked;
  };

  const lock = () => {
    leaveSockets();
    accounts.lock();
    broadcastLockStatus(true);
    return true;
  };
  const broadcastLockStatus = (status) => {
    utils.sendMessageToApp("walletIsLocked", status);
    dapps.sendMessageToAllDapps("sendWalletInfo");
  };
  const getWalletInfo = (dappInfo = undefined) => {
    let walletInfo = {
      walletVersion: chrome.runtime.getManifest().version,
      installed: true,
      setup: !accounts.firstRun(),
      locked: accounts.walletIsLocked(),
      wallets: [],
    };
    if (walletInfo.locked === false) {
      let approvals = {};
      Object.keys(dappInfo).forEach((key) => {
        let flag = false
        utils.networks.LamdenNetworkTypes.forEach(t => {
          if (key.includes(t)) {
            flag = true
            return
          }
        })
        if (flag) {
          let args = key.split('|')
          let obj = dappInfo[key]
          if (!obj.version) obj.version = "0.0.1"
          if (args[0] === "legacy") {
            approvals[args[1]] = obj
          } else {
            if (!approvals[args[0]]) approvals[args[0]] = {}
            approvals[args[0]][args[1]] = obj
          }
        }
      });

      walletInfo.approvals = approvals;

      let account = accounts.getAccountByVK(dappInfo.vk);
      if (!account) return walletInfo;
      if (account.sk !== "watchOnly") {
        if (Object.keys(approvals).length > 0)
          walletInfo.wallets = [dappInfo.vk];
      } else {
        walletInfo.wallets = ["tracked_address"];
      }
    }
    return walletInfo;
  };

  const updateAllBalances = () => {
    let accountsList = accounts.getSanatizedAccounts();
    if (typeof accountsList === "undefined") return false;
    balances.updateAll(accountsList, utils.networks.getCurrent());
    return true;
  };

  const updateAccountAndTokenBalances = () => {
    updateAllBalances();
    updateAllTokenBalances();
  };

  const handleSwitchNetwork = (networkInfo) => {
    let accountsList = accounts.getSanatizedAccounts();
    balances.updateAll(accountsList, utils.networks.getNetwork(networkInfo));
    updateAllTokenBalances(networkInfo);

    let blockservice = networkInfo.blockservice_hosts[0];
    // start socket server
    if (blockservice) {
        services.socketService.start(blockservice);
        document.dispatchEvent(new Event('BlockServiceProvided'));
    } else {
        document.dispatchEvent(new Event('BlockServiceNotProvided'));
        services.socketService.close();
    }

    return true;
  };

  const updateAllTokenBalances = (networkInfo) => {
    tokens.refreshTokenBalances(networkInfo);
  };

  const updateOneBalance = (vk) => {
    let account = accounts.getAccountByVK(vk);
    if (!account) return true;
    balances.updateOne(account, utils.networks.getCurrent());
    return true;
  };

  const clearNetworkBalances = () => {
    balances.clearNetwork(utils.networks.getCurrent());
  };

  const initiateAppTxSend = (txInfo, sender) => {
    console.log({ txInfo, sender });
    //Validate that a physical person is sending this transaction
    let response = { status: "" };
    try {
      txInfo.uid = utils.hashStringValue(new Date().toISOString());
      let txBuilder = new utils.Lamden.TransactionBuilder(
        utils.networks.getCurrent(),
        txInfo
      );
      console.log(txBuilder.getAllInfo());
      transactions.sendLamdenTx(txBuilder, sender.origin);
      response.status = "Transaction Sent, Awaiting Response";
    } catch (err) {
      console.log(err);
      response.status = `Error: Failed to create Tx - ${err}`;
    }
    return response;
  };

  const retryFetchSendResult = (txdata) => {
    let response = { status: "" };
    transactions.processRetry(txdata);
    response.status = "Transaction Sent, Awaiting Response";
    return response;
  };

  // 1) For security if a contract name is provided that differes from the approved contract, automatic transactions will be ignored
  // 2) If no contract name is provided then the approved contract name will be provided
  // 3) The Wallet sets/overwrites the "senderVK" in txInfo to the one created for the dApp upon authorization.
  // This means that a dApp can only send transactions that were approved by the user in the original connection request
  const initiateDAppTxSend = (sender, data, dappInfo, callback = undefined) => {
    const makeTxStatus = (
      status = `Unable to process transaction`,
      errors = undefined,
      uid = undefined
    ) => {
      if (!uid) uid = utils.hashStringValue(new Date().toISOString());
      let txStatus = { status, errors, data };
      if (callback) callback({ data: { status, errors, data, uid} });
      return txStatus;
    };
    let txInfo = {};
    let errors = [];
    try {
      //Make sure the txInfo was a JSON string (for security)
      txInfo = JSON.parse(data);
      // check networkName
      if (!txInfo.networkName) {
          txInfo.networkName = "legacy"
      }
    } catch (err) {
      return makeTxStatus(undefined, [
        "Failed to Parse JSON object",
        err.message,
      ]);
    }

    //Create a unique ID for this transaction for reference later if needed
    if (!txInfo.uid) txInfo.uid = utils.hashStringValue(new Date().toISOString());

    if (accounts.walletIsLocked()) {
      return makeTxStatus(undefined, ["Lamden Vault is Locked"], txInfo.uid);
    } else {
      let approvalRequest = false;
      let forceTxApproval = false;


      //Validate networkType was provided
      if (!utils.validateTypes.isStringWithValue(txInfo.networkType)) {
        return makeTxStatus(undefined, [
          "networkType <string> required but not provided",
        ], txInfo.uid);
      }

      //Get the Lamden Network Object for the network types specified in the txInfo request
      const network = utils.networks.getLamdenNetwork(
        txInfo.networkType.toLowerCase(),
        txInfo.networkName
      );
      if (!network) {
        errors = [
          `'networkType' <string> '${txInfo.networkType}' is not a valid network type. Valid types are ${utils.networks.LamdenNetworkTypes}.`,
        ];
        return makeTxStatus(undefined, errors, txInfo.uid);
      }

      //Reject transaction attempt if network type has not been approved
      if (!dappInfo[`${txInfo.networkName}|${txInfo.networkType.toLowerCase()}`]) {
        errors = [
          `Transactions on '${txInfo.networkType}' have not been approved for ${dappInfo.url}.`,
        ];
        return makeTxStatus(undefined, errors, txInfo.uid);
      }

      try {
        let symbol = `${txInfo.networkName}|${txInfo.networkType}`
        //Find the wallet in the coinStore that is assocated with this dapp (was created specifically for this dApp during authorization)
        const wallet = accounts.getAccountByVK(dappInfo.vk);
        //Set senderVk to the one assocated with this dapp
        txInfo.senderVk = wallet.vk;
        //Check if contractName was supplied
        if (typeof txInfo.contractName !== "undefined") {
          //Check if the contract name is currency, and that it's an approval transaction
          if (
            txInfo.contractName === "currency" &&
            txInfo.methodName === "approve"
          ) {
            approvalRequest = true;
            //Hardcode the approved contract name into the approval request
            //txInfo.kwargs.to = dappInfo[txInfo.networkType].contractName;
          } else {
            //Check if the provided contract Name differs from the approved one
            // If so, then force the user to approve the transaction (ignoring auto tx settings)
            if (
              txInfo.contractName !== dappInfo[symbol].contractName
            ) {
              forceTxApproval = true;
            }
          }
        } else {
          //Set the contract name to the one approved by the user for the dApp
          txInfo.contractName = dappInfo[symbol].contractName;
        }

        if (txInfo.stampLimit) {
          //Create a Lamden Transaction
          const txBuilder = new utils.Lamden.TransactionBuilder(network, txInfo);
          const info = (({ appName, url, logo }) => ({ appName, url, logo }))(
            dappInfo
          );
          const txData = txBuilder.getAllInfo();
          if (approvalRequest) {
            promptCurrencyApproval(sender, { txData, wallet, dappInfo: info });
          } else {
            if (dappInfo[symbol].trustedApp && !forceTxApproval) {
              transactions.sendLamdenTx(txBuilder, dappInfo.url);
            } else {
              promptApproveTransaction(sender, {
                txData,
                wallet,
                dappInfo: info,
                network,
              });
            }
          }
          return callback("ok");
        } else {
          fetch(`${network.blockservice.host}/stamps/estimation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(makeTx(txInfo)),
          }).then(r => r.json()).then(d => {
              txInfo.stampLimit = Math.ceil(d['stamps_used'] * 1.05)

              //Create a Lamden Transaction
              const txBuilder = new utils.Lamden.TransactionBuilder(network, txInfo);

              const info = (({ appName, url, logo }) => ({ appName, url, logo }))(
                dappInfo
              );
              const txData = txBuilder.getAllInfo();
              txData.txInfo.isEstimated = true;
              if (d.status !== 0) {
                let group = d.result.match(/Error\(['"].*['"],\)/)
                if (group.length > 0) {
                    txData.txInfo.error = group[0].slice(7, -3)
                }
              }
              if (approvalRequest) {
                promptCurrencyApproval(sender, { txData, wallet, dappInfo: info });
              } else {
                if (dappInfo[symbol].trustedApp && !forceTxApproval) {
                  transactions.sendLamdenTx(txBuilder, dappInfo.url);
                } else {
                  promptApproveTransaction(sender, {
                    txData,
                    wallet,
                    dappInfo: info,
                    network,
                  });
                }
              }
              return callback("ok");
          })
        }
      } catch (err) {
        return makeTxStatus(undefined, [
          `Unable to Build ${whitelabel.companyName} Transaction`,
          err.message,
        ], txInfo.uid);
      }
    }
  };

  const promptApproveDapp = async (
    sender,
    messageData,
    reapprove = false,
    dappInfo = undefined
  ) => {
    let exists = await utils.networks.contractExists(
      messageData.networkType,
      messageData.contractName,
      messageData.networkName
    );
    if (!exists) {
      const errors = [
        `contractName: '${messageData.contractName}' does not exists on '${messageData.networkType}' network.`,
      ];
      utils.sendMessageToTab(sender.origin, "sendErrorsToTab", { errors });
    } else {
      const windowId = utils.createUID();
      messageData.network = utils.networks.getLamdenNetwork(
        messageData.networkType,
        messageData.networkName
      );
      messageData.accounts = accounts.getSanatizedAccounts();
      if (reapprove) {
        messageData.reapprove = reapprove;
        messageData.oldConnection = dappInfo;
      }

      dapps.setTxToConfirm(windowId, {
        type: "ApproveConnection",
        messageData,
        url: sender.origin,
      });
      createPopup(windowId);
    }
  };

  const promptApproveTransaction = async (sender, messageData) => {
    const windowId = utils.createUID();
    dapps.setTxToConfirm(windowId, {
      type: "ApproveTransaction",
      messageData,
      url: sender.origin,
    });
    createPopup(windowId);
  };
  const promptCurrencyApproval = async (sender, messageData) => {
    const windowId = utils.createUID();
    dapps.setTxToConfirm(windowId, {
      type: "CurrencyApproval",
      messageData,
      url: sender.origin,
    });
    createPopup(windowId);
  };

  const createPopup = (windowId) => {
    chrome.windows.create({
      url: `/confirm.html#${windowId}`,
      width: 375,
      height: 700,
      type: "popup",
    });
  };

  const deleteAccount = (data) => {
    const { account, string } = data;
    if (dapps.getDappInfoByVK(account.vk)) {
      return "used";
    } else {
      if (accounts.checkPassword(string)) {
        accounts.deleteOne(account);
        return true;
      }
      return false;
    }
  };

  // vertify the password and view private key
  const viewPrivateKey = (data) => {
    if (!data.vk || !data.password) {
      return {
        success: false,
      };
    }

    if (accounts.validatePassword(data.password)) {
      let account = accounts.getAccountByVK(data.vk);

      if (account.sk === "watchOnly")
        return {
          success: false,
        };

      let sk = accounts.decryptString(account.sk);
      return {
        success: true,
        data: { ...account, sk },
      };
    } else {
      return {
        success: false,
      };
    }
  };

  // Set the mnemonic phrase in vault
  const setMnemonic = (str) => {
    let origin = accounts.getMnemonic();

    if (origin === str) return true;

    let coins = accounts.getSanatizedAccounts();
    coins.forEach((c) => {
      if (c.type === "vault") {
        accounts.deleteOne(c);
        dapps.deleteDapp(c.vk);
      }
    });
    let ok = accounts.setMnemonic(str);
    fauna.fetchUpdates();
    return ok;
  };

  return {
    accounts: {
      walletIsLocked: accounts.walletIsLocked,
      firstRun: accounts.firstRun,
      validatePassword: accounts.validatePassword,
      createKeystore: accounts.createKeystore,
      addNewLamdenAccount: accounts.addNewLamdenAccount,
      addOne: accounts.addOne,
      addMany: accounts.addMany,
      changeAccountNickname: accounts.changeAccountNickname,
      decryptKeys: accounts.decryptKeys,
      reorderUp: accounts.reorderUp,
      reorderDown: accounts.reorderDown,
      isVaultCreated: accounts.isVaultCreated,
      getMnemonic: accounts.getMnemonic,
      addVaultAccount: accounts.addVaultAccount,
    },
    dapps: {
      setTrusted: dapps.setTrusted,
      revokeAccess: dapps.revokeAccess,
      reassignLink: dapps.reassignLink,
      getConfirmInfo: dapps.getConfirmInfo,
      approveDapp: dapps.approveDapp,
      reapproveDapp: dapps.reapproveDapp,
      updateDapp: dapps.updateDapp,
      rejectDapp: dapps.rejectDapp,
      rejectTx: dapps.rejectTx,
      approveTransaction: dapps.approveTransaction,
      getDappInfoByURL: dapps.getDappInfoByURL,
      validateConnectionMessage: dapps.validateConnectionMessage,
      updateStampLimit: (confirmHash, limit) => {
        let data = dapps.getConfirmInfo(confirmHash);
        if (!data) return { success: false };
        data.messageData.txData.txInfo.stampLimit = limit;
        dapps.setTxToConfirm(confirmHash, data);
        return {
          success: true,
        };
      },
    },
    tokens: {
      addToken: tokens.addToken,
      updateToken: tokens.updateToken,
      deleteTokenOne: tokens.deleteTokenOne,
      deleteTokenAll: tokens.deleteTokenAll,
      validateTokenContract: tokens.validateTokenContract,
      getTokenMeta: tokens.getTokenMeta,
      tokenExists: tokens.tokenExists,
      refreshTokenBalances: updateAllTokenBalances,
      reorderUp: tokens.reorderUp,
      reorderDown: tokens.reorderDown,
      refreshOneTokenBalances: tokens.refreshOneTokenBalances,
    },
    events: {
      autoFetchUpdates: events.autoFetchUpdates,
    },
    balances,
    utils,
    state,
    createPassword,
    changePassword,
    deleteAccount,
    updateAllBalances,
    handleSwitchNetwork,
    updateOneBalance,
    clearNetworkBalances,
    fromAuthorizedDapp: (url) => dapps.dappExists(url),
    unlock,
    lock,
    getWalletInfo,
    initiateAppTxSend,
    initiateDAppTxSend,
    promptApproveDapp,
    joinSockets,
    leaveSockets,
    joinTokenSockets,
    joinTokenSocket,
    updateAccountAndTokenBalances,
    viewPrivateKey,
    setMnemonic,
    retryFetchSendResult,
  };
};
