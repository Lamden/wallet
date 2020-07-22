<script>
    import { getContext } from 'svelte'

    //Components
    import Button from '../components/Button.svelte'
    import ApproveConnectionIntro from './ApproveConnectionIntro.svelte'
    import ApproveConnectionTrusted from './ApproveConnectionTrusted.svelte'
    import ApproveConnectionFund from './ApproveConnectionFund.svelte'

    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';

    //Context
    const { approveApp } = getContext('confirm_functions');

    export let confirmData;

    let step = 1

    const nextStep = () => {
        if (step === 3){
            approveApp()
        }else{
            step += 1
        }

    };

    const back = () => step > 1 ? step -= 1 : step = 1;

	const fixLogo = (logo) => logo.substring(0, 1) === '/' ? logo.substring(1, logo.length) : logo

</script>

<style>
    .approve-conection{
        align-items: center;
        flex-grow: 1;
        justify-content: space-between;
        padding: 0 20px 20px 20px;
        overflow-x: hidden;
    }

    .hero-rec{
        width: 100%;
        padding: 1.2rem 20px;
        justify-content: space-between;
        align-items: center;
        background-size: cover;
        background-repeat: no-repeat;
    }

    .dapp-name{
        align-items: center;
    }

    p{
        margin: 0;
    }

    img {
            width: 37px;
            margin-right: 10px;
        }
</style>

<div class="approve-conection flex-column">
    <div class="flex-column hero-rec" style="background-image: url({squares_bg})" >
        <h1>Create Wallet Account</h1>
        <div class="flex-row dapp-name">
            <img src={`${confirmData.url}/${fixLogo(confirmData.messageData.logo)}`} alt="app logo" />
            <p class="text-body3">{`${confirmData.messageData.appName}`}</p>
        </div>
        <a class="outside-link" href={confirmData.url} rel="noopener noreferrer" target="_blank">{`source ${confirmData.url}`}</a>
    </div>
    {#if step == 1}
        <ApproveConnectionIntro {confirmData}
            on:nextStep={nextStep}
        />
    {/if}

    {#if step == 2}
        <ApproveConnectionFund {confirmData}
            on:nextStep={nextStep} 
            on:back={back}
        />
    {/if}   

    {#if step == 3}
        <ApproveConnectionTrusted {confirmData}
            on:nextStep={nextStep} 
            on:back={back}
        />
    {/if}

 

</div>

