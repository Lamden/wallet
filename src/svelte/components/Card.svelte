
<script>
    //Images
    import doco from '../../img/menu_icons/icon_doco.svg';

    export let cardInfo;
    export let width = 'unset';
    export let noPic = false;

    const openLink = (url) => {
        window.open(url, '_blank');
    }

</script>

<style>
.box-link{
    cursor: pointer;
}

.card{
    display: flex;
    flex-direction: column;
    margin-right: 20px;
    margin-bottom: 20px;
    min-width: 23%;
    border: 1px solid transparent;
}

.card:hover{
    border: 1px solid var(--accent-color);
    filter: brightness(125%);
}

.image{
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 4px 4px 0 0;
    height: 232px;
}

.content{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 76px;
    background: var(--bg-secondary);
    border-radius: 0px 0px 4px 4px;
    padding: 16px 16px 16px 23px;
}

.logo{
    margin-right: 20px;
    width: 32px;
}
</style>

<div class="card box-link" style={`width: ${width};`} on:click={() => openLink(cardInfo.url) }>
    {#if !noPic}
        <div 
            class="image" 
            style="background-image: url({cardInfo.image});">
        </div>
    {/if}
    <div class="content">
        <div class="logo" >{@html doco}</div>
        <div>
            <h6 class="no-margin">{cardInfo.name}</h6>
            <div class="text-body2 text-secondary">{cardInfo.desc}</div>
        </div>
    </div>
</div>