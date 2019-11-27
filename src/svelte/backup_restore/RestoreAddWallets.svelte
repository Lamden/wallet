<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

    //Context
    const { setKeys, changeStep } = getContext('functions');

    //DOM nodes
    let formObj;

    //Props
    export let keys;

    let selectAll = false;

	onMount(() => {
        steps.update(current => {
            current.currentStep = 3;
            return current
        });
    });

    function nextPage(){
        setKeys(keys);
        changeStep(4);
    }

    function selectAllKeys(ev){
        if (ev.target.checked){
            for (const i in keys.keyList){
                keys.keyList[i].checked = true;
            }
        }
    }
    
</script>

<style>
.page{
    display: flex;
    flex-direction: row;
    flex-grow:1;
    padding-top: 156px;
}

.content{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 0px 24px 0 242px;
    width: 498px;
}

.spacer{
    flex-grow: 1;
    max-width: 314px;
}

.keys{
    display: flex;
    flex-direction: column;
}

.heading{
    margin-bottom: 16px;
}

.header{
    display: flex;
    flex-direction: row;
    margin-left: 53px;
    border-bottom: 2px solid var(--font-primary-darker);
}

.header-name{
    width: 157px;
}

.header-address{
    flex-grow: 1;
}

.name{
    display: flex;
    width: 141px;
    height: 88px;
    margin-right: 16px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
}

.address{
    display: flex;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
    flex-grow: 1;
}

.key-row{
    display: flex;
    flex-direction: row;
    align-items: center;
}

.checkbox-box{
    margin-right: 35px;
}

.text-box{
    margin-bottom: 158px;
}

a{
    text-decoration: unset;
    color: #ffffff99;
}

input[type="checkbox"]{
    width: 18px;
    height: 18px;
    background: #DADADA;
}

</style>

<div class="page">
    <div class="content">
        <h6 class="heading">Password Confirmed</h6>
    
        <div class="text-box text-body1 text-primary">
            Almost there! Now let's select which wallets you'd like to restore
        </div>

        <Button style={`button__solid button__purple`}
                height={'36px'}
                styles={'margin-bottom: 16px;'}
                name="Restore Wallets"
                disabled={false}
                click={() => nextPage()} />

        <a  class="text-caption text-secondary" 
            href="https://www.lamden.io" 
            target="_blank" 
            rel="noopener noreferrer" >
            Help & FAQ
        </a>
    </div>
    <div class="spacer"></div>
    <div class="keys">
        <div class="header text-subtitle2 text-primary-light">
            <div class="header-name">{'Name'}</div>
            <div class="header-address">{'Address'}</div>
        </div>
        <div class="key-row">
            <div class="checkbox-box">
                <input type="checkbox" bind:checked={selectAll} on:change={(ev) => selectAllKeys(ev)}>
            </div>
            <div class="name">{'All Wallets'}</div>
            <div class="address"></div>
        </div>
        {#each keys.keyList as key, i}
            <div class="key-row">
                <div class="checkbox-box">
                    <input type="checkbox" bind:checked={keys.keyList[i].checked}>
                </div>
                <div class="name">{`${key.name}`}</div>
                <div class="address">{`${key.vk}`}</div>
            </div>
        {/each}
    </div>

</div>