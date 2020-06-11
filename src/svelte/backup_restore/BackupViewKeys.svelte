<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';
	import { Components }  from '../Router.svelte'
    const { Button, InputBox, Loading } = Components;

    //Context
    const { appHome } = getContext('app_functions');
    const { changeStep } = getContext('functions');

    //DOM Nodes
    let formObj;

    $: coins = undefined;
    $: errorMsg = "";


    onMount(() => {
        steps.set({
            currentStep: 1,
            stepList: [
                {number: 1, name: 'Verify', desc:'Wallet Password'},
                {number: 2, name: 'Decrypt', desc:'View Secret Keys'},
            ]
        });

        chrome.runtime.sendMessage({type: 'decryptStore'}, (coinStore) => {
            if (typeof coinStore === 'undefined' || chrome.runtime.lastError) {
                throw new Error('unable to decrypt keystore')
            } else {
                if (typeof coinStore.error !== 'undefined') errorMsg = coinStore.error
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
.backup-keys{
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
    min-width: 498px;
    justify-content: flex-start;
}

.key-box{
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    max-width: 915px;
}

.header{
    display: flex;
    flex-direction: row;
    margin-left: 40px;
    border-bottom: 2px solid var(--font-primary-darker);
}

.header-name{
    width: 214px;
}

.header-address{
    flex-grow: 1;
}

.name{
    display: flex;
    width: 200px;
    min-width: 200px;
    height: 88px;
    margin-right: 16px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
    word-break: break-word;
}

.keys{
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    flex-grow: 1;
}

.key-row{
    display: flex;
    flex-direction: row;
    align-items: center;
}

.text-box{
    margin-bottom: 160px;
}

a{
    text-decoration: unset;
    color: #ffffff99;
}

p.text-red{
    margin-left: 40px;
    padding: 10px 0;
}

</style>

<div class="backup-keys">
    <div class="content">
        <h6>Decrypted Account Addresses</h6>
    
        <div class="text-box text-body1 text-primary">
            These are all the Secret Keys stored in your Lamden Wallet
        </div>

        <Button classes={`button__solid button__purple`}
                styles={'margin-bottom: 16px;'}
                name="Backup Keys"
                disabled={typeof coins === 'undefined'}
                click={() => changeStep(3)} />

        <Button classes={`button__solid`}
                styles={'margin-bottom: 16px;'}
                name="Back To Home"
                click={() => appHome()} />

        <a  class="text-caption text-secondary" 
            href="https://www.lamden.io" 
            target="_blank" 
            rel="noopener noreferrer" >
            Help & FAQ
        </a>
    </div>
    <div class="key-box flex-column">
        <div class="header text-subtitle2 text-primary-light">
            <div class="header-name">{'Account Name'}</div>
            <div class="header-address">{'Keys'}</div>
        </div>
        {#if coins}
            {#each coins as coin}
                <div class="key-row">
                    <div>
                        <CryptoLogos {coin} black={true} styles={`margin-right: 21px; width: 20px;`}/>
                    </div>
                    <div class="name text-body1 text-primary">{`${coin.nickname}`}</div>
                    <div class="keys text-body2">
                        <div>{`Account Address: ${coin.vk}`}</div>
                        <div class=" text-primary-dark">{`Private Key: ${watchOnly(coin.sk) ? "Key is Watch Only" : coin.sk}`}</div>
                    </div>
                </div>
            {/each}
        {/if}
        {#if errorMsg !== ""}
            <p class="text-body2 text-red">{errorMsg}</p>
        {/if}
    </div>
</div>