<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;
    
    function dispatchState(step) {
        dispatch('toggleStep', step);
    }
</script>

<style>
.page{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 280px;
    padding: 16px 24px 0 24px;
}

.heading{
    margin-bottom: 16px;
}

.text-box{
   height: 144px;
   margin-bottom: 20px;
}

a{
    margin-top: 10px;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.4px;
    text-decoration: unset;
    color: #D1D1D1;
}

</style>

<div class="page">
    <h6 class="heading">Welcome!</h6>
    <div class="text-box text-body1">
        Creating a wallet is easy and secure. It's stored in the user’s browser, not on remote servers.
    </div>
    <Button style={'button__solid button__purple'}
            height={'36px'}
            styles={'margin-bottom: 16px;'}
            name="Create A Wallet" 
            click={() => dispatchState(1)} />
    <Button style={'button__solid'} 
            height={'36px'}
            styles={'margin-bottom: 16px;'}
            name="Restore a Wallet" 
            click={() => dispatchState(2)} />
    <a href="https://www.lamden.io" target="_blank" rel="noopener noreferrer" >Learn More About Lamden</a>
</div>