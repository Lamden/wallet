<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { setFile, nextPage } = getContext('functions');

    //Props
    export let restore = false;

    let disabledButton = true;
    $: activeButton = disabledButton ? '' : ' button__primary'
    $: dragover = '';

	onMount(() => {
        if (restore){
            steps.update(current => {
                current.currentStep = 2;
                return current
            });
        } else {
            steps.set({
                currentStep: 1,
                stepList: [
                    {number: 1, name: 'Upload', desc:'Keystore File'},
                    {number: 2, name: 'Password', desc:'For Keystore'},
                    {number: 3, name: 'Decide', desc:'Select Accounts'},
                    {number: 4, name: 'Complete!', desc:'Return to Wallet'},
                ]
            });
        }

    });

    const openPicker = () => {
        let element = document.getElementById('filePicker');
        element.click();
    }

    const handleFileEvent = (ev) => {
        let file;
        ev.preventDefault();

        if (ev.target.files){
            file = ev.target.files[0];
        } else if (ev.dataTransfer.items) {
            ev.dataTransfer.items[0].kind === 'file' ? file = ev.dataTransfer.items[0].getAsFile() : null;
        } else if (ev.dataTransfer.files) {
            ev.dataTransfer.files[0].kind === 'file' ? file = ev.dataTransfer.files[0].getAsFile() : null;
        }
        if (file) {
            setFile(file);
            disabledButton = false;
        }
    }

    const handleDragover = (e) => {
        if (!dragover) dragover = true;
    }

    const handleDragleave = (e) => {
        if (dragover) dragover = false;
    }
    
</script>

<style>

#filePicker{
    display: none;
}

.caption-box{
    display: inline;
    margin: 16px 0 20px 0;
}

.caption-box.text-caption{
    text-align: left;
}

.text-primary:hover{
    text-decoration: underline;
    color: var(--font-accent);
}

span{
    cursor: pointer;
}

.dropzone{
    border: dashed 2px var(--font-secondary);
    height: 96px;
    margin-bottom: 50px;
    justify-items: center;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.dragover{
    background-color: var(--primary-color)
}

</style>
<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Restore Accounts</h6>
        
        <div class="flow-text-box text-body1 text-primary">
            To restore your accounts, please upload the keystore file created during your backup.
        </div>
        
        <div class="caption-box text-caption">
            <span class="text-accent" on:click={() => openPicker()}>Click here to choose a file</span>
            or drag and drop your file below.
        </div>

        <div class={`dropzone flex-column ${dragover}`}
            class:dragover={dragover} 
            on:dragover|preventDefault={(e) => handleDragover(e)}
            on:dragleave|preventDefault={(e) => handleDragleave(e)}
            on:drop={(ev) => handleFileEvent(ev)}>
            Drop File Here
        </div>
        
        <input  id="filePicker" type="file" accept=".keystore" on:change={(ev) => handleFileEvent(ev)}>

        <div class="flex-column flow-buttons">
            <Button id={'confirm-keystore-btn'}
                    classes={`button__solid ${activeButton}`}
                    styles={'margin-bottom: 16px;'}
                    name="Confirm Keystore"
                    disabled={disabledButton}
                    click={() => nextPage()} />

            {#if whitelabel.helpLinks.show}
                <a  class="text-link text-caption text-secondary" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/wallet/"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    Help & FAQ
                </a>
            {/if} 
        </div>
    </div>
    <div class="flex-column flow-content-right"> </div>
</div>

