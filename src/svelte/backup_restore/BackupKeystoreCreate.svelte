<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore, CURRENT_KS_VERSION, password, obscure, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Loading } = Components;

    //Utils
    import { decryptStrHash, encryptObject, encryptStrHash } from '../../js/utils.js';

    //Context
    const { changeStep, setKeystoreFile, getKeystorePW  } = getContext('functions');

    //Props
    export let ksPwdInfo;

    onMount(() => {
        steps.update(current => {
            current.currentStep = 2;
            return current
        });   

        new Promise(function(resolve) {
            setTimeout(() => {
                createKeystore();
                resolve();
            }, 2500);
        })
        .then(res => {
            changeStep(5)

        })
    });

    function createKeystore() {
        let ksPwdInfo = getKeystorePW();
        let file = JSON.stringify({
            data: encryptObject(ksPwdInfo.pwd, {'version' : $CURRENT_KS_VERSION, keyList: decryptedKeys()}),
            w: ksPwdInfo.hint === "" ? "" : encryptStrHash(obscure, ksPwdInfo.hint),
        });

        setKeystoreFile(file)
    }

    function decryptedKeys(){
        return JSON.parse(JSON.stringify($CoinStore)).map( key => {
            key.sk = decryptSk(key.sk);
            return key;
        })
    }

    function decryptSk(sk){
        return decryptStrHash($password, sk) ? decryptStrHash($password, sk) : 'Cannot decrypt Secret Key: wrong password or bad data';
    }

</script>

<style>
.backup-create{
    display: flex;
    flex-grow: 1;
    justify-content: center;
    padding-top: 359px;
    
}

</style>

<div class="backup-create">
    <Loading message={'Creating Keystore'} />
</div>

