<script>
    //images
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';

    export let password;
    export let charLength;

    let capTest = /[A-Z]/;
    let lowerTest = /[a-z]/;
    let symbolTest = /[ ~!@#$%^&?*_<>,.?/+=`(){}[:;"\-\|\\\]\']/;
    let numTest = /[0-9]/;

    $: capital = capTest.test(password);
    $: lower = lowerTest.test(password);
    $: symbol = symbolTest.test(password);
    $: number = numTest.test(password);
    $: length = password.length >= charLength;
</script>

<style>
.strong-pw{
    line-height: 1.4;
}
.icon{
    width: 14px;
    margin-right: 6px;
    position: relative;
    top: 2px;
}
</style>

<div class="strong-pw text-body2">
    <div class={`${!length ? 'text-secondary' : 'flex-row'}`}>
        {#if length}<div class="icon">{@html successCircle}</div>{/if}
        {`${charLength} or more characters`}
    </div>
    <div class={`${!lower ? 'text-secondary' : 'flex-row'}`}>
        {#if lower}<div class="icon">{@html successCircle}</div>{/if}
        {'1 Lowercase Letter'}
    </div>
    <div class={`${!capital ? 'text-secondary' : 'flex-row'}`}>
        {#if capital}<div class="icon">{@html successCircle}</div>{/if}
        {'1 Capital Letter'}
    </div>
    <div class={`${!number ? 'text-secondary' : 'flex-row'}`}>
        {#if number}<div class="icon">{@html successCircle}</div>{/if}
        {'1 Number'}
    </div>
    <div class={`${!symbol ? 'text-secondary' : 'flex-row'}`}>
        {#if symbol}<div class="icon">{@html successCircle}</div>{/if}
        {'1 Special Character'}
    </div> 

</div>




