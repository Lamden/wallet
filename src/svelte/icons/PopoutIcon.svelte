<script>
    export let width;
    export let color = "var(--font-primary)";
    export let url = false

    $: height = width;

    function openURL(){
        if (url){
            window.open(url, '_blank')
        }
    }

</script>

<style>
    div:hover > svg > path{
        fill: var(--accent-color);
    }
    div:hover{
        cursor: pointer;
    }
</style>

<div on:click={openURL}>
    <svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
        <path fill={color} d="M13 2C13 1.44772 12.5523 1 12 1C5.94772 1 1 5.94772 1 12C1 18.0523 5.94772 23 12 23C18.0523 23 23 18.0523 23 12C23 11.4477 22.5523 11 22 11C21.4477 11 21 11.4477 21 12C21 16.9477 16.9477 21 12 21C7.05229 21 3 16.9477 3 12C3 7.05228 7.05229 3 12 3C12.5523 3 13 2.55228 13 2Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path fill={color} d="M20.7071 3.29289C20.3166 2.90237 19.6834 2.90237 19.2929 3.29289L10.2929 12.2929C9.90237 12.6834 9.90237 13.3166 10.2929 13.7071C10.6834 14.0976 11.3166 14.0976 11.7071 13.7071L20.7071 4.70711C21.0976 4.31658 21.0976 3.68342 20.7071 3.29289Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        <path fill={color} d="M21 4C21 3.44772 20.5523 3 20 3H15.5C14.9477 3 14.5 3.44772 14.5 4C14.5 4.55228 14.9477 5 15.5 5H19V8.5C19 9.05228 19.4477 9.5 20 9.5C20.5523 9.5 21 9.05228 21 8.5V4Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
    </svg>
</div>