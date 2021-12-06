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
    const { closeModal, switchPage , getModalData, resetBadger} = getContext('app_functions');

    const newsIcons = {
        feature: FeatureIcon,
        fix: FixIcon,
        announce: AnnounceIcon,
    }

    $: event = getModalData();

    const getLogo = () => {
        return event.type === "announcement" ? "announce" : event.type === "hotfix" ? "fix" : "feature"
    }

    const close = () => {
        resetBadger(event.id);
        closeModal()
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
        margin: 1.6rem 0 1rem 0;
        text-align: center;
    }
    .buttons{
        flex-grow: 1;
        flex-direction: column;
        display: flex;
        padding-top: 1rem;
        justify-content: center;
        align-items: center;
    }
    .logo{
        margin-top: 0.75rem;
    }
</style>

<div class="notification flex-column">
    <div class="logo">
        <svelte:component this={newsIcons[getLogo()]} width={50}/>
    </div>
    <h2>
        {event.title} 
        {#if event.version}
            {event.version}
        {/if}
    </h2>
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
                margin={'0 0 30px 0'}
                classes={`button__solid button__primary`}
                name={"More Info"}
                click={ ()=> switchPage("News")}
            >
            </Button>
            <Button
                id={'ignore-btn'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                classes={'button__solid button__secondary'}
                name="Close"
                click={close}
            >
            </Button> 
    </div>
</div>