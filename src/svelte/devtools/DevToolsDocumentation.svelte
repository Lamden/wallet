<script>
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';
    import github_bg from '../../img/backgrounds/github_bg.png';

	//Components
	import { Components }  from '../Router.svelte'
    const { Card } = Components;
    
    let docoLinks = [
        {
            name: 'Documentation Site',
            desc: 'For users and developers',
            url: 'https://docs.lamden.io/',
            image: hero_bg
        },
        {
            name: 'Lamden Blockchain',
            desc: 'Our blockchain technology',
            url: 'https://github.com/Lamden/lamden',
            image: github_bg
        },
        {
            name:'Contracting',
            desc:'Write smart contracts in Python',
            url:'https://contracting.lamden.io/',
            image: hero_bg
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
 
