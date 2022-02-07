<script>
    export let width = "18px";
    export let color = "var(--font-primary)";

    $: height = width;
</script>

<svg {width} {height} viewBox="6 8 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 22V22.0183" stroke={color} stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M27.1847 16.8145C28.5594 18.1897 29.3318 20.0546 29.3318 21.9991C29.3318 23.9437 28.5594 25.8086 27.1847 27.1838" stroke={color} stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32.3712 11.6289C33.7332 12.9908 34.8136 14.6077 35.5507 16.3872C36.2878 18.1667 36.6672 20.074 36.6672 22.0001C36.6672 23.9262 36.2878 25.8334 35.5507 27.6129C34.8136 29.3924 33.7332 31.0093 32.3712 32.3712" stroke={color} stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.808 27.1838C15.4332 25.8086 14.6609 23.9437 14.6609 21.9991C14.6609 20.0546 15.4332 18.1897 16.808 16.8145" stroke={color} stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.6178 32.3712C10.2558 31.0093 9.17543 29.3924 8.43831 27.6129C7.7012 25.8334 7.32181 23.9262 7.32181 22.0001C7.32181 20.074 7.7012 18.1667 8.43831 16.3872C9.17543 14.6077 10.2558 12.9908 11.6178 11.6289" stroke={color} stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    
