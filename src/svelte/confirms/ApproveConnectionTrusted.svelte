<script>
    import { getContext } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'

    //Icons
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'

	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Context
    const { openNewTab, setTrusted } = getContext('confirm_functions');

    export let confirmData;

    let trusted = true;

    const set = () => {
        setTrusted(trusted)
        next();
    }

    const next = () => dispatch('nextStep')
    const back = () => dispatch('back')
</script>


<style>
    .detail{
        align-items: center;
        flex-grow: 1;
        justify-content: space-between;
        padding-top: 2rem;
    }
    .padding{
        flex-grow: 1;
        justify-content: space-evenly;
        padding: 0 2rem;
    }
    .icon{
        width: 75px;
    }
    .buttons{
        margin-bottom: 0.5rem;
    }
    .help-link{
        text-align: center;
    }
    p{
        font-size: 1.1em;
        align-self: flex-start;
        margin: 0.25rem 0;
        line-height: 1.4;
    }
    p.text{
        font-size: 1.2em;
    }
    strong{
        text-decoration: underline;
        font-weight: 400;
    }
    .buttons{
        padding: 1rem 0;
    }
    label{
        align-self: flex-start;
    }
</style>
<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: -500, y: 0, opacity: 0.25, easing: quintOut}}">

    <div class="icon" >
        {@html verified_app}
    </div>
    <div class="flex-column padding">
        <p class="text">If you set <strong>{confirmData.messageData.appName}</strong> as a Trusted App you will not get popups to approve transactions.
        </p>
    
        <label>
            <input id="trusted" type=radio bind:group={trusted} value={true}>
            Trusted App - Transactions from {confirmData.messageData.appName} are approved automatically
        </label>

        <label >
            <input id="not-trusted" type=radio bind:group={trusted} value={false}>
            Not Trusted - Manually approve all transactions
        </label>

        <p class="text-primary-dark">You can adjust this option later in the account's settings.</p>
    </div>

    <div class="flex-column">
        <div class="buttons flex-row">
            <Button 
                id={'trusted-back-btn'}
                classes={'button__solid '}
                name="Back"
                width={'175px'}
                height={'42px'}
                margin={'0 20px 0 0'}
                click={back} />

            <Button 
                id={'trusted-next-btn'}
                classes={'button__solid button__purple'}
                name="Approve App"
                width={'175px'}
                height={'42px'}
                click={set} />
        </div>
        <div class="help-link">
            <a class="outside-link" href="www.lamden.io">learn more about trusted apps</a>
        </div>  
    </div>
</div>    