<script>
    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    export let title = "";

    const openHelpLink = () => {
        window.open(helpLink, '_blank');
    }
</script>
<style>
    .leftside{
        position: absolute;
        left: 0;
        top: 97px;
        height: 100%;
        width: 500px;
        background: var(--bg-secondary);
        padding: 0 78px;
        box-sizing: border-box;
    }
    .content{
        margin-top: 132px;
    }
    h6{
        font-size: 20px;
        margin-bottom: 0.8rem;
        line-height: 28px;
        font-weight: 500;
    }
</style>
<div class="leftside">
    <div class="content">
        <h6>{title}</h6>
        <slot name="body"></slot>
        <Button
            id={'helpfaq'} 
            width={'215px'}
            height={'36px'}
            margin={'2rem 0 .625rem 0'}
            classes={'button__solid button__primary'}
            name={"Help & FAQ"}
            click={openHelpLink}
        />
    </div>
</div>