<script>
    import { currentNetworkOnline } from '../../js/stores/stores'

    $: status = $currentNetworkOnline
    $: online = status === true
    $: offline = status !== true

</script>

<style>
div{
    padding-left: 6px;
}
.online{
    color:green;
}
.offline{
    color:red;
}
</style>

<div class="online" class:online={online} class:offline={offline}>{online ? "online" : "offline"}</div>
