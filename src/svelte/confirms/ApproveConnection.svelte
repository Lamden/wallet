<script>
    import { getContext } from 'svelte'

    //Components
    import Button from '../components/Button.svelte'
    import ReApproveConnection from './ReApproveConnection.svelte'
    import ApproveConnectionIntro from './ApproveConnectionIntro.svelte'
    import ApproveConnectionTrusted from './ApproveConnectionTrusted.svelte'
    import ApproveConnectionFund from './ApproveConnectionFund.svelte'

    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';

    //Context
    const { approveApp, logoFormat } = getContext('confirm_functions');

    export let confirmData;

    confirmData.messageData.accounts = confirmData.messageData.accounts.filter(account => parseFloat(account.balance) > 0)

    let step = 1
    let reapprove = confirmData.messageData.reapprove

    const setStep = (nextStep) => {
        if (nextStep.detail > 3) approveApp()
        else step = nextStep.detail
    };
</script>

<style>
    p{
        margin: 0;
    }

    img {
            width: 37px;
            margin-right: 10px;
    }
    .text-link, .text-link:visited, .text-link:focus{
        color: var(--font-warning);
        margin: 0.5rem 0 0 0;
    }
</style>

<div class="flex-column flex-grow-1">
    <div class="flex-column hero-rec popup" style="background-image: url({hero_bg})" >
        {#if reapprove}
            <h3>Smart Contract Update</h3>
        {:else}
            <h3>Linked Account Creation</h3>
        {/if}
        <div class="flex-row dapp-name">
            <img src={`${confirmData.url}/${logoFormat(confirmData.messageData.logo)}`} alt="app logo" />
            {#if reapprove}
                <p class="text-body1">{confirmData.messageData.oldConnection.appName}</p>
            {:else}
                <p class="text-body1">{confirmData.messageData.appName}</p>
            {/if}
        </div>
        <a class="text-link" href={confirmData.url} rel="noopener noreferrer" target="_blank">{`source ${confirmData.url}`}</a>
    </div>
    {#if step == 1}
        {#if reapprove}
            <ReApproveConnection {confirmData}
                on:setStep={setStep}
            />
        {:else}
            <ApproveConnectionIntro {confirmData}
                on:setStep={setStep}
            />
        {/if}

    {/if}

    {#if step == 2}
        <ApproveConnectionFund {confirmData}
            on:setStep={setStep} 
        />
    {/if}   

    {#if step == 3}
        <ApproveConnectionTrusted {confirmData}
            on:setStep={setStep} 
        />
    {/if}
</div>

