<script>
    import Lamden from 'lamden-js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    import InputBox from './InputBox.svelte';
    
    export let mnemonics = [];
    export let disabled = true;
    export let disableInputs = [];
    export let useAnyway = false;

    let doms = [];

    export const validation = () => {
        let valid = true;
        if (!useAnyway) {
            doms.forEach((node) => {
                node.setCustomValidity('');
                if (!node.value || node.value === '') {
                    node.setCustomValidity("Can't be empty")
                    node.reportValidity()
                    valid = valid & false;
                } else if(!/^[a-z]+$/.test(node.value)){
                    node.setCustomValidity("Should be lowercase letter")
                    node.reportValidity()
                    valid = valid & false;
                }
            })
        }
        return valid;
    }

    const handleKeyup = (e) => {
        dispatch('mnemonicChanged', e)
    }
</script>
<style>
    .mnemonic{
        display: flex;
        flex-wrap: wrap;
        width: 370px;
        justify-content: space-between;
        margin-bottom: 1.25rem;
    }
    .mnemonic > .cell{
        width: calc(calc(100% / 4) - 10px);
    }
</style>
<div class="mnemonic">
    {#each mnemonics as word, index}
        <div class="cell">
            <InputBox 
            id={"word" + index}
            label={index+1}
            inputType={'text'}
            width={"100%"}
            bind:thisInput={doms[index]}
            bind:value={word}
            on:changed={(e) => {
                let value = e.detail.target.value.trim();
                mnemonics[index] = value
            }}
            on:keyup={handleKeyup}
            margin={"0"}
            disabled={disabled || disableInputs.indexOf(index) !== -1}
            />
        </div>
    {/each}
</div>