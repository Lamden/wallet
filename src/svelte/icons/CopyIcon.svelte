<script>
    export let width = "20";
    export let color = "var(--font-primary-inverse)";
    export let responsive = false
    export let margin = "unset"

    $: height = width;

</script>

<style>
    svg:hover > path{
        fill: var(--accent-color);
        cursor: pointer;
    }

    svg.responsive{
        width: 10px!important;
        height: 10px!important;
    }

    @media (min-width: 550px) {
        svg.responsive{
            width: unset!important;
            height: unset!important;
        }
    }

</style>

<svg {width} {height} style={`margin: ${margin};`} class:responsive={responsive} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <path d="M0 0H14V14H0V0ZM20 6V20H6V16H8V18H18V8H16V6H20Z"
    fill={color}/>
</svg>
