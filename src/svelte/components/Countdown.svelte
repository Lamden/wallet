<script>
    import { onMount, beforeUpdate, onDestroy } from 'svelte'
    import { blur } from 'svelte/transition';

    //Stores
    import { SettingsStore, NetworksStore, currentNetwork } from '../../js/stores/stores.js';

    let days = 0;
    let hours = 0;
    let minutes =  0;
    let seconds = 0;

    $: launchDate = new Date($SettingsStore.mainnetLaunch.launchDate);
    $: launched = undefined;

    onMount(() => {
        timeBetween();
    })

    beforeUpdate(()=>{
        if (launched){
            if (!$SettingsStore.mainnetLaunch.switched) NetworksStore.setCurrentNetwork(NetworksStore.mainnetNetwork)
        }
    })

    onDestroy(() => clearInterval(timerId))

    const timeBetween = () => {
        let dateDiff = launchDate - new Date();
        if (dateDiff < 0) {
            clearInterval(timerId);
            launched = true;
            return;
        }
        if (typeof launched === 'undefined') launched = false;
        days = Math.floor(dateDiff / 1000 / 60/ 60 / 24)
        hours = Math.floor((dateDiff - (days * 24 * 60 * 60 * 1000)) / 1000 / 60 / 60)
        minutes = Math.floor((dateDiff - (days * 24 * 60 * 60 * 1000) - (hours * 60 * 60 * 1000)) / 1000 / 60)
        seconds = Math.floor((dateDiff - (days * 24 * 60 * 60 * 1000) - (hours * 60 * 60 * 1000) - (minutes * 60 * 1000)) / 1000)
    }

    let timerId = setInterval(timeBetween, 1000)

    const handleNetworkChange = () => {
        NetworksStore.setCurrentNetwork(NetworksStore.mainnetNetwork)
    }
</script>

<style>
    .container{
        position: absolute;
        box-sizing: border-box;
        bottom: 40px;
        right: 40px;

        display: grid;
        width: 234px;
        grid-template-columns: 21% 21% 31% 27%;
        grid-template-rows: 20px 20px;
        
    }
    .container > p {
        margin: auto;
    }
    h2{
        position: absolute;
        bottom: 85px;
        right: 40px;
        margin: 0;
        color: var(--font-accent);
        font-weight: 400;
    }
    .text-body2{
        font-weight: 200;
    }
    h2.underline{
        text-decoration: underline;
        cursor: pointer;
        font-size: 1.6em;
        color: var(--font-warning);
        bottom: 54px;
    }
</style>

{#if NetworksStore.mainnetLaunched() && $currentNetwork.type !== 'mainnet'}
    <h2 class="underline" on:click={handleNetworkChange}>SWITCH TO MAINNET</h2>
{:else}
    {#if !launched && !NetworksStore.mainnetLaunched()}
        <h2 in:blur="{{duration: 1000, amount: 25}}">MAINNET LAUNCH</h2>
        <div class="container" in:blur="{{duration: 1000, amount: 25}}">
            <p class="text-body2">Days</p>
            <p class="text-body2">Hours</p>
            <p class="text-body2">Minutes</p>
            <p class="text-body2">Seconds</p>
            <p class="text-body3">{days}</p>
            <p class="text-body3">{hours}</p>
            <p class="text-body3">{minutes}</p>
            <p class="text-body3">{seconds}</p>
        </div>
    {/if}
{/if}
