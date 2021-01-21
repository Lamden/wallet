<script>
    import { getContext } from 'svelte'
    
    //Stores
    import { currentThemeName } from '../../js/stores/stores'

    //Icons
    import LightMode from '../icons/Lightmode.svelte'
    import DarkMode from '../icons/Darkmode.svelte'
    
    const { themeToggle } = getContext('app_functions')
</script>

<style>
    .container{
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
    }
    .wrapper{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;

        width: 40px;
        height: 40px;
        border: 1px solid transparent;
        border-radius: 99px;
        padding: 2px;

        box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.5);

    }
    .wrapper:hover{
        top: 1px;
        background: var(--bg-secondary);
        border: 1px solid var(--outline);
        box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.5);
    }
    .wrapper:active{
        top: 2px;
        box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.5);
    }
    .icons{
        position: absolute;
        width: 75%;
        height: 75%;
        cursor: pointer;
        transition: 0.5s opacity;
        opacity: 0;
        
    }
    .wrapper:hover > .back{
        opacity: 1;
    }
    .wrapper:hover > .front{
        opacity: 0;
    }
    .front{
        opacity: 1;
    }
    .back{
        opacity: 0;
    }

</style>
<div class="container">
    <div class="wrapper">
        <div class="icons" 
                class:back={$currentThemeName === "dark"} 
                class:front={$currentThemeName === "light"} 
                on:click={themeToggle}>
            <LightMode />
        </div>

        <div class="icons" 
                class:back={$currentThemeName === "light"}
                class:front={$currentThemeName === "dark"}
                on:click={themeToggle}>
            <DarkMode />
        </div>
    </div>
</div>





