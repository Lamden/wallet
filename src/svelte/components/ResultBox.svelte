<script>
    //Components
    import { Components } from '../../js/router.js';
    const { Button } = Components;

    //Images
    import { icons } from '../../js/images.js';
    const { errorCircle, successCircle, warning } = icons;

    //Props
    export let result;

    let typeIcons = {
        'error': errorCircle,
        warning,
        'success': successCircle
    }

    $: icon = typeIcons[result.type]
    $: stateInfo = result.stateInfo ? Object.keys(result.stateInfo).map(i => {
            let iSplit = i.split(':');
            let info = {}
            info.contractName =  iSplit[0]
            info.variableName = iSplit[1]
            info.keyName = iSplit[2]
            info.value = result.stateInfo[i]
            return info
        }) : undefined;
    $: errorInfo = result.errorInfo ? result.errorInfo : undefined;
    $: returnValue = () => {
        if (!result.returnValue) return null;
        if (!Array.isArray(result.returnValue)) return [result.returnValue]
        return result.returnValue;
    }

</script>

<style>
.results-box{
    align-items: center;   
    max-width: 800px; 
}

.icon{
    margin-right: 10px;
    width: 20px;
    height: 20px;
}

.buttons{
    padding: 65px 0 25px;
}

.message{
    align-items: center;
    padding-top: 2rem;
}
.state-info{
    width: 100%;
    overflow-wrap: break-word;
}
.error-info{
    width: 100%; 
    overflow-wrap: break-word;       
}
.title{
    margin-right: 10px;
}
.return-value{
    width: 100%;
}
.value-row{
    margin-bottom: 20px;
    max-height: 100px;
    overflow-y: auto;
}
</style>

<div class="results-box flex-column">
    <h5 id={'results-title'}>{result.title}</h5> 

    <div id={'results-subtitle'} class="text-body1">{result.subtitle}</div>

    <div class="message flex-row">
        <img class="icon" src={icon} alt={`${result.type} icon`} />
        <h6 id={'results-message'}>{result.message}</h6>
    </div>

    {#if result.returnValue}
        <div class="flex-column return-value ">
            <h6>Return Value</h6>
            {#each returnValue() as value}
                <div class="text-body1 text-primary-dark">{value}</div>
            {/each}
        </div>
    {/if}

    {#if stateInfo}
        <div class="state-info text-body1 flex-column">
            <h6>New State</h6>
            {#each stateInfo as detail}
                <div class="flex-row">
                    <div class="title">{`contract: `}</div>
                    <div class="text-primary-dark">{detail.contractName}</div>
                </div>
                <div class="flex-row">
                    <div class="title">{`variable: `}</div>
                    <div class="text-primary-dark">
                        {detail.variableName}
                    </div>
                </div>
                <div class="flex-row">
                    <div class="title">{`key: `}</div>
                    <div class="text-primary-dark">
                        {detail.keyName}
                    </div>
                </div>
                <div class="flex-column value-row">
                    <div>{`new value: `}</div>
                    <div class="text-primary-dark">
                        {detail.value}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
    {#if errorInfo}
        <div class="error-info text-body1 flex-column">
            <h6>Error Info</h6>
            <div class="flex-column">
                {#each errorInfo as error}
                    <div class="error">{error}</div>  
                {/each}
            </div>
        </div>
    {/if}
    <div class="buttons flex-row">
        {#each result.buttons as button, index}
            <Button
                id={button.id} 
                classes={button.class} 
                width={button.width ? button.width : '232px'}
                margin={button.margin ? button.margin : '0 7px'}
                name={button.name}
                click={button.click} />
        {/each}
    </div>
</div>