<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

    //Images
    import { icons } from '../../js/images.js';
    const { checkmarkWhite } = icons;

    //Context
    const { switchPage } = getContext('switchPage');
    const { setKeys, changeStep } = getContext('functions');

    //Props
    export let keys;
    export let restore = false;

    let selectAll = false;

	onMount(() => {
        steps.update(current => {
            current.currentStep = restore ? 5 : 4;
            return current
        });   
    });

    function done(){
        if (restore) changeStep(7);
        else switchPage('CoinsMain');
    }
    
</script>

<style>
.page{
    display: flex;
    flex-direction: row;
    flex-grow:1;
    padding-top: 156px;
}

.content{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 0px 24px 0 242px;
    width: 498px;
}

.spacer{
    flex-grow: 1;
    max-width: 314px;
}

.keys{
    display: flex;
    flex-direction: column;
}

.header{
    display: flex;
    flex-direction: row;
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

.address-box{
    display: flex;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
    flex-grow: 1;
}

.address-error-box{
    display: flex;
    flex-direction: column;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    flex-grow: 1;
    justify-content: center;
}

.address{
    margin-top: 12px;
}

.error{
    color: red;
}

.key-row{
    display: flex;
    flex-direction: row;
    align-items: center;
}

.checkbox-box{
    margin-right: 35px;
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
    background-image:url('./icon_checkmark_white.svg');
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

</style>

<div class="page">
    <div class="content">
        <h6>Wallets Restored</h6>
    
        <div class="text-box text-body1 text-primary">
            You've added the following wallets succesfully! You may now perform transactions using these addresses.
        </div>

        <Button style={`button__solid button__purple`}
                height={'36px'}
                styles={'margin-bottom: 16px;'}
                name="Back to Home"
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
    <div class="keys">
        <div class="header text-subtitle2 text-primary-light">
            <div class="header-name">{'Name'}</div>
            <div class="header-address">{'Address'}</div>
        </div>
        {#each keys.keyList as key, i}
            {#if key.added}
            <div class="key-row">
                <div class="checkbox-box">
                    <input type="checkbox" class="css-checkbox" bind:checked={keys.keyList[i].checked} class:added={key.added}>
                    <label class="css-label"></label>
                </div>
                <div class="name">{`${key.name}`}</div>
                <div class="address-box text-subtitle1 text-primary-dark">{`${key.vk}`}</div>
            </div>
            {/if}
            {#if key.error}
            <div class="key-row">
                <div class="checkbox-box">
                    <input type="checkbox" class="css-checkbox" bind:checked={keys.keyList[i].checked} class:added={key.added}>
                    <label class="css-label-error"></label>
                </div>
                <div class="name">{`${key.name}`}</div>
                <div class="address-error-box text-subtitle1 text-primary-dark ">
                    <div class="address">{key.vk}</div>
                    <div class="error">{key.error}</div>
                </div>
                
            </div>
            {/if}
        {/each}
    </div>

</div>