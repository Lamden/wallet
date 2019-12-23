<script>
    //images
    import { icons } from '../../js/images.js';
    const { successCircle } = icons;

    export let password;
    export let charLength;

    let capTest = /[A-Z]/;
    let symbolTest = /[ ~!@#$%^&?*_<>,.?/+=`(){}[:;"\-\|\\\]\']/;
    let numTest = /[0-9]/;

    $: capital = capTest.test(password);
    $: symbol = symbolTest.test(password);
    $: number = numTest.test(password);
    $: length = password.length >= charLength;
</script>

<style>
.strong-pw{
    margin-bottom: 1rem;
}
.filler{
    margin-left: 21px;
}
.icon{
    height: 11px;
    margin-right: 6px;
}
</style>

<div class="strong-pw text-body2">
    <div class={`${!length ? 'text-primary-dark filler' : ''}`}>
        {#if length}<img class="icon" src={successCircle} alt={'success'}>{/if}
        {`${charLength} or more characters`}
    </div>
    <div class={`${!symbol ? 'text-primary-dark filler' : ''}`}>
        {#if symbol}<img class="icon" src={successCircle} alt={'success'}>{/if}
        {'1 Special Character'}
    </div> 
    <div class={`${!number ? 'text-primary-dark filler' : ''}`}>
        {#if number}<img class="icon" src={successCircle} alt={'success'}>{/if}
        {'1 Number'}
    </div> 
    <div class={`${!capital ? 'text-primary-dark filler' : ''}`}>
        {#if capital}<img class="icon" src={successCircle} alt={'success'}>{/if}
        {'1 Capital'}
    </div> 
</div>




