<script>
    //Images
    import spinner from '../../img/menu_icons/icon_spinner.svg';

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
    export let responsive = false
    export let loading = false;
    export let loadingText = "loading";
</script>

<style>
    .text-button{
        margin: 0 6px;
    }
    .responsive{
        font-size: 10px;
    }
    @media (min-width: 550px) {
        .responsive{
            font-size: 14px;
        }

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
    <slot name="icon-before" ></slot>
    <div class="text-button" class:responsive={responsive}> {loading ? loadingText : name} </div>
    <div>
        {#if loading}
            <div class="spinner" style="width: 20px">{@html spinner}</div>
        {/if}
    </div>
    <slot name="icon-after"></slot>
 </button>