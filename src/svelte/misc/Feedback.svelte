<script>
    import { onMount } from 'svelte';

	//Stores
	import { breadcrumbs } from '../../js/stores/stores.js';

    onMount(() => {
        breadcrumbs.set([
            {name: 'Feedback', page: {name: ''}},
        ]);
    });

</script>

<div class="about text-primary">
    <h5>Feedback</h5>
</div>