<script>    
    import { onMount } from 'svelte';

	//Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

    //Images
    import { backgrounds, icons } from '../../js/images.js';
    const { github_bg, squares_bg } = backgrounds;
    const { twitter, facebook, medium, telegram, reddit, github, heart } = icons;

	//Components
	import { Components }  from '../../js/router.js'
    const { Card } = Components;

    function openLink(url){
        window.open(url, '_blank');
    }
    
    let aboutLinks = [
        {
            name:'Visit Our Website',
            desc:'Write smart contracts in Python',
            url:'https://www.lamden.io/',
            image: squares_bg
        },
        {
            name: 'Email Us',
            desc: 'Run a local Lamden testnet',
            url: 'mailto:team@lamden.io',
            image: squares_bg
        }
    ]

    let socials = [
        {   name: 'Twitter',
            link: 'https://twitter.com/lamdentau',
            image: twitter
        },
        {   name: 'Facebook',
            link: 'https://www.facebook.com/LamdenTau/?ref=py_c',
            image: facebook
        },
        {   name: 'Medium',
            link: 'https://blog.lamden.io/',
            image: medium
        },
        {   name: 'Telegram',
            link: 'https://t.me/lamdenchat',
            image: telegram
        },
        {   name: 'Reddit',
            link: 'https://www.reddit.com/r/lamden/',
            image: reddit
        },
        {   name: 'Github',
            link: 'https://github.com/Lamden/',
            image: github
        },
    ]

    onMount(() => {
        breadcrumbs.set([
            {name: 'About', page: {name: ''}},
        ]);
    });

</script>

<style>
.box{
    display: flex;
    flex-direction: column;
}

.about-box{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.social-box{
    display: flex;
    justify-content: space-evenly;
    width: 534px;
    margin: 70px auto;
}

.footer-box{
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 70px;
}

.heart{
    margin: 0 2px;
    position: relative;
    top: 1px;
}

</style>

<div class="about text-primary">
    <h5>About</h5>
</div>

<div class="box text-primary">
    <div class="about-box"> 
        {#each aboutLinks as cardInfo}
            <Card {cardInfo} width={'45%'} />
        {/each}
    </div>
    <div class="social-box">
        {#each socials as social}
            <img src={social.image} alt="{social.name}" on:click={() => openLink(social.url)}/>
        {/each}
    </div>
    <div class="footer-box">
        {'Made with'}
        <img class="heart" src={heart} alt="heart icon" />
        {'by Lamden'}
    </div>
</div>