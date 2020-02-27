<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Images
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg';
    import errorIcon from '../../img/menu_icons/icon_error.svg';

    //Context
    const { switchPage } = getContext('app_functions');
    const { setKeys, changeStep } = getContext('functions');

    //Props
    export let keys;
    export let restore = false;

    let selectAll = false;

    $: buttonName = restore ? "Complete Restore" : "Back To Home";

	onMount(() => {
        steps.update(current => {
            current.currentStep = 5;
            return current
        });   
    });

    function done(){
        if (restore) changeStep(7);
        else switchPage('CoinsMain');
    }
    
</script>

<style>
.restore-complete{
    flex-grow:1;
    padding-top: 156px;
}

.content{
    box-sizing: border-box;
    padding: 0px 24px 0 242px;
    width: 498px;
    justify-content: center;
}

.spacer{
    flex-grow: 1;
    max-width: 314px;
}

.header{
    margin-left: 53px;
    border-bottom: 2px solid var(--font-primary-darker);
}

.header-name{
    width: 157px;
}

.header-address{
    flex-grow: 1;
}

.name{
    display: flex;
    width: 141px;
    height: 88px;
    margin-right: 16px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
}

.result-box{
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    flex-grow: 1;
    padding-right: 20px;
    justify-content: center;
}

.error{
    color: red;
}

.message{
    color: green;
}


.key-row{
    align-items: center;
}

.checkbox-box{
    margin-right: 35px;
    height: 18px;
}

.text-box{
    margin-bottom: 158px;
}

a{
    text-decoration: unset;
    color: #ffffff99;
}

input[type=checkbox].css-checkbox {
    position:absolute; 
    z-index:-1000; 
    left:-1000px; 
    overflow: hidden; 
    clip: rect(0 0 0 0); 
    height:1px; 
    width:1px; 
    margin:-1px; 
    padding:0; 
    border:0;
}

input[type=checkbox].css-checkbox + label.css-label {
    display: block;
    background-repeat: no-repeat;
    background-size: cover;
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    background-size: 16px;
    border-radius: 3px;
    background-position: center;
    
}

label.css-label {
    background-image:url('./icon_checkmark-white.svg');
    background-color: var(--primary-color);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

input[type=checkbox].css-checkbox + label.css-label-error {
    display: block;
    background-repeat: no-repeat;
    background-size: cover;
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    background-size: 16px;
    border-radius: 3px;
    background-position: center;
    
}

label.css-label-error {
    background-image:url('./icon_error.svg');
    background-color: var(--bg-color);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.checkmark-icon{
    position: relative;
    top: -14px;
    width: 14px;
    right: -2px;
}

.error-icon{
    margin-right: 35px;
    width: 18px;
    height: 18px;
}

</style>

<div class="restore-complete flex-row">
    <div class="flex-column content">
        <h6>Wallets Restored</h6>
    
        <div class="text-box text-body1 text-primary">
            You've added the following wallets succesfully! You may now perform transactions using these addresses.
        </div>

        <Button id={'home-btn'}
                classes={`button__solid button__purple`}
                styles={'margin-bottom: 16px;'}
                name={restore ? "Finish" : "Back to Home"}
                disabled={false}
                click={() => done()} />

        <a  class="text-caption text-secondary" 
            href="https://www.lamden.io" 
            target="_blank" 
            rel="noopener noreferrer" >
            Help & FAQ
        </a>
    </div>
    <div class="spacer"></div>
    <div class="flex-column">
        <div class="flex-row header text-subtitle2 text-primary-light">
            <div class="header-name">{'Name'}</div>
            <div class="header-address">{'Address'}</div>
        </div>
        {#each keys.keyList as key, i}
            {#if key.message}
                <div class="flex-row key-row">
                    <div class="checkbox-box">
                        <input type="checkbox" class="css-checkbox" bind:checked={keys.keyList[i].checked} class:added={key.added}>
                        <label class="css-label"></label>
                        <div class="checkmark-icon">{@html checkmarkWhite}</div>
                    </div>
                    <div class="name">{`${key.name}`}</div>
                    <div class="flex-column result-box text-subtitle1 text-primary-dark">
                        <div>{`${key.vk}`}</div>
                        <div class="message">{key.message}</div>
                    </div>
                    
                </div>
            {/if}
            {#if key.error}
                <div class="flex-row key-row">
                    <div class="error-icon">
                        {@html errorIcon}
                    </div>
                    <div class="name">{`${key.name}`}</div>
                    <div class="flex-column result-box text-subtitle1 text-primary-dark ">
                        <div>{key.vk}</div>
                        <div class="error">{key.error}</div>
                    </div>
                    
                </div>
            {/if}
        {/each}
    </div>

</div>