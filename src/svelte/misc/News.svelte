<script>
    import { getContext, onMount } from 'svelte';

    // Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    // icons
    import FeatureIcon from '../icons/whatsnew/FeatureIcon.svelte';
    import FixIcon from '../icons/whatsnew/FixIcon.svelte';
    import AnnounceIcon from '../icons/whatsnew/AnnounceIcon.svelte';

    //Stores
	import { EventsStore } from '../../js/stores/stores.js';

    //Context
    const { switchPage } = getContext('app_functions');

    $: news = createNews($EventsStore);


    onMount(() => {
        if (Array.isArray($EventsStore)) {
            $EventsStore.forEach(e => EventsStore.setEventStatus(e.version, true))
        }
    })

    const createNews = (eventsStore) => {
        let arr = [];
        if (Array.isArray(eventsStore)) {
            eventsStore.forEach(data => {
            arr.push({
                ...data,
                logo: data.type === "announcement" ? "announce" : data.type === "hotfix" ? "fix" : "feature"
            })
            });
        }
        let list = arr.sort((a,b)=>{ return b.version.replace('.', '')-a.version.replace('.', '')})
        return list;
    }

    const newsIcons = {
        feature: FeatureIcon,
        fix: FixIcon,
        announce: AnnounceIcon,
    }

    const btnAction = (link) => {
        if (link.startsWith("deep:")) {
            let page = link.replace('deep:', '')
            if (page === "LockScreen") {
                chrome.runtime.sendMessage({type: 'lockWallet'});
                return
            }
            switchPage(page)
        } else {
            window.open(link, "_blank")
        }
    }
    
    const formatTimestamp = (timeStamp) => {
        const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Spt","Oct","Nov","Dec"];
        const date = new Date(timeStamp);
        return `${month[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }
</script>

<div class="wrap">
    <div class="header text-body1 divider">
        <div class="header-name text-primary weight-800">What's New</div>
    </div>	
    {#each news as item}
        <div class="flex news">
            <div class="news-logo">
                <svelte:component this={newsIcons[item.logo]} width={30}/>
            </div>
            <div class="news-content">
                <div class="text-body1 news-title weight-400">{item.title}</div>
                <div class="text-body2 text-primary news-desc">
                    <div class="news-info">
                        <div>{formatTimestamp(item.date_added)}</div>
                        {#if item.version}
                            <div>Version: {item.version}</div>
                        {/if}
                    </div>
                    <div class="body-items">
                        {#each item.body as body}
                            <p>{body}</p>
                        {/each}
                    </div>

                    {#if item.new_features}
                        <h4>New Features</h4>
                        <div class="msg">
                            <ul>
                            {#each item.new_features as feature }
                                <li><p>{feature}</p></li>
                            {/each}
                            </ul>
                        </div>
                    {/if}
                    {#if item.changes}
                        <h4>Changes</h4>
                        <div class="msg">
                            <ul>
                            {#each item.changes as change }
                                <li><p>{change}</p></li>
                            {/each}
                            </ul>
                        </div>
                    {/if}
                    {#if item.fixes}
                        <h4>Bug Fixes</h4>
                        <div class="msg">
                            <ul>
                            {#each item.fixes as fix }
                                <li><p>{fix}</p></li>
                            {/each}
                            </ul>
                        </div>
                    {/if}
                    </div>
                <div class="news-buttons">
                    {#each item.buttons as btn}
                        <Button
                            width={'232px'}
                            margin={'0 10px 30px 0'}
                            classes={`button__solid button__${btn.class}`}
                            name={btn.name}
                            click={ ()=> btnAction(btn.link)}
                        >
                        </Button>
                    {/each}
                </div>
            </div>
        </div>
    {/each}
</div>

<style>
    h4{
        margin-bottom: 0;
    }
    .wrap{
        padding-left: 35px;
    }
    .divider{
		border-bottom: 1px solid var(--divider-light);
    }
    .body-items{
        margin-bottom: 2em;
    }
    .news{
        margin-top: 2em;
        padding-top: 0;
    }
    .news-logo{
        margin-right: 9px;
        margin-left: 9px;
        padding-top: 5px;
    }
    .news-title{
        height: 40px;
        line-height: 40px;
        font-size: var(--text-body1);
        font-weight: 300;
    }
    .news-desc{
        margin-bottom: 2em;
        line-height: 20px;
        width: 85%;
        
    }
    .news-content{
        flex: 1;
        padding: 0 0 0 37px;
        border-bottom: 2px dashed var(--divider-dark);
    }
    .news-info{
        margin-bottom: 2em;
        color: var(--font-secondary);
    }
    .header{
        line-height: 24px;
    }
    .header-name{
        margin-left: 77px;
        margin-bottom: 1rem;
        margin-top: 1rem;
        font-size: var(--text-body1);
    }
    .news-buttons{
        display: flex;
        flex-wrap: wrap;
    }
    ul{
        margin-top: 0;
        color: var(--font-secondary);
    }

    @media screen and (max-width: 830px) {
        .wrap{
            padding-left: 0;
        }
    }
</style>