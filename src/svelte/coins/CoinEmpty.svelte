<script>
    import { getContext } from 'svelte';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

    //Context
    const { switchPage } = getContext('app_functions');
</script>

<style>
.buttons{
    display: flex;
    justify-content: center;
    margin-top: 167px;
}
</style>

<div class="buttons">
    <Button classes={'button__solid button__purple'}
            styles={'margin-right: 23px;'}
            width={'232px'}
            name="Create A Wallet" 
            click={() => switchPage('CoinAdd')} />
    <Button classes={'button__solid'} 
            width={'232px'}
            name="Restore a Wallet" 
            click={() => switchPage('Restore')} />
</div>