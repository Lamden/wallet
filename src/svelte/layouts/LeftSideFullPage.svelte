<script>
    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    export let title = "";
    export let helpLink = "https://www.lamden.io";

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
    .side-content{
        margin-top: 51px;
    }
    h6{
        font-size: 20px;
        margin-bottom: 0.8rem;
        line-height: 28px;
        font-weight: 500;
    }
    .content{
        padding-top: 51px;
        margin-left: 500px;
        width: 100%;
    }
    .layout{
        flex-grow: 1;
        display: flex;
    }
</style>
<div class="layout">
    <div class="leftside">
        <div class="side-content">
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
    <div class="content layout-leftside-content">
        <slot name="content"></slot>
    </div>
</div>