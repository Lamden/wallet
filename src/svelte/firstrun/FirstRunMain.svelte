<script>
    //Components
    import { FirstRun }  from '../../js/router.js'


    let pageNumber = 0;
    let currentPage = 'FirstRunIntro';

    function switchPage(page){
        currentPage = page;
    }

</script>

<svelte:component this={ FirstRun.pages[currentPage]} {switchPage} />