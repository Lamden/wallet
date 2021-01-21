<script>
    import { getContext } from 'svelte'
    
    //Stores
    import { currentThemeName } from '../../js/stores/stores'

</script>

<style>
    path{
        fill: var(--font-primary);
    }
</style>

{#if $currentThemeName === "light"}
    <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38"  d="M20.005 14.5567C19.605 15.6664 18.965 16.696 18.075 17.5858C14.855 20.8047 9.635 20.8047 6.415 17.5858C3.195 14.3668 3.195 9.14839 6.415 5.9294C7.305 5.03968 8.335 4.39988 9.445 4C8.395 6.90909 9.035 10.288 11.375 12.6273C13.715 14.9666 17.095 15.6064 20.005 14.5567Z"></path>
    </svg>
{:else}
    <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
        <path  d="M20.005 14.5567C19.605 15.6664 18.965 16.696 18.075 17.5858C14.855 20.8047 9.635 20.8047 6.415 17.5858C3.195 14.3668 3.195 9.14839 6.415 5.9294C7.305 5.03968 8.335 4.39988 9.445 4C8.395 6.90909 9.035 10.288 11.375 12.6273C13.715 14.9666 17.095 15.6064 20.005 14.5567Z" undefined="1"></path>
    </svg>
{/if}