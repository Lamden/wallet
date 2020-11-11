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
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    padding: 20px 30px;
}

.hero-rec{
    width: 100%;
    padding: 1.2rem 20px;
    justify-content: space-between;
    align-items: center;
    background-size: cover;
    background-repeat: no-repeat;
    box-sizing: border-box;
}

.approve-items{
    width: 100%;
    justify-content: space-between;
}

.approve-items .item{
    padding: 5px 15px 5px 5px;
    width: fit-content;
    max-width: 48%;
}
.approve-items .item_icon{
    width: 22px;
    min-width: 22px;
    margin-right: 5px;
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
.function{
    align-items: center;
    margin: 1rem 0 ; 
}
.function .text-body2{
    font-size: 1.4em;
}
.function_icon{
    width: 60px;
    margin-right: 5px;
}

.kwargs {
    align-items: flex-start;
    width: 100%;
    padding: 0 5px;
    flex-grow: 1;
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
}
.kwarg-value{
    word-break: break-word;
    margin-bottom: 0.5rem;
}

.kwarg-value:last-child{
    margin-bottom: unset;
}

.buttons{
    margin: 1rem 0;
}
a.help{
    text-align: center;
}
.dapp-name > img {
    width: 37px;
    margin-right: 10px;
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
    color: var(--font-warning);
}

</style>

<div class="flex-column hero-rec" style="background-image: url({hero_bg})" >
    <h2>{`Confirm Transaction From`}</h2>
    <div class="flex-row dapp-name">
        <img src={`${dappInfo.url}${dappInfo.logo}`} alt="app logo" />
        <p class="dapp-name-text">{`${dappInfo.appName}`}</p>
    </div>
    <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{`source ${dappInfo.url}`}</a>
</div>
<div class="details flex-column">
    <div class="approve-items flex-row">
        <div class="item flex-row">
            <div class="item_icon">
                <SmartContractIcon />
            </div>
            <div class="item_info flex-column">
                <p class="text-body2 text-secondary">{`Smart Contract`}</p>
                <p class="item_value text-body2">{txData.txInfo.contractName}</p>
            </div>
        </div>
        <div class="item flex-row">
            <div class="item_icon">
                <NetworkIcon />
            </div>
            <div class="item_info flex-column">
                <p class="text-body2 text-secondary">{`Network`}</p>
                <p class="item_value text-body2">{confirmData.messageData.network.name}</p>
            </div>
        </div>
    </div>
    <div class="function flex-row">
        <div class="function_icon">
            {@html process}
        </div>
        <div class="function_info flex-column">
            <p class="text-body2 text-secondary">{`Action`}</p>
            <p class="text-body2">{txData.txInfo.methodName}</p>
        </div>
    </div>

    <div class="kwargs flex-column">
        {#each Object.keys(txData.txInfo.kwargs) as kwarg }
        <div class="flex-row">
            <div class="kwarg_icon">{@html arrow_right}</div>
            <p class="text-subtitle2 text-body2">{kwarg}</p>
        </div>
        <div class="kwarg-value text-subtitle4 text-secondary">{txData.txInfo.kwargs[kwarg]}</div>
        {/each}
    </div>
    <div class="buttons flex-row">
        <Button 
            id={'deny-btn'}
            classes={'button__solid button__primary'}
            name="Deny"
            width={'175px'}
            height={'42px'}
            margin={'0 20px 0 0'}
            click={close} />

        <Button 
            id={'approve-btn'}
            classes={'button__solid'}
            name="Approve"
            width={'175px'}
            height={'42px'}
            click={approveTx} />
    </div>
    <a class="text-link help" href={confirmData.url} rel="noopener noreferrer" target="_blank">what is this?</a>
</div>



