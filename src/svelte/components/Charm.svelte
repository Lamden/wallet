<script>
    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Images
    import charm_default from '../../img/misc/charm_default.svg';

    //Props
    export let charmInfo;
    export let dappInfo;
    export let contractName;


    const formats = {
        'number': {default: 0},
        'string': {default: 'None'}
    }

    let brokenCharmLogo = false

    $: vk = dappInfo.vk;
    $: appURL = dappInfo.url;
    $: value = getItemValue(charmInfo)
    $: format = charmInfo.formatAs || 'number'
    $: defaultValue = formats[format].default
    $: iconPath = charmInfo.iconPath || false
    

    

    const getItemValue = async (info) => {
        let key = ''
        if (typeof info.key !== 'undefined' && typeof info.key === 'string'){
            key = info.key.replace("<wallet vk>", vk)
        }
        let response = await $currentNetwork.API.getVariable(contractName, info.variableName, key)
        return response
    }
</script>

<style>
    .charm-item{
        background: var(--bg-color-grey);
        border: 1px solid rgba(38, 38, 38, 0.64);
        width: fit-content;
        margin: 1rem;
        padding: 15px 40px;
        max-width: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: fit-content;
        border-radius: 4px;
    }
    .charm-icon{
        width: 60px;
        margin: -30px auto 0;        
    }
    p.text-body2{
        margin: 0;
    }
</style>

<div class="charm-item flex-column">
    {#if iconPath}
        {#if !brokenCharmLogo}
            <img class="charm-icon" src={`${appURL}${iconPath}`} alt="charm item" on:error={() => brokenCharmLogo = true}/>
        {:else}
            <div class="charm-icon">{@html charm_default}</div>
        {/if}
        
    {:else}
        <div class="charm-icon">{@html charm_default}</div>
    {/if}
    <p class="text-body1">{charmInfo.name}</p>
    {#await value}
        <p class="text-body2">{defaultValue}</p>
    {:then response}
        <p class="text-body2">{response || defaultValue}</p>
    {/await}
</div>