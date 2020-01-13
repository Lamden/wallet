<script>
    export let lintErrors;

	function reformatErrorList(errors){
        let errorsList = [];
        if (errors === undefined) {return errorsList;}
		if (errors.violations === null){
			errorsList = [];
			return errorsList;
		}
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
</script>

<style>
.error-line{
    color: red;
    
}

</style>

<div class="flex-column text-body1">
    {#if reformatErrorList(lintErrors).length === 0}
        <div class="no-errors">{'No Errors'}</div>
    {:else}
        {#each reformatErrorList(lintErrors) as error}
            <div class="error-line">{error}</div>
        {/each}
    {/if}
</div>