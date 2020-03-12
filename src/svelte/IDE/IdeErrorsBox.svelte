<script>
	//Images
    import close from '../../img/menu_icons/icon_close.svg';
	
	//Props
	export let lintErrors;

	$:errors = reformatErrorList(lintErrors);
	$:errorsLength = errors.length;

	const reformatErrorList = (errors) => {
        let errorsList = ['Contract is Okay'];
        if (errors === undefined) return errorsList;
		if (errors.violations === null) return errorsList;
		if (errors.violations === undefined){
			errorsList = [errors];
			return errorsList;
		}
		if (errors.violations.args !== undefined){
			if (errors.violations.lineno){
				errorsList = [`Line[${errors.violations.lineno}:${errors.violations.offset}]: ${errors.violations.msg}`];
			}else{
				errorsList = errors.violations.args;
			}
			return errorsList
		}
		errorsList = errors.violations;
        return errorsList;
	}

	const closeBox = () => {
		errors = []
	}
</script>

<style>
.errors-box{
	padding: 4px 17px;
	color: black;
}
.no-errors{
    background: #52ff52;
    border: 2px solid green;
}
.errors{
    background: #fd3b3b;
    border: 2px solid red;
}
.close{
    cursor: pointer;
    position: relative;
    left: calc(100% - 6px);
    width: 18px;
    top: 2px;
    margin-bottom: -22px;
}

</style>

{#if errorsLength > 0}
	<div class="errors-box flex-column text-body2"
		 class:no-errors={lintErrors.violations === null}
		 class:errors={lintErrors.violations !== null}
	>
		<div class="close" on:click={closeBox}>{@html close}</div>
		{#each errors as error}
			<div>{error}</div>
		{/each}
	</div>
{/if}