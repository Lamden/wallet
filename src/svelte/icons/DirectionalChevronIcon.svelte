<script>
    export let width = "24px";
    export let margin = "0";
    export let padding = "0";
    export let direction = "up"
    export let color = "var(--font-primary)"
    export let strokeWidth = "1.5"

    $: height = width

    const directionMap = {
      'left' : 180,
      'up': -90,
      'right': 0,
      'down': 90,
    }

    $: rotation = directionMap[direction] || 0
</script>

<div class="wrapper" style={`transform: rotate(${rotation}deg); margin: ${margin}; padding: ${padding};`}>
    <svg {width} {height} viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 14L8.25 7.75L2 1.5" stroke={color} stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</div>

    
    
