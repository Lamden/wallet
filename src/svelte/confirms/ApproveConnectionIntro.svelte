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
    const next = () => dispatch('nextStep')

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
        font-weight: 100;
        font-size: 1.4em;
        text-align: center;
    }
    .buttons{
        margin-bottom: 0.5rem;
    }
    .help-link{
        text-align: center;
    }
    .item{
        width: 100%;
    }
    .item_icon{
        width: 75px;
        margin: 0 0 0 20%;
    }
    .item_info{
        margin-left: 20px;
        padding-top: 0.5rem;
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
</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: -500, y: 0, opacity: 0.25, easing: quintOut}}">

    <div class="description text-subtitle2">
        {confirmData.messageData.description}
    </div>

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
            <a class="outside-link" href="www.lamden.io">what is this?</a>
        </div>   
    </div>
</div>