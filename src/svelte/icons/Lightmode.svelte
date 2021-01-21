<script>
    import { getContext } from 'svelte'

    //Stores
    import { currentThemeName } from '../../js/stores/stores'
</script>

<style>
    svg.heavy > path{   
        stroke: var(--font-primary);
    }
    svg.thin > path {
        fill: var(--font-primary);
    }
</style>

{#if $currentThemeName === "light"}
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="" class="heavy">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M22 12H19"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M5 12H2"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M12 22V19"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M12 5V2"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M19.07 19.07L16.95 16.95"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M7.05005 7.04999L4.93005 4.92999"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M7.05005 16.95L4.93005 19.07"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M19.07 4.92999L16.95 7.04999"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" fill="none" d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path>
    </svg>
{:else}
    <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-reactroot="" class="thin">
        <path  d="M17 12C17 11.4477 17.4477 11 18 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H18C17.4477 13 17 12.5523 17 12Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M2 12C2 11.4477 2.44772 11 3 11H6C6.55228 11 7 11.4477 7 12C7 12.5523 6.55228 13 6 13H3C2.44772 13 2 12.5523 2 12Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M15.5355 8.46449C15.145 8.07397 15.145 7.4408 15.5355 7.05028L17.6568 4.92896C18.0473 4.53843 18.6805 4.53843 19.071 4.92896C19.4615 5.31948 19.4615 5.95265 19.071 6.34317L16.9497 8.46449C16.5592 8.85502 15.926 8.85502 15.5355 8.46449Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M4.92903 19.0711C4.53851 18.6805 4.53851 18.0474 4.92903 17.6568L7.05035 15.5355C7.44088 15.145 8.07404 15.145 8.46456 15.5355C8.85509 15.926 8.85509 16.5592 8.46456 16.9497L6.34324 19.0711C5.95272 19.4616 5.31955 19.4616 4.92903 19.0711Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M8.46443 8.46446C8.07391 8.85499 7.44074 8.85499 7.05022 8.46446L4.9289 6.34314C4.53837 5.95262 4.53837 5.31945 4.9289 4.92893C5.31942 4.5384 5.95259 4.5384 6.34311 4.92893L8.46443 7.05025C8.85496 7.44077 8.85496 8.07394 8.46443 8.46446Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M19.0711 19.071C18.6806 19.4616 18.0474 19.4616 17.6569 19.071L15.5356 16.9497C15.1451 16.5592 15.1451 15.926 15.5356 15.5355C15.9261 15.145 16.5593 15.145 16.9498 15.5355L19.0711 17.6568C19.4616 18.0473 19.4616 18.6805 19.0711 19.071Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M12 17C12.5523 17 13 17.4477 13 18V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V18C11 17.4477 11.4477 17 12 17Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M12 2C12.5523 2 13 2.44772 13 3V6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6V3C11 2.44772 11.4477 2 12 2Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path  d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" undefined="1"></path>
    </svg>
{/if}