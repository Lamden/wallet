<script>
    import { getContext } from 'svelte';

    const { switchPage } = getContext('switchPage');

</script>

<h1>Intro</h1>

<h2>Benefits</h2>
<ol>
    <li>Safely store all your cryptocurrency</li>
    <li>Efficiently interact with smart contracts</li>
</ol>

<button on:click={() => switchPage('FirstRunWallet') }> Get Started </button>