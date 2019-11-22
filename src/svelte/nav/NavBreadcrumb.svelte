<script>
    import { menuIcons } from '../../js/images.js';

    export let name;
    export let last;
</script>

<style>
.box{
    display: flex;
    align-items: center;
    text-align: center;
    width: 180px;
    
}

.words {
    width: 100%;
}

.arrow {
    width: 12px;
    min-height: 17px;
    margin-left: 18px;
}

.last{
    border-bottom: 4px solid white;
}
</style>

<div class="box" class:last={last}>
    {#if last}
        <img class="arrow" src={menuIcons.arrowRight} alt="right arrow" />
    {/if}
    <h2 class="words"> {name} </h2>
</div>