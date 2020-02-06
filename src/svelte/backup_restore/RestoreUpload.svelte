<script>
    import { onMount, getContext } from 'svelte';
    
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
    $: activeButton = disabledButton ? '' : ' button__purple'
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
            ev.dataTransfer.files[0].kind === 'file' ? file = ev.dataTransfer.files[0].getAsFile() : null;
        }
        if (file) {
            setFile(file);
            disabledButton = false;
        }
    }

    function handleDragover(e){
        if (!dragover) dragover = true;
    }

    function handleDragleave(e){
        if (dragover) dragover = false;
    }
    
</script>

<style>

#filePicker{
    display: none;
}

.restore-upload{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 0px 24px 0 242px;
    justify-content: center;
}

.caption-box{
    display: inline;
    margin: 16px 0 20px 0;
}

a{
    text-decoration: unset;
}

span{
    cursor: pointer;
}

.dropzone{
    border: dashed 2px var(--font-primary-dark);
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

<div class="restore-upload">
    <h6>Welcome!</h6>
    
    <div class="text-box text-body1 text-primary">
        To restore your wallet, please upload the file we provided you and choose a new password.
    </div>
    
    <div class="caption-box text-caption text-secondary">
        <span class="text-purple" on:click={() => openPicker()}>Click here to choose a file</span>
        or drag and drop your file below.
    </div>

    <div class={`dropzone flex-column text-primary-dark ${dragover}`}
        class:dragover={dragover} 
        on:dragover|preventDefault={(e) => handleDragover(e)}
        on:dragleave|preventDefault={(e) => handleDragleave(e)}
        on:drop={(ev) => handleFileEvent(ev)}>
        Drop File Here
    </div>
    
    <input  id="filePicker" type="file" accept=".keystore" on:change={(ev) => handleFileEvent(ev)}>
    
    <Button id={'confirm-keystore-btn'}
            classes={`button__solid ${activeButton}`}
            styles={'margin-bottom: 16px;'}
            name="Confirm Keystore"
            disabled={disabledButton}
            click={() => nextPage()} />

    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>






