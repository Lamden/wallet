<script>
  export let width;
  export let color = "var(--font-primary)";

  $: height = width;
</script>

<svg
  {width}
  {height}
  viewBox="0 0 18 18"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M13.5002 7.5L10.5002 7.5L10.5002 4.5"
    stroke={color}
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M15.0001 3L10.5001 7.5"
    stroke={color}
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M4.49994 10.5L7.49994 10.5L7.49994 13.5"
    stroke={color}
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M7.49994 10.5L2.99994 15"
    stroke={color}
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
