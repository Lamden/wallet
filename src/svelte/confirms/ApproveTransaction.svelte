<script>
    import { getContext } from 'svelte'

    //Components
    import Button from '../components/Button.svelte'

    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';

    //Icons
    import SmartContractIcon from '../icons/SmartContractIcon.svelte'
    import NetworkIcon from '../icons/NetworkIcon.svelte'
    import process from '../../img/menu_icons/icon_process.svg'
    import arrow_right from '../../img/menu_icons/icon_arrow-right-2color.svg'

    //Context
    const { approveTx, close, openNewTab } = getContext('confirm_functions');

    export let confirmData;

    const txData = confirmData.messageData.txData
    const wallet = confirmData.messageData.wallet
    const dappInfo = confirmData.messageData.dappInfo

    let prevent = false

</script>

<style>
p{
    margin: 0;
}
.details{
    flex-grow: 1;
    padding: 1rem;
}
.approve-items{
    width: 100%;
}
.approve-items .item{
    margin-bottom: 0.75rem;
    align-items: center;
}
.approve-items .item_icon{
    min-width: 22px;
    height: 32px;
}
.approve-items .item_icon_size{
    width: 37px;
    position: relative;
    top: -4px;
}
.approve-items .item_value{
    max-width: 100%;
    word-break: break-word;
}

.approve-items .item:last-child{
    border-right: none;
}
.approve-items .item p {
    margin: 0 0 0.25px 0;
}

.item .item_info{
        margin-left: 8px;
}
.kwargs {
    box-sizing: border-box;
    align-items: flex-start;
    width: 100%;
    padding: 0 0.5rem;
    flex-grow: 1;
    max-height: 120px;
    overflow-y: auto;
    overflow-x: hidden;
    margin: 1rem 0;
}
.kwarg-value{
    word-break: break-word;
    margin-bottom: 0.5rem;
}

.kwarg-value:last-child{
    margin-bottom: unset;
}
.buttons{
    align-items: center;
    flex-grow: 1;
    justify-content: flex-end;
}
a.help{
    text-align: center;
}
.kwargs .flex-row{
    align-items: center;
}
.kwarg_icon{
    width: 15px;
    margin-right: 5px;
    position: relative;
    top: 1px;
}
.text-link, .text-link:visited, .text-link:focus{
    margin: 0.5rem 0 0 0;
    color: var(--font-warning);
}

</style>

<div class="flex-column hero-rec popup" style="background-image: url({hero_bg})" >
    <h3>{`Confirm Transaction`}</h3>
    <div class="flex-row dapp-name">
        <img src={`${dappInfo.url}${dappInfo.logo}`} alt="app logo" />
        <p class="text-body1">{`${dappInfo.appName}`}</p>
    </div>
    <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{`source ${dappInfo.url}`}</a>
</div>
<div class="details flex-column">
    <div class="approve-items flex-column">

        <div class="item flex-row">
            <div class="item_icon">
                <NetworkIcon width="34px"/>
            </div>
            <div class="item_info flex-column">
                <p class="text-body2 text-secondary">{`Network`}</p>
                <p class="item_value text-body2">{confirmData.messageData.network.name}</p>
            </div>
        </div>
        <div class="item flex-row">
            <div class="item_icon item_icon_size">
                <SmartContractIcon width="36px"/>
            </div>
            <div class="item_info flex-column">
                <p class="text-body2 text-secondary">{`Smart Contract`}</p>
                <p class="item_value text-body2">{txData.txInfo.contractName}</p>
            </div>
        </div>
        <div class="item flex-row">
            <div class="item_icon item_icon_size">
                {@html process}
            </div>
            <div class="item_info flex-column">
                <p class="text-body2 text-secondary">{`Action`}</p>
                <p class="item_value text-body2">{txData.txInfo.methodName}</p>
            </div>
        </div>
    </div>
    <div class="kwargs flex-column">
        {#each Object.keys(txData.txInfo.kwargs) as kwarg }
        <div class="flex-row">
            <div class="kwarg_icon">{@html arrow_right}</div>
            <p class="text-subtitle2 text-body2">{kwarg}</p>
        </div>
        <div class="kwarg-value text-subtitle4 text-secondary">{JSON.stringify(txData.txInfo.kwargs[kwarg])}</div>
        {/each}
    </div>
    <div class="flex-column buttons ">
        <Button 
            id={'approve-btn'}
            classes={'button__solid button__primary'}
            name="Approve"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={approveTx} />
        <Button 
            id={'deny-btn'}
            classes={'button__solid'}
            name="Deny"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={close} />


            <a class="text-link help" href={"https://docs.lamden.io/docs/wallet/accounts_linked_transfer"} rel="noopener noreferrer" target="_blank">what is this?</a>
    </div>
    
</div>



