<script>
    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Images
    import lamden_logo from '../../img/defaultIcons/lamden_logo_white.png';

    //Props
    export let charmInfo;
    export let dappInfo;
    export let contractName;

    const formats = {
        'number': {default: 0},
        'string': {default: 'None'}
    }

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
    .charm-item > div{
        display: flex;
        align-items: center;
    }
    .charm-item > img{
        width: 60px;
        margin-top: -30px;
    }
    p{ 
        margin: 0;
    }
</style>

<div class="charm-item flex-column">
    {#if iconPath}
        <img src={`${appURL}${iconPath}`} alt="charm item" />
    {:else}
        <img src={lamden_logo} alt="charm item" />
    {/if}
    <p class="text-body1">{charmInfo.name}</p>
    {#await value}
        <div class="text-body2">{defaultValue}</div>
    {:then response}
        <div class="text-body2">{response || defaultValue}</div>
    {/await}
</div>