<script>
    import { getContext } from 'svelte'

    //Components
    import Button from '../components/Button.svelte'
    import InputBox from '../components/InputBox.svelte'

    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';

    //Context
    const { approveApp, close, openNewTab } = getContext('confirm_functions');

    //DOM NODES
    let stampPreApprovalInput;

    export let confirmData;

    let approvePreApprove = false;
    const preApproval = confirmData.messageData.preApproval || false

    const sendApprove = () => {
        if (approvePreApprove) approveApp(stampPreApprovalInput.value)
        else approveApp(0)
    }

</script>

<style>
.approve-conection{
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    padding: 0 20px 20px 20px;
}

.hero-rec{
    width: 100%;
    height: 125px;
    padding: 15px 20px;
    justify-content: space-between;
    align-items: center;
    background-size: cover;
    background-repeat: no-repeat;
}

.dapp-name{
    margin-bottom: 0.5rem;
}

.approve-items{
    justify-content: center;
    text-align: center;
    align-content: space-around;
    width: 100%;
    padding-bottom: 20px;
}

.item{
    width: 45%;
    justify-content: space-evenly;
}

.item:first-child{
    border-right: 1px solid gray;
}

.pre-approval{
    border: 1px solid grey;
    border-radius: 20px;
    background: #2b2b2b;
    box-sizing: border-box;
    padding: 15px;
}

.checkbox-row{
    justify-content: center;
    align-items: center;
}
.buttons{
    margin-bottom: 0.5rem;
}
.help-link{
    text-align: center;
}

</style>

<div class="approve-conection flex-column">
    <div class="flex-column hero-rec" style="background-image: url({squares_bg})" >
        <h1>{`App Connection Request From`}</h1>
        <div class="text-body3 dapp-name">{`${confirmData.messageData.appName}`}</div>
        <a class="outside-link" href={confirmData.url} rel="noopener noreferrer" target="_blank">{`source ${confirmData.url}`}</a>
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
            <div>{confirmData.messageData.networkType.toUpperCase()}</div>
        </div>
    </div>
    {#if preApproval}
    <div class="pre-approval flex-column">
        <div class="text-subtitle2">
            {preApproval.message}
        </div> 
        <InputBox
            id="preapproval-input"
            value={preApproval.stampsToPreApprove}
            bind:thisInput={stampPreApprovalInput}
            width="50%"
            margin={"0 auto 1rem"}
            backgroundColor={"#2b2b2b"}
            label={`Stamps`}
            inputType= 'number'
            autofocus={true}
        />
        <div class="checkbox-row flex-row">
            <input type="checkbox" bind:checked={approvePreApprove}>
            <span class="text-subtitle2">{`pre-approve stamp amount`}</span>
        </div>
    </div>

    {/if}
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
                click={sendApprove} />
        </div>
        <div class="help-link">
            <a class="outside-link" href="www.lamden.io">learn more about approving dApps</a>
        </div>   
    </div>
</div>



