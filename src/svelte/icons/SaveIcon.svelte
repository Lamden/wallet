<script>
  export let width;
  export let color = "var(--font-primary)";

  $: height = width;
</script>

<svg
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  data-reactroot=""
>
  <path
    stroke-linejoin="round"
    stroke-linecap="round"
    stroke-miterlimit="10"
    stroke-width="2"
    stroke={color}
    fill="none"
    d="M17 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V7L17 2Z"
  />
  <path
    stroke-linejoin="round"
    stroke-linecap="round"
    stroke-miterlimit="10"
    stroke-width="2"
    stroke={color}
    fill="none"
    d="M12 18C13.933 18 15.5 16.433 15.5 14.5C15.5 12.567 13.933 11 12 11C10.067 11 8.5 12.567 8.5 14.5C8.5 16.433 10.067 18 12 18Z"
  />
  <path
    stroke-linejoin="round"
    stroke-linecap="round"
    stroke-miterlimit="10"
    stroke-width="2"
    stroke={color}
    fill="none"
    d="M12 2V7H2V4C2 2.9 2.9 2 4 2H12Z"
  />
</svg>
