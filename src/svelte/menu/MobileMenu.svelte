<script>
    // Components
    import { Menu, NavControls } from '../Router.svelte'

    // Icons
    import HamburgerIcon from "../icons/Hamburger.svelte"

    //Images
    import heart from "../../img/menu_icons/icon_heart.svg";

    // Misc
    import { menu_open } from '../../js/stores/stores.js'


    menu_open.subscribe((curr) => {
        if (curr){
            document.body.style.position = 'fixed';
            document.body.style.top = `-${window.scrollY}px`;
        }else{
            document.body.style.position = '';
            document.body.style.top = '';
        }
    })

</script>

<div class="hamburger" class:adjust-width={$menu_open}>
    <HamburgerIcon />
</div>


<div class="mobile-menu" class:show={$menu_open}>
    <NavControls />
    <Menu />
    <div class="footer flex-row flex-align-center">
        {"Made with"}
        <div class="heart">{@html heart}</div>
        {"by Lamden"}
    </div>
</div>

<style>
    .mobile-menu{
        z-index: 999;
        display: none;
        position: fixed;
        width: 100%;
        height: 101vh;
        overflow-x: scroll;
        background-color: var(--bg-primary);
        color: var(--font-primary);
    }
    .show{
        display: block;
    }
    .hamburger{
        z-index: 1000;
        position: fixed;
        top: 15px;
        right: 15px;
    }
    .hamburger.adjust-width{
        right: 30px;
    }
    .footer{
        text-align: center;
        margin: 30px 0;
        justify-content: center;
    }
    .heart {
        margin: 0 4px;
        position: relative;
        width: 13px;
        top: 1px;
    }

    @media screen and (max-width: 830px) {
        .hamburger.adjust-width{
            right: 0;
        }
	}
</style>

