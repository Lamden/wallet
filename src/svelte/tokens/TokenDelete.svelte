<script>
    import { getContext } from 'svelte';

    //Images
    import caution from '../../img/menu_icons/icon_caution.svg';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

	//Context
    const { switchPage } = getContext('app_functions');
    const { token, home, setPage } = getContext('tokenmodify_functions');

</script>

<style>
.token-delete{
    background: inherit;
}

.buttons{
    align-items: center;
    margin: 2rem 0 1rem;
}

</style>

<div class="token-delete">
    <h2> {`Delete ${token.tokenName} (${token.tokenSymbol})`}  </h2>
    <p class="text-body1">Are you sure?</p>
    <div class="buttons flex-column">
        <Button 
            id={"back-btn"}
            classes={'button__solid buttom__primary'} 
            width={'260px'}
            margin={'10px 0 0 0'}
            name="No" 
            click={home} />  
        <Button 
            id={"delete-token-btn"}
            classes={'button__solid button__red'} 
            width={'260px'}
            margin={'10px 0 0 0'}
            name="YES DELETE" 
            click={() => setPage(3)} />  
    </div>
</div>