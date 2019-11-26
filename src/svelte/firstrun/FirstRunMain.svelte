<script>
	//Components
    import { Components, FirstRun }  from '../../js/router.js'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    let SetupSteps = [
        {page: 'FirstRunIntro'},
        {page: 'FirstRunCreatePW'},
        {page: 'FirstRunRestore'},
        {page: 'FirstRunTOS'},
        {page: 'FirstRunGenWallets'},
        {page: 'FirstRunFinishing'},
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
    flex-grow: 1;
}

.content{
    flex-grow: 1;
    display: flex;
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
    display: flex;
    justify-content: center;
    height: 180px;
}
</style>

<div class="layout">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <svelte:component this={FirstRun[SetupSteps[currentStep].page]} on:toggleStep={changeStep}/>
    </div>
    <div class="steps">
        <Steps />
    </div>
</div>

