<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
        
    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';
	import { Components }  from '../Router.svelte'
    const { Button, InputBox, Loading } = Components;

    //Context
    const { appHome } = getContext('app_functions');
    const { changeStep, getPassword } = getContext('functions');

    //DOM Nodes
    let formObj;

    $: coins = undefined;
    $: errorMsg = "";


    onMount(() => {
        chrome.runtime.sendMessage({type: 'decryptStore', data: getPassword()}, (coinStore) => {
            if (typeof coinStore === 'undefined' || chrome.runtime.lastError) {
                throw new Error('unable to decrypt keystore')
            } else {
                if (coinStore === false) errorMsg = "Incorrect Password"
                else {
                    coins = [...coinStore];
                    steps.update(current => {
                        current.currentStep = 2;
                        return current
                    });
                }
            }
        })
    })

    const getLogo = (coin) => {
        return logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    }

    const watchOnly = (sk) => {
        return sk.includes("watchOnly")
    }
</script>

<style>
.key-box{
    max-width: 820px;
    margin: 0 auto;
}

.header{
    margin-left: 53px;
    border-bottom: 2px solid var(--font-primary-darker);
    width: calc(100% - 53px);
}

.header-name{
    width: 157px;
}

.header-address{
    flex-grow: 1;
}

.name{
    width: 141px;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    margin-right: 16px;
    display: flex;
    align-items: center;
}

.key-info{
    display: flex;
    width: 141px;
    height: 88px;
    margin-right: 16px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
    word-break: break-all;
    justify-content: center;
    align-items: flex-start;
    min-width: 143px;
}

.result-box{
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    flex-grow: 1;
    padding-right: 20px;
    justify-content: center;
    overflow: hidden;
}

.result-box > p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.key-row{
    align-items: center;
}


a{
    text-decoration: unset;
    color: #ffffff99;
}

p.text-red{
    margin-left: 40px;
    padding: 10px 0;
}

p{
    margin: 0;
}

</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Decrypted Account Addresses</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            These are all the Secret Keys stored in your Lamden Wallet
        </div>
        <div class="flex-column flow-buttons">
            <Button classes={`button__solid button__purple`}
                    margin="0 0 1rem"
                    name="Backup Keys"
                    disabled={typeof coins === 'undefined'}
                    click={() => changeStep(3)} />

            <Button classes={`button__solid`}
                    margin="0 0 1rem"
                    name="Back To Home"
                    click={() => appHome()} />

            <a  class="text-caption text-secondary" 
                href="https://www.lamden.io" 
                target="_blank" 
                rel="noopener noreferrer" >
                Help & FAQ
            </a>
        </div>
    </div>
    <div class="flow-content-right key-box" in:fade="{{delay: 0, duration: 200}}">
        <div class="flex-row header text-subtitle2 text-primary-light">
            <p class="header-name">{'Name'}</p>
            <p class="header-address">{'Address'}</p>
        </div>
        {#if coins}
            {#each coins as coin}
                <div class="flex-row key-row">
                    <div>
                        <CryptoLogos {coin} black={true} styles={`margin-right: 21px; width: 20px;`}/>
                    </div>
                    <div class="flex-column key-info text-body3 ">
                        <p>{`${coin.name} (${coin.symbol})`}</p>
                        <p class="nickname text-primary-dark">{`${coin.nickname}`}</p>
                    </div>
                    <div class="flex-column result-box text-body3 text-secondary">
                        <p>{`Account Address: ${coin.vk}`}</p>
                        <p class=" text-primary-dark">{`Private Key: ${watchOnly(coin.sk) ? "Key is Watch Only" : coin.sk}`}</p>
                    </div>
                </div>
            {/each}
        {/if}
        {#if errorMsg !== ""}
            <div class="flex-row key-row">
                <p class="text-body2 text-red">{errorMsg}</p>
            </div>
        {/if}
    </div>
</div>