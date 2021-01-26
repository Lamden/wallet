<script>
    import { createEventDispatcher} from 'svelte';

    //Components
    import { Components } from '../Router.svelte';
    const { InputBox, TokenLogo} = Components;

    //Icons
    import CloseIcon from '../icons/CloseIcon.svelte'

    //Props
    export let tokenMeta;
    export let disableInputs = false;
    export let error = "";

    const dispatch = createEventDispatcher()

    $: tokenName = tokenMeta ? tokenMeta.tokenName  : "";
    $: tokenSymbol = tokenMeta ? tokenMeta.tokenSymbol : "";
    $: logo_base64_svg = tokenMeta ? tokenMeta.logo_base64_svg : undefined;
    $: logo_base64_png = tokenMeta ? tokenMeta.logo_base64_png :  undefined;

    $: logoError = null
    $: uploadLogo = false;
    $: hasNoLogo = checkForLogo(tokenMeta, uploadLogo)
    $: hasNoMeta = !tokenName || !tokenSymbol
    $: dragover = '';

    const checkForLogo = (meta, uploaded) => {
        if (!meta) return true;
        return !meta.logo_base64_svg && !meta.logo_base64_png && !meta.logo_url && !uploaded
    }

    const clearLogoMeta = () => {
        logo_base64_svg = undefined
        logo_base64_png = undefined
        uploadLogo = false;
        logoError = null;
        dispatchNewValues();
    }

    const handleTokenNameChange = (e) => {
        if (e.detail.target.value !== tokenName) {
            tokenName = e.detail.target.value
            dispatchNewValues();
        }
    }

    const handleTokenSymbolChange = (e) => {
        if (e.detail.target.value !== tokenSymbol) {
            tokenSymbol = e.detail.target.value
            dispatchNewValues();
        }
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
        if (file) convertToBase64( file)
    }

    const convertToBase64 = async (fileObj) => {
        logoError = null;
        clearLogoMeta();
        const reader = new FileReader();

        reader.onloadend = function () {
            let image = new Image()
            var b64 = reader.result.replace(/^data:.+;base64,/, '');

            image.onload = function(){
                if (image.width <= 192 && image.height <= 192){
                    logo_base64_png = b64
                    logo_base64_svg = null
                    uploadLogo = true;
                }else{
                    logoError = "image size maximum 192x192"
                }
                dispatchNewValues()
            }

            if (fileObj.type === "image/svg+xml") {
                logo_base64_svg = b64
                logo_base64_png = null
                uploadLogo = true;
                dispatchNewValues()
            }
            if (fileObj.type === "image/png") image.src = `data:image/png;base64,${b64}`
        };
        reader.readAsDataURL(fileObj);
    }

    const openPicker = () => {
        let element = document.getElementById('filePicker');
        element.click();
    }

    const handleDragover = (e) => {
        if (!dragover) dragover = true;
    }

    const handleDragleave = (e) => {
        if (dragover) dragover = false;
    }

    const dispatchNewValues = () => {
        dispatch('changed', {tokenName, tokenSymbol, logo_base64_svg, logo_base64_png})
    }
</script>

<style>
    .token-logo-box{
        position: relative;
        padding: 20px;
        border: 1px solid var(--outline);
        text-align: center;
    }
    .clear-button{
        position: absolute;
        top: 3px;
        right: 3px;
    }
    .token-logo-upload{
        position: absolute;
        bottom: 10px;
    }
    .token-meta-left{
        flex-grow: 1;
        margin-right: 2rem;
    }
    .token-meta-right{
        margin-top: 1rem;
    }

    .dropzone{
        border: dashed 2px var(--font-secondary);
    }

    .dragover{
        background-color: var(--primary-color)
    }

    .logo-warning{
        width: 80px;
        height: 80px;
        margin: 0 10px;
    }

    .upload-button{
        padding: 2px 6px;
    }

</style>


<div class="flex-row">
    <div class="token-meta-left">
        <InputBox
            id={"input-token-name"}
            margin="0 0 2rem 0"
            bind:value={tokenName}
            on:keyup={handleTokenNameChange}
            placeholder={`Enter Token Name`}
            label={"Token Name"}
            bgStyle={tokenMeta ? "primary" : "transparent"}
            disabled={disableInputs}
        />

        <InputBox
            id={"input-token-symbol"}
            margin="0 0 2rem 0"
            bind:value={tokenSymbol}
            on:keyup={handleTokenSymbolChange}
            placeholder={`Enter Token Symbol`}
            label={"Token Symbol"}
            bgStyle={tokenMeta ? "primary" : "transparent"}
            disabled={disableInputs}
        />
    </div>
    <div class="token-meta-right">
        <div class="token-logo-box flex-center-center " 
             class:dropzone={hasNoLogo}
             class:dragover={hasNoLogo && dragover}
             on:dragover|preventDefault={handleDragover}
             on:dragleave|preventDefault={handleDragleave}
             on:drop={handleFileEvent}>
                {#if (!disableInputs && uploadLogo) || logoError}
                    <button class="button__icon clear-button" on:click|preventDefault={clearLogoMeta}>
                        <CloseIcon width="20px" />
                    </button>
                {/if}
            <div class="token-logo-upload">
                {#if !disableInputs}
                    <button class="button__small upload-button text-body2 weight-200" 
                            on:click|preventDefault={openPicker}>
                            {hasNoLogo && tokenMeta ? 'upload' : 'change'}
                    </button>
                    <input  id="filePicker" type="file" accept=".png,.svg" on:change={handleFileEvent}>
                {/if}
            </div>
            {#if !logoError}
                <TokenLogo {tokenMeta} width="80px" />
            {:else}
                <div class="logo-warning text-warning weight-400 text-body2">{logoError}</div>
            {/if}
        </div>
    </div>
</div>