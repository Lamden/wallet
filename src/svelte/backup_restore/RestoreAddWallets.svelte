<script>
    import whitelabel from '../../../whitelabel.json'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { setKeys, changeStep, nextPage, back, getSelectedType  } = getContext('functions');

    //DOM nodes
    let formObj;

    //Props
    export let keys;

    let checked = true;
    let consent = false;
    let restoreType = getSelectedType? getSelectedType() : 999;
    
    $: numOfCheckedAccounts = 0
    $: btnDisable = numOfCheckedAccounts === 0 || restoreType === 3? !consent : false

	onMount(() => {
        handleChange();
        numOfCheckedAccounts = keys.keyList.filter(f => f.checked).length
    });

    const nextStep = () => {
        setKeys(keys);
        nextPage();
    }

    const handleChange = () => {
        for (const i in keys.keyList){
            keys.keyList[i].checked = keyIsWatchOnly(keys.keyList[i].sk) ? false : true
        }
        numOfCheckedAccounts = keys.keyList.filter(f => f.checked).length
        let numOfWatchedOnlyAccounts = keys.keyList.filter(f => keyIsWatchOnly(f.sk)).length
        let totalGoodAccounts = keys.keyList.length - numOfWatchedOnlyAccounts

        if (numOfCheckedAccounts === 0 || numOfCheckedAccounts !==  totalGoodAccounts) checked = false
    }

    const handleChangeOne = () => {
        numOfCheckedAccounts = keys.keyList.filter(f => f.checked).length
        let numOfWatchedOnlyAccounts = keys.keyList.filter(f => keyIsWatchOnly(f.sk)).length
        let totalGoodAccounts = keys.keyList.length - numOfWatchedOnlyAccounts

        if (numOfCheckedAccounts !==  totalGoodAccounts) checked = false
    }

    const keyIsWatchOnly = (sk) => sk.includes('watchOnly')

    
</script>

<style>


.key-box{
    max-width: 700px;
    margin: 0 auto;
}

.header{
    margin-left: 53px;
    border-bottom: 2px solid var(--divider-light);
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
    border-bottom: 1px dashed var(--divider-dark);
    margin-right: 16px;
    display: flex;
    align-items: center;
}

.address{
    display: flex;
    height: 88px;
    border-bottom: 1px dashed var(--divider-dark);
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
    border-bottom: 1px dashed var(--divider-dark);
    align-items: center;
    word-break: break-all;
    justify-content: center;
    align-items: flex-start;
    min-width: 143px;
}

.checkbox-box{
    margin-right: 53px;
}

.checkbox-box .chk-container{
    padding-left: 0;
    margin-bottom: 0;
}

.checkbox-box .chk-checkmark{
    top: -13px;
}


p{
    margin: 0;
}
.address > p{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.btns{
    margin-top: 2rem;
}
.box{
    width: 347px;
    margin-top: 1rem;
}
.checkbox-text{
    font-size: 16px;
}
</style>

<LeftSideFullPage title={`Add Accounts`} helpLink={'https://docs.lamden.io/docs/wallet/restore_overview'}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Almost there! Now let's select which Accounts you'd like to restore.
        </div>
    </div>
<div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
    <div class="flex-column flex-align-center">
        <h6>Add Accounts</h6>
        
        <div>
            <div class="flex-row header text-subtitle2 text-primary">
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
                <p class="name">{'All Account'}</p>
                <p class="address"></p>
            </div>
            {#each keys.keyList as key, i}
                <div class="flex-row key-row">
                    <div class="checkbox-box">
                        <label class="chk-container text-body2" id={`chkbox-${i}`}>
                            <input id={`chkbox-${i}`} type="checkbox" bind:checked={keys.keyList[i].checked} disabled={keyIsWatchOnly(key.sk)} on:change={handleChangeOne}>
                            <span class="chk-checkmark"></span>
                        </label>
                    </div>
                    <div class="flex-column key-info text-body3 ">
                        <p>{`${key.name} (${key.symbol})`}</p>
                        <p class="nickname text-secondary">{`${key.nickname}`}</p>
                    </div>
                    <div id={`div-address-${i}`} class="flex flex-column flex-align-start flex-just-center address">
                        <p>{`${key.vk}`}</p>
                        {#if keyIsWatchOnly(key.sk)}
                            <p class="text-warning">{'No Private key found for this account'}</p>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
        {#if restoreType === 3}
            <div class="box">
                <label class="chk-container text-body2 checkbox-text">
                    This account will be added as a Legacy Account and will not be covered under your Lamden Vault Recovery Phrase.
                    <input type="checkbox" bind:checked={consent}>
                    <span class="chk-checkmark mark"></span>
                </label>
            </div>
        {/if}
        <div class="flex-column flow-buttons flex-align-center btns">
            <Button id={'restore-btn'}
                    classes={`button__solid button__primary`}
                    width="347px"
                    styles={'margin-bottom: 16px;'}
                    name="Restore Accounts"
                    click={() => nextStep()} 
                    disabled={btnDisable} />

            <Button id={'back-btn'}
                    width="347px"
                    classes={`button__solid`}
                    styles={'margin-bottom: 16px;'}
                    name="Back"
                    click={() => back()} />
        </div>
    </div>
</div>
</LeftSideFullPage>