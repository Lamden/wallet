<script>
    //Images
    import { backgrounds, icons } from '../../js/images.js';
    const { github_bg, squares_bg } = backgrounds;

	//Components
	import { Components }  from '../../js/router.js'
    const { Card } = Components;
    
    let docoLinks = [
        {
            name:'Contracting',
            desc:'Write smart contracts in Python',
            url:'https://contracting.lamden.io/',
            image: squares_bg
        },
        {
            name: 'Mockchain',
            desc: 'Run a local Lamden testnet',
            url: 'https://github.com/Lamden/mockchain',
            image: github_bg
        },
        {
            name: 'Lampy',
            desc: 'Lamden blockchain client for Python',
            url: 'https://github.com/Lamden/lampy',
            image: github_bg
        }
    ]
</script>

<style>
.box{
    display: flex;
    flex-direction: column;
}

.doco-box{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 1rem;
}
</style>

<div class="box text-primary">
    <div class="doco-box"> 
        {#each docoLinks as cardInfo}
            <Card {cardInfo} width={'530px'}/>
        {/each}
    </div>
</div>
 
