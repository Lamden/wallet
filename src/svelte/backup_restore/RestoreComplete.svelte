<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { Button } = Components;

    //Images
    import errorIcon from '../../img/menu_icons/icon_error-circle.svg';

    //Context
    const { switchPage } = getContext('app_functions');
    const { setKeys, changeStep, nextPage } = getContext('functions');

    //Props
    export let keys;
    export let restore = false;

    let selectAll = false;

    
</script>

<style>

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

.result-box{
    height: 88px;
    border-bottom: 1px dashed var(--divider-dark);
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
    border-bottom: 1px dashed var(--divider-dark);
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

p{
    margin: 0;
}

.error-icon{
    margin-right: 35px;
    width: 22px;
    min-width: 22px;
}
.btns{
    margin-top: 1.5rem;
}
</style>

<LeftSideFullPage title={`Wallets Restored`} helpLink={'/wallet/restore_overview'}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            You've added the following accounts succesfully! You may now perform transactions using these addresses.
        </div>
    </div>
<div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
    <div class="flex-column">
        <div>
            <div class="flex-row header text-subtitle2 text-primary">
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
                                <p class="nickname text-secondary">{`${key.nickname}`}</p>
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
                                <p class="nickname text-secondary">{`${key.nickname}`}</p>
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
        <div class="flex-column flow-buttons flex-align-center btns">
            <Button id={'home-btn'}
                    classes={`button__solid button__primary`}
                    styles={'margin-bottom: 16px;'}
                    name={restore ? "Finish" : "Back to Home"}
                    disabled={false}
                    width={"347px"}
                    click={() => {
                        if (restore) {
                            nextPage()
                        } else {
                            switchPage('CoinsMain')
                        }
                    }} />
        </div>
    </div>
</div>
</LeftSideFullPage>