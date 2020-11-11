<script>    
    import whitelabel from '../../../whitelabel.json'

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

    let version = chrome.runtime.getManifest().version;

    const openLink = (url) => {
        window.open(url, '_blank');
    }
    
    const icons = {twitter, facebook, medium, telegram, reddit,github}

</script>

<style>
.box{
    display: flex;
    flex-direction: column;
}

.about-box{
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
    <p class="text-body3"><strong>Version</strong> {version}</p>
    <div class="about-box"> 
        {#each whitelabel.aboutPage.links as cardInfo}
            <Card {cardInfo} width={'100%'} noPic={true}/>
        {/each}
    </div>
    <div class="social-box">
        {#each whitelabel.aboutPage.socials as social}
            <div class="social-icon" class:facebook={social.name === 'Facebook'} on:click={() => openLink(social.link)}>{@html icons[social.icon]}</div>
        {/each}
    </div>
</div>
