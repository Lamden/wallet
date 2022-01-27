<script>
    import { getContext } from 'svelte'; 

    import { LeftSideFullPage } from '../Router.svelte'

    //Components
	import { Components }  from '../Router.svelte'

    const { Button } = Components;

    //Context
    const { done, getMessage } = getContext('networks_functions');

    let message = getMessage();
</script>

<style>
    .desc{
        line-height: 24px;
    }
</style>
<LeftSideFullPage title={message.left.title} helpLink="/wallet/network_overview">
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            {message.left.content}
        </div>
    </div>
<div slot="content" class="flex-column flex-align-center">
    <h6 class="text-green">{message.right.title}</h6>
    <Button
        id={'finish-btn'} 
        width={'347px'}
        margin={'0 0 .625rem 0'}
        classes={'button__solid button__primary'}
        name={"Finish"}
        click={done}
    />
</div>
</LeftSideFullPage>