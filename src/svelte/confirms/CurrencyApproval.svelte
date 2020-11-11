<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext } from 'svelte'

    //Components
    import Button from '../components/Button.svelte'

    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';
    import approve from '../../img/menu_icons/icon_approve.svg';
    import caution from '../../img/menu_icons/icon_caution.svg';

    //Context
    const { approveTx, close, openNewTab } = getContext('confirm_functions');

    export let confirmData;

    const txData = confirmData.messageData.txData
    const wallet = confirmData.messageData.wallet
    const dappInfo = confirmData.messageData.dappInfo
    const currencySymbol = txData.networkInfo.type === 'mainnet' ? "Tau" : "dTau"

    let prevent = false

</script>

<style>
.details{
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    padding: 20px;
    text-align: center;
}
.info{
    align-items: center;
    flex-grow: 1;
    justify-content: center;
}

.hero-rec{
    width: 100%;
    padding: 2rem 0;
    justify-content: space-between;
    align-items: center;
    background-size: cover;
    background-repeat: no-repeat;
    box-sizing: border-box;
}

.text-subtitle4.text-link{
    margin-top: 1rem;
}

.buttons{
    padding: 1rem 0;
}
.icon_approve{
    width: 100px;
    margin-bottom: 2rem;
}
.icon_caution{
    width: 22px;
    margin-right: 9px;
}
.message{
    font-size: 1.3em;
}
p.message {
    margin: 0;
}
.caution{
    align-items: center;
    margin-top: 3rem;
}
.caution > p{
    font-size: 1.1em;
}
p > strong {
    color: var(--font-accent)
}

</style>

<div class="flex-column hero-rec" style="background-image: url({hero_bg})" >
    <h2>{dappInfo.appName} wants to spend your {currencySymbol}</h2>
    <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{`source ${dappInfo.url}`}</a>
</div>
<div class="details flex-column">
    <div class="info flex-column">
        <div class="icon_approve">
            {@html approve}
        </div>
        <p class="message">
            Give <strong> {txData.txInfo.kwargs.to}</strong> access to <strong>{txData.txInfo.kwargs.amount} {currencySymbol}</strong> ?
        </p>

    </div>
    <div class="caution flex-row">
        <div class="icon_caution">
            {@html caution}
        </div>
        <p>
            Make sure you trust this app!
        </p>
    </div>

    <div class="flex-column">
        <div class="buttons flex-row">
            <Button 
                id={'deny-btn'}
                classes={'button__solid'}
                name="Deny"
                width={'175px'}
                height={'42px'}
                margin={'0 20px 0 0'}
                click={close} />

            <Button 
                id={'approve-btn'}
                classes={'button__solid button__primary'}
                name="Approve"
                width={'175px'}
                height={'42px'}
                click={approveTx} />
        </div>
        <div>
            {#if whitelabel.helpLinks.show}
                <a  class="text-link text-subtitle4" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/docs/wallet/accounts_linked_approval"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    what is this?
                </a>
            {/if} 
        </div>   
    </div>
</div>



