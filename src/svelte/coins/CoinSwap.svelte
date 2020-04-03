<script>
    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';

    // Props
    export let coin;
    export let id;


</script>

<style>
.coin-box{
    display: flex;
    flex-direction: row;
    min-height: 63px;
    padding: 12px 0;
    cursor: pointer;
}

.coin-box:hover{
    background-color: var(--bg-color-grey)
}

.text{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.logo{
    display: flex;
    justify-content: center;
}

.name{
	width: 234px;
}

.nickname{
    word-break: break-word;
    margin-right: 20px;
}

.amount{
    padding-left: 15px;
    flex-grow: 1;
    justify-content: center;
}

.percent{
    justify-content: flex-end;
    margin-right: 28px;  
	width: 90px;
}

</style>

<div id={`coin-row-${id}`} class="coin-box">
    <div class="logo flex-column">
            <CryptoLogos {coin} styles={`width: 32px; margin: 0 36px 0 16px;`}/>
    </div>
    <div class="name text text-body1">
        <div class="name-box">
            <div class="text-body1">
                    {`${coin.nickname}`}
            </div>
            <div id={`coin-nickname-${id}`} class="text-body2 text-primary-dark nickname">
                {`${coin.name}`} 
            </div>
        </div>
    </div>
    <div class="amount flex-column">
        <div class="text-body1">{`${balanceStr} ${$currentNetwork.currencySymbol}`}</div>
    </div>
        <div class="percent text text-body1"> {`${percent}`}</div>
</div>


