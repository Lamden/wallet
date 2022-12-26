<script>
  import { setContext, getContext } from "svelte";

  //Stores
  import { currentNetwork } from '../../js/stores/stores.js';

  //Components
  import { Modals, Components } from "../Router.svelte";
  const { Button } = Components;

  //Context
  const { closeModal } = getContext("app_functions");

  setContext("tx_functions", {
    nextPage: () => nextPage(),
    close: () => closeModal(),
  });

  //Props
  export let modalData;

  let account = modalData.account
  let steps = [
    { page: "MethodTx", back: 0, cancelButton: true },
    { page: "CoinSendingTx", back: -1, cancelButton: false },
    { page: "ResultBox", back: -1, cancelButton: false },
  ];
  let buttons = [
    {
      name: "Close",
      click: () => closeModal(),
      class: "button__solid button__primary",
    },
  ];

  let buferSize = 0.05;
  let currentStep = 0;

  let resultInfo = {};
  let txData = {
    txInfo: modalData.txInfo,
  };

  const nextPage = () => {
    currentStep = currentStep + 1;
  };

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

  const handleSaveTxDetails = (e) => {
    txData = { ...e.detail };
    if ($currentNetwork.blockservice.host) {
        fetch(`${$currentNetwork.blockservice.host}/stamps/estimation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(makeTx(txData.txInfo)),
        }).then(r => r.json()).then(d => {
            if (d.status === 0) {
                txData.txInfo.stampLimit = Math.ceil(d['stamps_used'] * (1 + buferSize))
                nextPage()
            } else {
                let group = d.result.match(/Error\(['"].*['"],\)/)
                if (group.length > 0) {
                    resultInfo.errorInfo = []
                    resultInfo.errorInfo[0] = group[0].slice(7, -3)
                }
                resultInfo.buttons = [
                    {name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
                ]
                resultInfo.title = `Transaction Failed`
                resultInfo.subtitle = `Your transaction will fail, please edit and then resend the transaction`
                resultInfo.type = 'error'
                currentStep = currentStep + 2
            }
        })
    } else {
      nextPage()
    }
  };

  const createTxDetails = () => {
    let txDetails = [
      { name: "Contract Name", value: txData.txInfo.contractName },
      { name: "Function", value: txData.txInfo.methodName },
    ];
    Object.keys(txData.txInfo.kwargs).map((arg) => {
      let argValue = txData.txInfo.kwargs[arg];
      txDetails.push({ name: `${arg}`, value: JSON.stringify(argValue) });
      return arg;
    });
    return txDetails;
  };

  const resultDetails = (e) => {
    resultInfo = e.detail.resultInfo;
    resultInfo.buttons = buttons;
    resultInfo.txHash = e.detail.txHash;
    nextPage();
  };
</script>

<svelte:component
  this={Modals[steps[currentStep].page]}
  result={resultInfo}
  {txData}
  {account}
  txDetails={createTxDetails()}
  on:txResult={(e) => resultDetails(e)}
  on:saveTxDetails={handleSaveTxDetails}
/>
