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

    const getAmount = (amount) => {
        if (!amount) return 0
        if (amount.__fixed__) return amount.__fixed__
        return amount
    }

</script>

<style>
.details{
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    padding: 1rem;
    text-align: center;
}
.info{
    align-items: center;
    flex-grow: 1;
    justify-content: center;
}
.text-subtitle4.text-link{
    margin-top: 1rem;
}
.icon_approve{
    width: 75px;
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
}
.caution > p{
    font-size: 1.1em;
}
p > strong {
    color: var(--font-accent)
}
.text-link, .text-link:visited, .text-link:focus{
    color: var(--font-warning);
    margin: 0.5rem 0 0 0;
}
.buttons{
    align-items: center;
    flex-grow: 1;
    justify-content: flex-end;
}
</style>

<div class="flex-column hero-rec popup" style="background-image: url({hero_bg})" >
    <h3>{dappInfo.appName} wants to spend your {currencySymbol}</h3>
    <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{`source ${dappInfo.url}`}</a>
</div>
<div class="details flex-column">
    <div class="info flex-column">
        <div class="icon_approve">
            {@html approve}
        </div>
        <p class="message">
            Give <strong> {txData.txInfo.kwargs.to}</strong> access to <strong>{getAmount(txData.txInfo.kwargs.amount)} {currencySymbol}</strong> ?
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

    <div class="flex-column buttons">
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



