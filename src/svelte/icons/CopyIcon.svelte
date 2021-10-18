<script>
    export let width = "20";
    export let color = "var(--font-primary-inverse)";

    $: height = width;

</script>

<style>
    svg:hover > path{
        fill: var(--accent-color);
    }
</style>

<svg {width} {height} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <path d="M0 0H14V14H0V0ZM20 6V20H6V16H8V18H18V8H16V6H20Z"
    fill={color}/>
</svg>
