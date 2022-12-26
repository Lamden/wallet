
<script>
    export let cardInfo;
    export let width = 'unset';
    export let logo;

    const openLink = (url) => {
        window.open(url, '_blank');
    }

</script>

<style>
.link{
    cursor: pointer;
}
.link:hover {
    color: var(--font-accent);
}

.card{
    display: flex;
    flex-direction: column;
    margin-right: 40px;
    margin-bottom: 20px;
    min-width: 16%;
    border: 1px solid transparent;
}

.content{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 76px;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 16px 16px 16px 23px;
}

.logo{
    margin-right: 20px;
    width: 32px;
}

li{
    font-size: 14px;
    letter-spacing: 0.25px;
    font-weight: 500;
    line-height: 20px;
}

</style>

<div class="card" style={`width: ${width};`}>
    <div class="content">
        <div class="logo" >{@html logo}</div>
        <div>
            <div class="text-body2 text-secondary">{cardInfo.name}</div>
            {#if Array.isArray(cardInfo.desc)}
                {#each cardInfo.desc as t}
                    <li class="link" on:click={() => openLink(cardInfo.url) }>{t.name}</li>
                {/each}
            {:else}
                <h6 class="no-margin">{cardInfo.desc}</h6>
            {/if}
        </div>
    </div>
</div>