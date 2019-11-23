<script>
	//Components
	import { FirstRun }  from '../../js/router.js'
    import NavLogo from '../nav/NavLogo.svelte';

    let Steps = [
        {page: 'FirstRunIntro'},
        {page: 'FirstRunCreatePW'},
        {page: 'FirstRunRestore'},
        {page: 'FirstRunTOS'},
    ]
    let currentStep = 0;

    function changeStep(event){
        currentStep = event.detail;
    }
</script>

<style>
.layout{
    display: flex;
    flex-direction: column;
    padding-left: 218px;
    padding-top: 140px;
}

.content{
    flex-grow: 1;
}

.header{
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
    right: 0;
    height: 97px;
    border-bottom: 1px solid #3D3D3D;
}

.steps{
    height: 125px;
}
</style>

<div class="layout">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <svelte:component this={FirstRun[Steps[currentStep].page]} on:toggleStep={changeStep}/>
    </div>
    <div class="steps">
        
    </div>
</div>

