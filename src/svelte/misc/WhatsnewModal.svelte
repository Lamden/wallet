<script>
    import { getContext } from 'svelte';

    // icons
    import FeatureIcon from '../icons/whatsnew/FeatureIcon.svelte';
    import FixIcon from '../icons/whatsnew/FixIcon.svelte';
    import AnnounceIcon from '../icons/whatsnew/AnnounceIcon.svelte';

    
    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { closeModal, switchPage , getModalData } = getContext('app_functions');

    const newsIcons = {
        feature: FeatureIcon,
        fix: FixIcon,
        announce: AnnounceIcon,
    }

    $: event = getModalData();

    const getLogo = () => {
        return event.type === "announcement" ? "announce" : event.type === "hotfix" ? "fix" : "feature"
    }

</script>

<style>
    h2{
        margin: 1rem 0 0rem;
    }
    .notification{
        width: 530px;
        align-items: center;
    }
    .msg{
        margin: 2em 0 0;
        text-align: center;
    }
    .buttons{
        flex-grow: 1;
        flex-direction: column;
        display: flex;
        padding-top: 2em;
        justify-content: center;
        align-items: center;
    }
    .logo{
        margin-top: 0.75rem;
    }
    .version{
        margin: 0;
    }
    h2{
        margin-bottom: 0;
    }
    p{
        margin: 0 0 1em;
    }
</style>

<div class="notification flex-column">
    <div class="logo">
        <svelte:component this={newsIcons[getLogo()]} width={50}/>
    </div>
    <h2>
        {event.title} 
    </h2>
    {#if event.version}
        <p class="version text-secondary text-center text-body1"> {`v${event.version}`}</p>  
    {/if}

    {#if event.body}
    <div class="text-body1 msg">
        {#each event.body as body}
            <p>{body}</p>
        {/each}
    </div>
    {/if}
    <div class="buttons">
            <Button
                width={'232px'}
                margin={'0 0 1.5em 0'}
                classes={`button__solid button__primary`}
                name={"More Info"}
                click={ ()=> switchPage("News")}
            >
            </Button>
            <Button
                id={'ignore-btn'} 
                width={'232px'}
                margin={'0'}
                classes={'button__solid button__secondary'}
                name="Close"
                click={closeModal}
            >
            </Button> 
    </div>
</div>