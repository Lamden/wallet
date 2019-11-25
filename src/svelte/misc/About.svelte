<script>
    import { onMount } from 'svelte';

    //Stores
	import { breadcrumbs } from '../../js/stores/stores.js';

    onMount(() => {
        breadcrumbs.set([
            {name: 'About', page: {name: ''}},
        ]);
    });

</script>

<div class="about text-primary">
    <h5>About</h5>
</div>