<script>
</script>

<style>
.divider-box{
    display: flex;
    flex-direction: row;
    margin: 0;
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
    border-bottom: 1px dashed var(--divider-dark);
}

.amount{
	flex-grow: 1;
}

.amount:after {
    content: "";
    padding-left: 1px;
    width: 100%;
    border-bottom: 1px dashed var(--divider-dark);
}

.percent{
	justify-content: flex-end;
	width: 203px;
}

.percent:after {
    content: "";
    width: 100%;
    border-bottom: 1px dashed var(--divider-dark);
}
</style>

<div class="divider-box">
    <div class="name divider"></div>
    <div class="amount divider"></div>
    <div class="percent divider"></div>
</div>
