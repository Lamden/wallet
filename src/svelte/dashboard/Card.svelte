
<script>
    export let cardInfo;
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
    font-size: var(--text-body2);
    letter-spacing: 0.25px;
    font-weight: 500;
    line-height: 20px;
}
span{
    font-size: var(--text-h1);
}

@media screen and (max-width: 528px) {
    .card{
        width: 100%;
        min-width: unset;
    }
}

</style>

<div class="card">
    <div class="content">
        <div class="logo" >{@html logo}</div>
        <div>
            <div class="text-body2 text-secondary">{cardInfo.name}</div>
            {#if Array.isArray(cardInfo.desc)}
                {#each cardInfo.desc as t}
                    <li class="link" on:click={() => openLink(t.url) }>{t.name}</li>
                {/each}
            {:else}
                <span class="no-margin">{cardInfo.desc}</span>
            {/if}
        </div>
    </div>
</div>