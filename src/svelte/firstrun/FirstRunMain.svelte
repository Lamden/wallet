<script>
    import { FirstRun }  from '../../js/router.js'
    import { firstRun } from '../../js/stores.js';

    let pageNumber = 0;
    let currentPage = 'FirstRunIntro';

    function switchPage(page){
        currentPage = page;
    }

</script>

<svelte:component this={ FirstRun.pages[currentPage]} {switchPage} />