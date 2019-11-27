<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

    //Context
    const { setFile, changeStep } = getContext('functions');

    //Props
    export let restore = false;

    let disabledButton = true;
    $: activeButton = disabledButton ? '' : ' button__purple'

	onMount(() => {
        if (restore){
            steps.set({
                currentStep: 1,
                stepList: [
                    {number: 1, name: 'Upload', desc:'Keystore File'},
                    {number: 2, name: 'Unlock', desc:'Keystore Password'},
                    {number: 3, name: 'Wallets', desc:'Restore Keys'},
                    {number: 4, name: 'Create Password', desc:'Make it Good!'},
                    {number: 5, name: 'Complete!', desc:'Return to Wallet'},
                ]
            });
        } else {
            steps.set({
                currentStep: 1,
                stepList: [
                    {number: 1, name: 'Upload', desc:'Keystore File'},
                    {number: 2, name: 'Password', desc:'For Keystore'},
                    {number: 3, name: 'Wallets', desc:'Select Backups'},
                    {number: 4, name: 'Complete!', desc:'Return to Wallet'},
                ]
            });
        }

    });

    function openPicker(){
        let element = document.getElementById('filePicker');
        element.click();
    }

    function handleFileEvent(ev){
        let file;
        ev.preventDefault();

        if (ev.target.files) {
            file = ev.target.files[0];
        } else if (ev.dataTransfer.items) {
            ev.dataTransfer.items[0].kind === 'file' ? file = ev.dataTransfer.items[0].getAsFile() : null;
        } else if (ev.dataTransfer.files) {
            file = ev.dataTransfer.files;
        }
        if (file) {
            setFile(file);
            disabledButton = false;
        }

    }
    
</script>

<style>

#filePicker{
    display: none;
}

.page{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 156px 24px 0 242px;
}

.heading{
    margin-bottom: 16px;
}

.caption-box{
    display: inline;
    margin: 16px 0 84px 0;
}

a{
    text-decoration: unset;
}

</style>

<div class="page" on:dragover={(ev) => ev.preventDefault()} on:drop={(ev) => handleFileEvent(ev)}>
    <h6 class="heading">Welcome!</h6>
    
    <div class="text-box text-body1 text-primary">
        To restore your wallet, please upload the file we provided you and choose a new password.
    </div>
    
    <div class="caption-box text-caption text-secondary">
        Drag and drop your file anywhere on this page. Or
        <a class="text-purple" href="javascript:void(0)" on:click={() => openPicker()}>click to chose a file</a>
        to manually select.
    </div>
    
    <input  id="filePicker" type="file" accept=".keystore" on:change={(ev) => handleFileEvent(ev)}>
    
    <Button style={`button__solid ${activeButton}`}
            height={'36px'}
            styles={'margin-bottom: 16px;'}
            name="Confirm Keystore"
            disabled={disabledButton}
            click={() => changeStep(1)} />

    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>






