<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
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
            current.currentStep = 4;
            return current
        });   
    });

    const done = () => {
        if (restore) changeStep(7);
        else switchPage('CoinsMain');
    }
    
</script>

<style>

.key-box{
    margin: 0 auto;
    max-width: 820px;
}

.header{
    margin-left: 53px;
    border-bottom: 2px solid var(--font-primary-darker);
    width: calc(100% - 53px);
}

.header-name{
    width: 157px;
}

.header-address{
    flex-grow: 1;
}

.result-box{
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    flex-grow: 1;
    padding-right: 20px;
    justify-content: center;
    overflow: hidden;
    line-height: 1.4;
}

.result-box > p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

.key-info{
    display: flex;
    width: 141px;
    height: 88px;
    margin-right: 16px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
    word-break: break-all;
    justify-content: center;
    align-items: flex-start;
    min-width: 143px;
    line-height: 1.4;
}

.checkbox-box{
    margin-right: 53px;
}

.chk-container{
    padding-left: 0;
    margin-bottom: 0;
}

.chk-checkmark{
    top: -13px;
}


a{
    text-decoration: unset;
    color: #ffffff99;
}

p{
    margin: 0;
}

.error-icon{
    margin-right: 35px;
    width: 22px;
    min-width: 22px;
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Wallets Restored</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            You've added the following wallets succesfully! You may now perform transactions using these addresses.
        </div>
        <div class="flex-column flow-buttons">
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
    </div>
    <div class="flow-content-right key-box" in:fade="{{delay: 0, duration: 200}}">
        <div class="flex-row header text-subtitle2 text-primary-light">
            <p class="header-name">{'Name'}</p>
            <p class="header-address">{'Address'}</p>
        </div>
        {#if keys.error}
            <div class="flex-row key-row">
                <div class="error-icon">
                    {@html errorIcon}
                </div>
                <p class="text-red text-body2">{keys.error}</p>
            </div>
        {:else}
            {#each keys.keyList as key, i}
                {#if key.result.added}
                    <div class="flex-row key-row">
                        <div class="checkbox-box">
                            <label class="chk-container">
                                <input type="checkbox" bind:checked={keys.keyList[i].checked} on:click|preventDefault>
                                <span class="chk-checkmark"></span>
                            </label>
                        </div>
                        <div class="flex-column key-info text-body3 ">
                            <p>{`${key.name} (${key.symbol})`}</p>
                            <p class="nickname text-primary-dark">{`${key.nickname}`}</p>
                        </div>
                        <div class="flex-column result-box text-body3 text-secondary">
                            <p>{`${key.vk}`}</p>
                            <p class="message">{key.result.reason}</p>
                        </div>
                    </div>
                {:else}
                    <div class="flex-row key-row">
                        <div class="error-icon">
                            {@html errorIcon}
                        </div>
                        <div class="flex-column key-info text-body3 ">
                            <p>{`${key.name} (${key.symbol})`}</p>
                            <p class="nickname text-primary-dark">{`${key.nickname}`}</p>
                        </div>
                        <div class="flex-column result-box text-body3 text-secondary">
                            <p>{key.vk}</p>
                            <p class="error">{key.result.reason}</p>
                        </div>
                    </div>
                {/if}
            {/each}
        {/if}
    </div>
</div>