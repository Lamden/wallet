<script>
    // MISC
    import { menu_open } from '../../js/stores/stores.js'

    function toggle(){
        if ($menu_open) menu_open.set(false)
        else menu_open.set(true)
    }
</script>

<div id="nav-icon2" class:open={$menu_open} on:click={toggle}>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
</div>

  <style>
    * {
        margin: 0;
        padding: 0; 
    }

    /* Icon 1 */

    #nav-icon2 {
        width: 60px;
        height: 45px;
        -webkit-transform: rotate(0deg) scale(0.7);
        -moz-transform: rotate(0deg) scale(0.7);
        -o-transform: rotate(0deg) scale(0.7);
        transform: rotate(0deg) scale(0.7);
        -webkit-transition: .5s ease-in-out;
        -moz-transition: .5s ease-in-out;
        -o-transition: .5s ease-in-out;
        transition: .5s ease-in-out;
        cursor: pointer;
    }

    /* Icon 2 */

    #nav-icon2 span {
        display: block;
        position: absolute;
        height: 9px;
        width: 50%;
        background: var(--font-overlay);
        opacity: 1;
        -webkit-transform: rotate(0deg);
        -moz-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        transform: rotate(0deg);
        -webkit-transition: .25s ease-in-out;
        -moz-transition: .25s ease-in-out;
        -o-transition: .25s ease-in-out;
        transition: .25s ease-in-out;
    }

    #nav-icon2 span:nth-child(even) {
        left: 50%;
        border-radius: 0 9px 9px 0;
    }

    #nav-icon2 span:nth-child(odd) {
        left:0px;
        border-radius: 9px 0 0 9px;
    }

    #nav-icon2 span:nth-child(1), #nav-icon2 span:nth-child(2) {
        top: 0px;   
    }

    #nav-icon2 span:nth-child(3), #nav-icon2 span:nth-child(4) {
        top: 18px;
    }

    #nav-icon2 span:nth-child(5), #nav-icon2 span:nth-child(6) {
        top: 36px;
    }

    #nav-icon2.open span:nth-child(1),#nav-icon2.open span:nth-child(6) {
        -webkit-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        transform: rotate(45deg);
    }

    #nav-icon2.open span:nth-child(2),#nav-icon2.open span:nth-child(5) {
        -webkit-transform: rotate(-45deg);
        -moz-transform: rotate(-45deg);
        -o-transform: rotate(-45deg);
        transform: rotate(-45deg);
    }

    #nav-icon2.open span:nth-child(1) {
        left: 5px;
        top: 7px;
    }

    #nav-icon2.open span:nth-child(2) {
        left: calc(50% - 5px);
        top: 7px;
    }

    #nav-icon2.open span:nth-child(3) {
        left: -50%;
        opacity: 0;
    }

    #nav-icon2.open span:nth-child(4) {
        left: 100%;
        opacity: 0;
    }

    #nav-icon2.open span:nth-child(5) {
        left: 5px;
        top: 29px;
    }

    #nav-icon2.open span:nth-child(6) {
        left: calc(50% - 5px);
        top: 29px;
    }
  </style>