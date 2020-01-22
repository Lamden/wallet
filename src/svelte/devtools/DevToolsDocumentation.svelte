<script>
    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';
    import github_bg from '../../img/backgrounds/github_bg.png';

	//Components
	import { Components }  from '../Router.svelte'
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
            <Card {cardInfo} width={'350px'}/>
        {/each}
    </div>
</div>
 
