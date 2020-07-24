<script>
    import { getContext } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    import InputBox from '../components/InputBox.svelte'
    import { createEventDispatcher } from 'svelte';
    
    //Icons
    import smartContract from '../../img/menu_icons/icon_smartcontract.svg'
    import network from '../../img/menu_icons/icon_network.svg'

    const dispatch = createEventDispatcher();
    const next = () => {
        let nextStep = 2;
        if (confirmData.messageData.accounts.length === 0) nextStep = 3;
        dispatch('setStep', nextStep)
    }
        
    //Context
    const { close, openNewTab } = getContext('confirm_functions');

    export let confirmData;

</script>


<style>
    .detail{
        align-items: center;
        justify-content: space-between;
        flex-grow: 1;
        padding-top: 2rem;
    }
    .approve-items{
        justify-content: center;
        text-align: center;
        align-content: space-around;
        width: 100%;
    }
    .description{
        font-weight: 600;
        font-size: 1.2em;
        text-align: center;
    }
    .buttons{
        margin-bottom: 0.5rem;
    }
    .help-link{
        text-align: center;
    }
    .item{
        width: 265px;
        margin: 0.25rem auto;
    }
    .item_icon{
        width: 60px;
    }
    .item_info{
        margin: auto 0 auto 20px;
        text-align: initial;
    }
    .item_info > p {
        margin: 0;
    }
    .item_value{
        font-size: 1.2em;
    }
    .buttons{
        padding: 1rem 0;
    }
    p {
        margin: 0;
    }
    p.intro{
        font-size: 1.2em;
    }
</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">
    
    <p class="intro">A website would like to create a <a class="outside-link" href="www.lamden.io">linked account</a> in your wallet</p>


    <div class="approve-items flex-col">
        <div class="item flex-row">
            <div class="item_icon">
                {@html smartContract}
            </div>
            <div class="item_info flex-column">
                <p class="text-body1 text-primary-dark">Smart Contract Name</p>
                <p class="item_value">{confirmData.messageData.contractName}</p>
            </div>
        </div>
        <div class="item flex-row">
            <div class="item_icon">
                {@html network}
            </div>
            <div class="item_info flex-column">
                <p class="text-body1 text-primary-dark">Network</p>
                <p class="item_value">{confirmData.messageData.network.name}</p>
            </div>
        </div>
    </div>

    <p class="description text-subtitle2">
        {confirmData.messageData.description}
    </p>

    <div class="flex-column">
        <div class="buttons flex-row">
            <Button 
                id={'deny-btn'}
                classes={'button__solid '}
                name="Deny"
                width={'175px'}
                height={'42px'}
                margin={'0 20px 0 0'}
                click={close} />

            <Button 
                id={'info-next-btn'}
                classes={'button__solid button__purple'}
                name="Next"
                width={'175px'}
                height={'42px'}
                click={next} />
        </div>
        <div class="help-link">
            <a class="outside-link" href="www.lamden.io">what are linked accounts?</a>
        </div>   
    </div>
</div>