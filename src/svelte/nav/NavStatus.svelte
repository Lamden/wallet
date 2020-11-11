<script>
    export let status
</script>

<style>
.checking{
    color: var(--font-secondary);
}
.online{
    color:green;
}
.offline{
    color:red;
}
</style>

{#await status}
    <div class="checking">{'checking'}</div>
{:then online}
    <div class="online" class:online={online=== 'online'} class:offline={online=== 'offline'}>{online}</div>
{/await}