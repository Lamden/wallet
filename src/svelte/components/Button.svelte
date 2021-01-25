<script>
    //Props
    export let id;
    export let name = '';
    export let click;
    export let width = 'unset';
    export let height = '42px';
    export let padding = '0 16px';
    export let margin = 'unset';
    export let classes = 'button__solid';
    export let styles = '';
    export let disabled = false;
    export let tabIndex;
    export let spellcheck = true;
</script>

<style>
.text-button{
    margin: 0 6px;
}

</style>

<button class={`flex-row flex-center-centr ${disabled ? 'disabled ' : ''}${classes}`}
        id={id}
        on:click={click}
        disabled={disabled}
        style="min-width: fit-content; width: {width}; height: {height}; padding: {padding}; margin: {margin}; {styles}"
        tabIndex={tabIndex}
        type="button"
    >
    <slot name="icon-before"></slot>
    <div class="text-button"> {name} </div>
    <slot name="icon-after"></slot>
 </button>