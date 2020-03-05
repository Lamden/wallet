<script>
    import { getContext } from 'svelte'

    //Components
    import Button from '../components/Button.svelte'

    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';

    //Context
    const { approve, close, openNewTab } = getContext('confirm_functions');

    export let confirmData;

    const txData = confirmData.messageData.txData
    const wallet = confirmData.messageData.wallet
    const dappInfo = confirmData.messageData.dappInfo

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

.hero-rec{
    width: 100%;
    height: 119px;
    padding: 15px 0;
    justify-content: space-between;
    background-size: cover;
    background-repeat: no-repeat;
    align-items: center;
}

.dapp-name{
    margin-bottom: 0.5rem;
}

.approve-items{
    justify-content: center;
    align-content: space-around;
    width: 100%;
}

.item{
    width: 45%;
    justify-content: space-evenly;
    border-right: 1px solid gray;
}

.item:last-child{
    border-right: none;
}

input[type="checkbox"]{
    width: 12px;
    height: 12px;
}

.kwargs {
    align-items: flex-start;
    max-height: 175px;
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

.checkbox-words{
    margin-top: 1px;
}

.text-subtitle4.copy-link{
    margin-top: 1rem;
}

.buttons{
    margin-bottom: 0.5rem;
}

</style>

<div class="flex-column hero-rec" style="background-image: url({squares_bg})" >
    <h1>{`Confirm Transaction From`}</h1>
    <div class="text-body3 dapp-name">{`${dappInfo.appName}`}</div>
    <div class=" appurl-link text-body2 text-primary-dark" on:click={() => openNewTab(dappInfo.url)}>{`source ${dappInfo.url}`}</div>
</div>
<div class="details flex-column">
    <div class="approve-items flex-row">
        <div class="item flex-column">
            <div class="text-body2 text-primary-dark">{`Smart Contract`}</div>
            <div>{txData.txInfo.contractName}</div>
        </div>
        <div class="item flex-column">
            <div class="text-body2 text-primary-dark">{`Method`}</div>
            <div>{txData.txInfo.methodName}</div>
        </div>
        <div class="item flex-column">
            <div class="text-body2 text-primary-dark">{`On Network`}</div>
            <div>{txData.networkInfo.type.toUpperCase()}</div>
        </div>
    </div>

    <div class="kwargs flex-column">
        {#each Object.keys(txData.txInfo.kwargs) as kwarg }
            <div class="text-subtitle2">{kwarg}</div>
            <div class="kwarg-value text-subtitle4 text-primary-dark">{txData.txInfo.kwargs[kwarg]}</div>
        {/each}
    </div>
    <div class="flex-column">
        <div class="buttons flex-row">
            <Button 
                id={'deny-btn'}
                classes={'button__solid button__purple'}
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
                click={approve} />
        </div>
        <div>
            <a class="text-subtitle4 copy-link" href="www.lamden.io">help?</a>
        </div>   
    </div>

    <div class="flex-row">
        <input type="checkbox" bind:checked={prevent}>
        <small class="checkbox-words text-primary-dark">{`prevent this website from creating further requests`}</small>
    </div>
</div>



