<script>
    export let width = "24px";
    export let margin = "0";
    export let padding = "0";
    export let direction = "up"
    export let color = "var(--font-primary)"

    $: height = width

    const directionMap = {
      'left' : 180,
      'up': -90,
      'right': 0,
      'down': 90,
    }

    $: rotation = directionMap[direction] || 0
</script>

<div style={`transform: rotate(${rotation}deg); margin: ${margin}; padding: ${padding};`}>
    <svg {width} {height} viewBox="0 0 8 13" xmlns="http://www.w3.org/2000/svg">
        <path fill={color} class="menu-icon" d="M0.000156403 2.11496L4.58016 6.70496L0.000156403 11.295L1.41016 12.705L7.41016 6.70496L1.41016 0.704956L0.000156403 2.11496Z"/>
    </svg>
</div>


