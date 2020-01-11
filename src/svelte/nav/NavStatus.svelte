<script>
    export let status

    $: online = status;
</script>



<style>
.checking{
    color: var(--font-primary-darker);
}
.online{
    color:green;
}
.offline{
    color:red;
}
</style>

<div class="online" class:checking={status=== 'checking'} class:online={status=== 'online'} class:offline={status=== 'offline'}>{online}</div>