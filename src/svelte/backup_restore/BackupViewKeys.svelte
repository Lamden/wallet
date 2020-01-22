<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, steps, password } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button, InputBox } = Components;

    //Utils
    import { logos } from '../../js/crypto/logos.js';
    import { decryptStrHash } from '../../js/utils.js';

    //Context
    const { appHome } = getContext('app_functions');
    const { changeStep } = getContext('functions');

    //DOM Nodes
    let formObj;

    $: coins = [...$CoinStore];


    onMount(() => {
        steps.update(current => {
            current.currentStep = 3;
            return current
        });   
    })

    function getLogo(coin){
        return logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    }

    function decryptSk(sk){
        return decryptStrHash($password, sk) ? decryptStrHash($password, sk) : 'Cannot decrypt Secret Key: wrong password or bad data';
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
}

.spacer{
    flex-grow: 1;
    max-width: 314px;
}

.key-box{
    display: flex;
    flex-direction: column;
}

.header{
    display: flex;
    flex-direction: row;
    margin-left: 53px;
    border-bottom: 2px solid var(--font-primary-darker);
}

.header-name{
    width: 175px;
}

.header-address{
    flex-grow: 1;
}

.name{
    display: flex;
    width: 160px;
    height: 88px;
    margin-right: 16px;
    border-bottom: 1px dashed var(--font-primary-darker);
    align-items: center;
}

.keys{
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 88px;
    border-bottom: 1px dashed var(--font-primary-darker);
    flex-grow: 1;
}

.logo{
    margin-right: 21px;
    width: 20px;
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

</style>

<div class="backup-keys">
    <div class="content">
        <h6>Decrypted Wallet Keys</h6>
    
        <div class="text-box text-body1 text-primary">
            These are all the keys stored in your Lamden Wallet
        </div>

        <Button classes={`button__solid button__purple`}
                styles={'margin-bottom: 16px;'}
                name="Backup Keys"
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

    <div class="spacer"></div>

    <div class="key-box flex-column">
        <div class="header text-subtitle2 text-primary-light">
            <div class="header-name">{'Wallet Name'}</div>
            <div class="header-address">{'Keys'}</div>
        </div>

        {#each coins as coin}
            <div class="key-row">
                <div> 
                    <div class="logo" >{@html getLogo(coin)}</div>
                </div>
                <div class="name text-body1 text-primary">{`${coin.nickname}`}</div>
                <div class="keys text-body2">
                    <div>{`vk: ${coin.vk}`}</div>
                    <div class=" text-primary-dark">{`sk: ${decryptSk(coin.sk)}`}</div>
                </div>
            </div>
        {/each}
    </div>
</div>