<script>
    export let width = "24px";
    export let margin = "0";
    export let padding = "0";
    export let direction = "up"
    export let color = "var(--font-primary)"

    $: height = width

    const directionMap = {
      'up' : 0,
      'left': -90,
      'right': 90,
      'down': 180,
    }

    $: rotation = directionMap[direction] || 0
</script>

<div style={`transform: rotate(${rotation}deg); margin: ${margin}; padding: ${padding};`} >
    <svg {width} {height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16L9 3.83L14.59 9.42L16 8L8 -3.49691e-07L-3.49691e-07 8L1.41 9.41L7 3.83L7 16L9 16Z" 
        fill={color}/>
    </svg>
</div>


