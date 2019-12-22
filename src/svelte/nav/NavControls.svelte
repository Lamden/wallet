<script>
    import { getContext } from 'svelte';
    import { themes } from '../../js/themes.js';

	//Stores
	import { SettingsStore, networks, themeStyle } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../../js/router.js';
    const { Switch, DropDown } = Components;

    //Context
    const { switchPage } = getContext('app_functions');

    function toggleTheme(event) {
		SettingsStore.update(current => {
            current.themeStyle = event.detail ? 'light' : 'dark';
            document.querySelector("html").style = themes[current.themeStyle];
            return current;
        })   
    }

    function handleSelected(e){
        SettingsStore.setNetwork(e.detail.selected.value)
    }
</script>

<style>
.box{
    display: flex;
    justify-items: center;
    align-items: center;
    padding: 0 21px 0 30px;
}
</style>

<div class="box"><!--
    <DropDown 
        items={$networks}
        width={"250px"}
        label="Current Network"
        on:selected={(e) => handleSelected(e)} />
    <Switch checked={$themeStyle === 'dark'} on:toggleState={toggleTheme}  }/>
    -->
</div>