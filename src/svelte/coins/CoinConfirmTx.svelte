<script>

    import { getContext } from 'svelte';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Images
    import warning from '../../img/menu_icons/icon_warning.svg';

    //Context
    const { nextPage, back } = getContext('tx_functions');

    //Props
    export let currentPage;
    export let txData;
    export let txDetails;

    $: yourKey = `${txData.sender.nickname} - ${txData.sender.vk.substring(0, 45 - txData.sender.nickname.length)}...`


</script>

<style>
.confirm-tx{
    width: 572px;
    
}

.content{
    padding-left: 55px;
}

.details{
    padding: 5px 0 57px 76px;
    margin-top: 17px;
    margin-left: 50px;
    border-left: 1px solid var(--font-primary-darker)
}

.values{
    align-items: center;
    overflow-wrap: break-word;
    max-height: 100px;
    overflow-y: auto;
}


.buttons{
    flex-grow: 1;
    display: flex;
    padding-top: 27px;
    justify-content: center;
    align-items: center;
}

.warning{
    color: orange
}

.warning-icon{
    margin-right: 8px;
    position: relative;
    top: -1px;
}
</style>

<div class="confirm-tx flex-column">
    <div class="content flex-column">
        <h5>Confirm Transaction</h5>
        <h4 class="no-bottom-margin">Your Public Key</h4>
        <div id="sender-key" class="values text-body1 values">{yourKey}</div>
        <div class="details flex-column">
            {#each txDetails as detail}
                <h4 class="detail-name no-bottom-margin">{detail.name}</h4>
                {#if detail.value === ''}
                    <div class="values text-body1 warning flex-row">
                        <div class="warning-icon text-body1" >{@html warning}</div>
                        {'Empty Field'}
                    </div>
                {:else}
                    <div class="values text-body1">
                        {detail.name.includes('fixedPoint') ? parseFloat(detail.value).toFixed(8).toString() : detail.value}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
    <div class="buttons flex-column">
        <Button 
            id="confirm-tx-btn"
            classes={'button__solid button__purple'} 
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