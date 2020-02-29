<script>
    import { getContext } from 'svelte'

    //Components
    import Button from '../components/Button.svelte'

    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';

    //Context
    const { approve, close } = getContext('confirm_functions');

    export let confirmData;
    let prevent = false

</script>

<style>
.approve-conection{
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    padding: 20px;
    text-align: center;
}

.hero-rec{
    width: 100%;
    height: 125px;
    padding: 15px 20px;
    justify-content: space-between;
    background-size: cover;
    background-repeat: no-repeat;
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
}

.item:first-child{
    border-right: 1px solid gray;
}

input[type="checkbox"]{
    width: 12px;
    height: 12px;
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

<div class="approve-conection flex-column">
    <div class="flex-column hero-rec" style="background-image: url({squares_bg})" >
        <h1>{`App Connection Request From`}</h1>
        <div class="text-body3 dapp-name">{`${confirmData.messageData.dappName}`}</div>
        <div>{confirmData.url}</div>
    </div>

    <div class="description text-subtitle2">
        {confirmData.messageData.description}
    </div>

    <div class="approve-items flex-row">
        <div class="item flex-column">
            <div class="text-body2 text-primary-dark">{`Smart Contract`}</div>
            <div>{confirmData.messageData.contractName}</div>
        </div>
        <div class="item flex-column">
            <div class="text-body2 text-primary-dark">{`On Network`}</div>
            <div>{confirmData.messageData.networkName.toUpperCase()}</div>
        </div>
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
                classes={'button__solid button__purple'}
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



