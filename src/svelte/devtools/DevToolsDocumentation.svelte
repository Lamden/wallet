<script>
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';
    import github_bg from '../../img/backgrounds/github_bg.png';

	//Components
	import { Components }  from '../Router.svelte'
    const { Card } = Components;
    
    let docoLinks = [
        {
            name: 'Lamden-js',
            desc: 'Our blockchain technology',
            url: 'https://github.com/Lamden/cilantro-enterprise',
            image: github_bg
        },
        {
            name:'Contracting',
            desc:'Write smart contracts in Python',
            url:'https://contracting.lamden.io/',
            image: hero_bg
        },
        {
            name: 'Mockchain',
            desc: 'Run a local blockchain',
            url: 'https://github.com/Lamden/mockchain',
            image: github_bg
        },
        {
            name: 'Lampy',
            desc: 'Lamden blockchain client for Python',
            url: 'https://github.com/Lamden/lampy',
            image: github_bg
        },
        {
            name: 'Lamden-js',
            desc: 'Lamden blockchain client for Javascript',
            url: 'https://github.com/Lamden/lamden-js',
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
 
