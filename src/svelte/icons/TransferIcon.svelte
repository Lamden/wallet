
<script>
    export let width = "20";
    export let margin = "0";
    export let color = "var(--font-primary-inverse)";

    $: height = width;

</script>

<svg {width} {height} style={`margin: ${margin};`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
    <path fill={color} d="M12 15C15.5899 15 18.5 12.0899 18.5 8.5C18.5 4.91015 15.5899 2 12 2C8.41015 2 5.5 4.91015 5.5 8.5C5.5 12.0899 8.41015 15 12 15Z" undefined="1"></path>
    <path fill={color} d="M1 19C1 18.4477 1.44772 18 2 18H22C22.5523 18 23 18.4477 23 19C23 19.5523 22.5523 20 22 20H2C1.44772 20 1 19.5523 1 19Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
    <path fill={color} d="M18.2929 15.2929C18.6834 14.9024 19.3166 14.9024 19.7071 15.2929L22.7071 18.2929C23.0976 18.6834 23.0976 19.3166 22.7071 19.7071L19.7071 22.7071C19.3166 23.0976 18.6834 23.0976 18.2929 22.7071C17.9024 22.3166 17.9024 21.6834 18.2929 21.2929L20.5858 19L18.2929 16.7071C17.9024 16.3166 17.9024 15.6834 18.2929 15.2929Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
</svg>
