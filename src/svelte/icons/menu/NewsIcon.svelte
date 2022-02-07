<script>
    export let width = "18";
    export let color = "var(--font-primary)";

    $: height = width;
</script>

<svg {width} {height} viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.00007 11.8331L3.88541 13.9965L4.67141 9.41447L1.33807 6.16981L5.93807 5.50314L7.99541 1.33447L10.0527 5.50314L14.6527 6.16981L11.3194 9.41447L12.1054 13.9965L8.00007 11.8331Z" stroke={color} stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"
    />
</svg>
