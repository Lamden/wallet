<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
        
    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';
	import { Components, LeftSideFullPage }  from '../Router.svelte'
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

.header{
    margin-left: 40px;
    border-bottom: 2px solid var(--divider-light);
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
    border-bottom: 1px dashed var(--divider-dark);
    margin-right: 16px;
    display: flex;
    align-items: center;
}

.key-info{
    display: flex;
    width: 141px;
    height: 88px;
    margin-right: 16px;
    border-bottom: 1px dashed var(--divider-dark);
    align-items: center;
    word-break: break-all;
    justify-content: center;
    align-items: flex-start;
    min-width: 143px;
}

.result-box{
    height: 88px;
    border-bottom: 1px dashed var(--divider-dark);
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

p.text-red{
    margin-left: 40px;
    padding: 10px 0;
}

p{
    margin: 0;
}

</style>

<LeftSideFullPage title="Decrypted Account" helpLink="/wallet/backup_overview">
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            These are all the Secret Keys stored in your Lamden Vault.
        </div>
    </div>
<div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
    <div class="flex-column flex-align-center">
        <h6>Decrypted Account Addresses</h6>

        <div class="flex-row header text-subtitle2 text-primary">
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
                        <p class="nickname text-secondary">{`${coin.nickname}`}</p>
                    </div>
                    <div class="flex-column result-box text-body3 text-secondary">
                        <p>{`Account Address: ${coin.vk}`}</p>
                        <p class=" text-secondary">{`Private Key: ${watchOnly(coin.sk) ? "Account is Watch Only. You do not own the private key." : coin.sk}`}</p>
                    </div>
                </div>
            {/each}
        {/if}
        {#if errorMsg !== ""}
            <div class="flex-row key-row">
                <p class="text-body2 text-red">{errorMsg}</p>
            </div>
        {/if}
        <div class="flex-column flow-buttons">
            <Button classes={`button__solid button__primary`}
                    margin="1rem 0 1rem 0"
                    name="Backup Keys"
                    disabled={typeof coins === 'undefined'}
                    width={"347px"}
                    click={() => changeStep(3)} />

            <Button classes={`button__solid`}
                    margin="0 0 1rem"
                    name="Back To Home"
                    width={"347px"}
                    click={() => appHome()} />
        </div>
    </div>
</div>
</LeftSideFullPage>