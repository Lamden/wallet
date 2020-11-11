<script>

    import { getContext } from 'svelte';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Images
    import caution from '../../img/menu_icons/icon_caution.svg';

    //Context
    const { nextPage, back } = getContext('tx_functions');

    //Props
    export let currentPage;
    export let txData;
    export let txDetails;

    $: yourKey = txData.sender.vk


</script>

<style>
.confirm-tx{
    width: 500px;
    background: inherit;
}

.details{
    padding: 1rem 0 1rem 4rem;
    margin-top: 17px;
    margin-left: 2rem;
    border-left: 1px solid var(--font-secondary)
}
.sender-key {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.values{
    align-items: center;
    overflow-wrap: break-word;
    max-height: 100px;
    overflow-y: auto;
    line-height: 1.5;
}

.buttons{
    flex-grow: 1;
    display: flex;
    padding-top: 27px;
    justify-content: center;
    align-items: center;
}

.caution{
    color: var(--font-caution);
}

.caution-icon{
    width: 15px;
    margin-right: 8px;
}

p{
    margin: 0;
}

</style>

<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h2>Confirm Transaction</h2>
        <h3 class="no-bottom-margin">{txData.sender.nickname}</h3>
        <p class="sender-key text-body1 values">{yourKey}</p>
        <div class="details flex-column">
            {#each txDetails as detail}
                <h3 class="detail-name no-bottom-margin">{detail.name}</h3>
                {#if detail.value === ''}
                    <div class="values text-body1 caution flex-row">
                        <div class="caution-icon text-body1" >{@html caution}</div>
                        {'Empty Field'}
                    </div>
                {:else}
                    <div class="values text-body1">
                        {detail.value.__fixed__ ? detail.value.__fixed__ : detail.value}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
    <div class="buttons flex-column">
        <Button 
            id="confirm-tx-btn"
            classes={'button__solid button__primary'} 
            width={'232px'}
            margin={'0 0 17px 0'}
            name="Confirm Transaction" 
            click={() => nextPage()} />
        <Button classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 17px 0'}
            name="Back" 
            click={() => back()} />
    </div>

</div>