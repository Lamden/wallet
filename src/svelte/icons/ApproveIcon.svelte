<script>
    export let width = "20";
    export let margin = "0";
    export let color = "var(--font-primary-inverse)";

    $: height = width;

</script>

<svg {width} {height} style={`margin: ${margin};`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
    <path fill={color} d="M14.29 7.36C14.49 6.56 15 5.72 15 4.9C15 4.04 14.62 3.27 14 2.74C13.47 2.28 12.77 2 12 2C11.23 2 10.53 2.28 10 2.74C9.38 3.27 9 4.04 9 4.9C9 5.72 9.51 6.56 9.71 7.36C9.95 8.36 10.08 9.38 10.09 10.4C10.09 12.09 9.6 14.08 9 15H15C14.4 14.08 13.91 12.09 13.91 10.4C13.92 9.38 14.05 8.36 14.29 7.36Z" undefined="1"></path>
    <path fill={color} d="M18 22H6C5.45 22 5 21.55 5 21V19H19V21C19 21.55 18.55 22 18 22Z" undefined="1"></path>
    <path stroke-linejoin="round" stroke-width="1" stroke="black" d="M3 19H21"></path>
    <path fill={color} d="M21 19H3V17C3 15.9 3.9 15 5 15H19C20.1 15 21 15.9 21 17V19Z" undefined="1"></path>
</svg>