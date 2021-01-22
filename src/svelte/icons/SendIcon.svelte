<script>
    export let width;
    export let color = "var(--font-primary)";

    $: height = width;

</script>

<svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
    <path fill={color} d="M11 16L8 22L15.76 18.12L11 16Z" undefined="1"></path>
    <path fill={color} d="M2 12L7.03 14.24L22 2L2 12Z" undefined="1"></path>
    <path fill={color} d="M11 16L20 20L22 2L11 16Z" undefined="1"></path>
</svg>
