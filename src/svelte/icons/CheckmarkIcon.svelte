<script>
    export let width = "18";
    export let color = "var(--font-primary)";
    export let margin = "unset"

    $: height = width;

</script>


<svg {width} {height} style={`margin: ${margin};`} viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 1.41L5.5 13.41L0 7.91L1.41 6.5L5.5 10.58L16.09 1.52588e-07L17.5 1.41Z" fill={color}/>
</svg>

