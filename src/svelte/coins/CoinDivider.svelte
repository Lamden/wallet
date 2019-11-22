<script>
</script>

<style>
.divider-box{
    display: flex;
    flex-direction: row;
    height: 1px;
    margin: 1px 0;
}

.divider{
    display: flex;
}

.name{
	width: 234px;
}

.name:after {
    content: "";
    margin-left: 63px;
    width: 100%;
    border-bottom: 1px dashed rgba(224, 224, 224, 0.16);
}

.amount{
	flex-grow: 1;
}

.amount:after {
    content: "";
    margin-right: 17%;
    width: 100%;
    border-bottom: 1px dashed rgba(224, 224, 224, 0.16);
}

.percent{
	justify-content: flex-end;
	width: 203px;
}

.percent:after {
    content: "";
    width: 100%;
    border-bottom: 1px dashed rgba(224, 224, 224, 0.16);
}
</style>

<div class="divider-box">
    <div class="name divider"></div>
    <div class="amount divider"></div>
    <div class="percent divider"></div>
</div>
