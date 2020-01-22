
<script>
    //Images
    import { icons } from '../../js/images.js';
    const { doco } = icons;

    export let cardInfo;
    export let width = 'unset';

    function openLink(url){
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
}

.image{
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 4px;
    height: 232px;
}

.content{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 76px;
    background: #272727;
    border-radius: 0px 0px 4px 4px;
    padding: 16px 16px 16px 23px;
}

.logo{
    margin-right: 20px;
    width: 32px;
}
</style>

<div class="card box-link" style={`width: ${width};`} on:click={() => openLink(cardInfo.url) }>
    <div 
        class="image" 
        style="background-image: url({cardInfo.image});">
    </div>
    <div class="content">
        <div class="logo" >{@html doco}</div>
        <div>
            <h6 class="no-margin">{cardInfo.name}</h6>
            <div class="text-body2 text-primary-dark">{cardInfo.desc}</div>
        </div>
    </div>
</div>