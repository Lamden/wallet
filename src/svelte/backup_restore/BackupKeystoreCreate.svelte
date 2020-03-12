<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CURRENT_KS_VERSION, obscure, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

    //Utils
    import { decryptStrHash, encryptObject, encryptStrHash, hashStringValue, decryptObject } from '../../js/utils.js';

    //Context
    const { changeStep, setKeystoreFile  } = getContext('functions');

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

    const createKeystore = () => {
        ksPwdInfo.obscure = obscure
        ksPwdInfo.version = $CURRENT_KS_VERSION
        chrome.runtime.sendMessage({type: 'backupCoinstore', data: ksPwdInfo}, (file) => {
            if (typeof file === 'undefined' || chrome.runtime.lastError) {
                throw new Error('unable to create keystore file')
            } else {
                setKeystoreFile(file)
            }
        })
    }

</script>

<style>
.backup-create{
    display: flex;
    flex-grow: 1;
    justify-content: center;    
}

</style>

<div class="backup-create">
    <Loading message={'Creating Keystore'} />
</div>

