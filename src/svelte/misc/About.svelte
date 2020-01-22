<script>    
    import { onMount } from 'svelte';

	//Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';
    import github_bg from '../../img/backgrounds/github_bg.png';

    //Social Icons
    import twitter from '../../img/menu_icons/icon_twitter.svg';
    import facebook from '../../img/menu_icons/icon_facebook.svg';
    import medium from '../../img/menu_icons/icon_medium.svg';
    import telegram from '../../img/menu_icons/icon_telegram.svg';
    import reddit from '../../img/menu_icons/icon_reddit.svg';
    import github from '../../img/menu_icons/icon_github.svg';

	//Components
	import { Components }  from '../Router.svelte'
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
            desc: "What's on your mind?",
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
    align-items: center;
}

.social-icon{
    cursor: pointer;
    width: 45px;
}
.facebook{
    width: 22px;
}
</style>
<div class="box text-primary">
    <div class="about-box"> 
        {#each aboutLinks as cardInfo}
            <Card {cardInfo} width={'45%'} />
        {/each}
    </div>
    <div class="social-box">
        {#each socials as social}
            <div class="social-icon" class:facebook={social.name === 'Facebook'} on:click={() => openLink(social.link)}>{@html social.image}</div>
        {/each}
    </div>
</div>