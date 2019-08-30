<script>
    export let switchPage;
</script>
<h1> LAMDEN </h1>

<p>Creating a wallet is easy and secure. It's stored in the user’s browser, not on remote servers.</p>

<button on:click={() => switchPage('FirstRunCreatePW')}> Create a Wallet </button>
<button on:click={() => switchPage('FirstRunRestore')}> Restore a Wallet </button>

<a href="https://www.lamden.io" target="_blank" rel="noopener noreferrer" >learn more about lamden</a>