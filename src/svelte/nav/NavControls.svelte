<script>
    import { themes } from '../../js/themes.js'

	//Stores
	import { SettingsStore, themeStyle, pageLoaded } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../../js/router.js'
    const { Switch } = Components;

    function toggleTheme(event) {
        console.log('event: ' + event.detail)
		SettingsStore.update(current => {
            current.themeStyle = event.detail ? 'light' : 'dark';
            document.querySelector("html").style = themes[current.themeStyle];
            console.log('set as: ' + current.themeStyle)
            return current;
        })   
    }
    
</script>

<style>
.box{
    display: flex;
    justify-items: center;
    align-items: center;
    padding: 0 92px 0 30px;
}
</style>

<div class="box">
    <Switch checked={$themeStyle === 'dark'} on:toggleState={toggleTheme}  }/>
</div>