<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { setKeys, changeStep, nextPage, cancel } = getContext('functions');

    //DOM nodes
    let formObj;

    //Props
    export let keys;

    let checked = true;

	onMount(() => {
        steps.update(current => {
            current.currentStep = 3;
            return current
        });
        handleChange();
    });

    const nextStep = () => {
        setKeys(keys);
        nextPage();
    }

    const handleChange = () => {
        for (const i in keys.keyList){
            keys.keyList[i].checked = checked;
        }
    }

    
</script>

<style>

.content{
    box-sizing: border-box;
    padding: 0px 24px 0 242px;
    width: 498px;
}

.key-box{
    max-width: 700px;
    margin: 0 auto;
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

.name{
    width: 141px;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    margin-right: 16px;
    display: flex;
    align-items: center;
}

.address{
    display: flex;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
    flex-grow: 1;
    overflow: hidden;
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

.text-box{
    margin-bottom: 158px;
}

a{
    text-decoration: unset;
    color: #ffffff99;
}

p{
    margin: 0;
}
.address > p{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>


<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Password Confirmed</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            Almost there! Now let's select which Accounts you'd like to restore
        </div>
        <div class="flex-column flow-buttons">
            <Button id={'restore-btn'}
                    classes={`button__solid button__purple`}
                    width="100%"
                    styles={'margin-bottom: 16px;'}
                    name="Restore Accounts"
                    click={() => nextStep()} />

            <Button id={'cancel-btn'}
                    width="100%"
                    classes={`button__solid`}
                    styles={'margin-bottom: 16px;'}
                    name="Cancel"
                    click={() => cancel()} />

            <a  class="text-caption text-secondary" 
                href="https://docs.lamden.io/wallet/" 
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
        <div class="flex-row key-row">
            <div class="checkbox-box">
                <label class="chk-container text-body2" id="chk-all">
                    <input  type="checkbox" bind:checked={checked} on:change={handleChange}>
                    <span class="chk-checkmark"></span>
                </label>
            </div>
            <p class="name">{'All Wallets'}</p>
            <p class="address"></p>
        </div>
        {#each keys.keyList as key, i}
            <div class="flex-row key-row">
                <div class="checkbox-box">
                    <label class="chk-container text-body2" id={`chkbox-${i}`}>
                        <input id={`chkbox-${i}`} type="checkbox" bind:checked={keys.keyList[i].checked}>
                        <span class="chk-checkmark"></span>
                    </label>
                </div>
                <div class="flex-column key-info text-body3 ">
                    <p>{`${key.name} (${key.symbol})`}</p>
                    <p class="nickname text-primary-dark">{`${key.nickname}`}</p>
                </div>
                <div id={`div-address-${i}`} class="address">
                    <p>{`${key.vk}`}</p>
                </div>
            </div>
        {/each}
    </div>
</div>