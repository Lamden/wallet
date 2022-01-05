<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

	//Components
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { setFile, nextPage, back} = getContext('functions');

    //Props
    export let restore = false;

    let disabledButton = true;
    let fileName;
    $: activeButton = disabledButton ? '' : ' button__primary'
    $: dragover = '';

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
            if (file.name.includes(".keystore")){
                setFile(file);
                fileName = file.name;
                disabledButton = false;
            }else{
                dragover = false;
            }
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
.caption-box{
    display: inline;
    margin: 16px 0 20px 0;
}

.caption-box.text-caption{
    text-align: left;
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
    background-color: var(--primary-color);
    color: var(--color-white);
    word-break: break-all;
    padding: 0 10px;
}

.wrap{
    width: 347px
}

</style>
<LeftSideFullPage title="Restore Legacy Accounts" helpLink="https://docs.lamden.io/docs/wallet/restore_keystore">
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Use a Keystore file to recover Legacy Lamden Accounts. This will NOT restore accounts contained in a Recovery Phrase.
        </div>
    </div>
<div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
    <div class="flex-column wrap">
        <h6>Restore Accounts</h6>
        
        <div class="flow-text-box text-body1 text-primary">
            To restore your accounts, please upload the keystore file created during your backup.
        </div>
        
        <div class="caption-box text-caption">
            <span class="text-accent text-body1" on:click={() => openPicker()}>Click here to choose a file</span>
            or drag and drop your file below.
        </div>

        <div class={`dropzone flex-column ${dragover}`}
            class:dragover={dragover} 
            on:dragover|preventDefault={(e) => handleDragover(e)}
            on:dragleave|preventDefault={(e) => handleDragleave(e)}
            on:drop={(ev) => handleFileEvent(ev)}>
            {fileName ? fileName : "Drop File Here"}
        </div>
        
        <input  id="filePicker" type="file" accept=".keystore" on:change={(ev) => handleFileEvent(ev)}>

        <div class="flex-column flow-buttons">
            <Button id={'confirm-keystore-btn'}
                    classes={`button__solid ${activeButton}`}
                    styles={'margin-bottom: 16px;'}
                    name="Confirm Keystore"
                    disabled={disabledButton}
                    click={() => nextPage()} />
            <Button id={'back-btn'}
                classes={`button__solid`}
                styles={'margin-bottom: 16px;'}
                name="Back"
                click={() => back()} />
        </div>
    </div>
</div>
</LeftSideFullPage>

