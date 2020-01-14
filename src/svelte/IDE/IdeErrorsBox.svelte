<script>
    export let lintErrors;

	function reformatErrorList(errors){
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
</script>

<style>
.errors-box{
	padding: 17px;
}
.error-line{
    color: red;
}

</style>

<div class="errors-box flex-column text-body2">
	{#each reformatErrorList(lintErrors) as error}
		<div class:error-line={reformatErrorList(lintErrors)[0] !== 'Contract is Okay'}>{error}</div>
	{/each}
</div>