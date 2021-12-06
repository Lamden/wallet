<script>
    import { getContext } from 'svelte';

    // Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    // icons
    import FeatureIcon from '../icons/whatsnew/FeatureIcon.svelte';
    import FixIcon from '../icons/whatsnew/FixIcon.svelte';
    import AnnounceIcon from '../icons/whatsnew/AnnounceIcon.svelte';

    //Stores
	import { EventsStore} from '../../js/stores/stores.js';

    //Context
    const { switchPage } = getContext('app_functions');

    $: news = createNews($EventsStore);

    const createNews = (eventsStore) => {
        let arr = [];
        eventsStore.forEach(data => {
            arr.push({
                ...data,
                logo: data.type === "announcement" ? "announce" : data.type === "hotfix" ? "fix" : "feature"
            })
        });
        return arr;
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

<style>
    .wrap{
        padding-left: 35px;
    }
    .divider{
		border-bottom: 1px solid var(--divider-light);
	}
    .news{
        margin-top: 0.5rem;
        padding-top: 0;
    }
    .news-logo{
        margin-right: 9px;
        margin-left: 9px;
        padding-top: 14px;
    }
    .news-title{
        height: 40px;
        line-height: 40px;
    }
    .news-desc{
        opacity: 0.54;
        margin-bottom: 1.5rem;
        line-height: 20px;
        width: 85%;
    }
    .news-content{
        flex: 1;
        padding: 0 0 0 37px;
        border-bottom: 2px dashed var(--divider-dark);
    }
    .news-date{
        margin-bottom: 1.5rem;
    }
    .news-version{
        margin-top: 1.5rem;
    }
    .header{
        line-height: 24px;
    }
    .header-name{
        margin-left: 77px;
        margin-bottom: 1rem;
        margin-top: 1rem;
        font-size: 22px;
    }
    .news-buttons{
        display: flex;
    }
</style>
<div class="wrap">
    <div class="header text-body1 divider">
        <div class="header-name text-primary weight-800">What's New</div>
    </div>	
    {#each news as item}
        <div class="flex news">
            <div class="news-logo">
                <svelte:component this={newsIcons[item.logo]} width={22}/>
            </div>
            <div class="news-content">
                <div class="text-body1 news-title weight-400">{item.title}</div>
                <div class="text-body2 text-primary news-desc">
                    <div class="news-date">{formatTimestamp(item.date_added)}</div>
                        {#each item.body as body}
                            <p>{body}</p>
                        {/each}
                        {#if item.version}
                            <div class="news-version">Version: {item.version}</div>
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