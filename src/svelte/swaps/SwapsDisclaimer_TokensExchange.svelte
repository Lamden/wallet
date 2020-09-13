<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, InputBox } = Components;

    //Context
    const { changeStep, setLamdenWallet } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let notScrolled = true;
    let read_and_confirmed = false;
    let inputElm;

    const legalText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla id cursus leo, dictum sollicitudin mauris. Nunc hendrerit odio eu blandit facilisis. Praesent venenatis eget nisl sed egestas. Cras quis purus ut enim malesuada posuere. Nulla posuere, quam quis dapibus tincidunt, felis quam accumsan augue, vel euismod nibh nulla nec nulla. In rhoncus dui eget faucibus ullamcorper. Morbi quis elit vestibulum nunc maximus posuere ac quis nisi. Aliquam erat volutpat. Duis elit turpis, pellentesque bibendum mollis ac, iaculis nec tellus.

Nunc id nisi elementum, molestie orci vel, venenatis mi. Curabitur sit amet tempor lacus, eu sodales erat. Nullam sodales, mauris at venenatis varius, augue orci maximus urna, eget iaculis sapien mauris nec ipsum. In aliquam lectus vel molestie pharetra. Nullam quam odio, rhoncus nec purus vel, vulputate lobortis lectus. Donec ut augue odio. Suspendisse consectetur lectus non enim sodales convallis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur rhoncus libero sit amet pellentesque mollis. Pellentesque leo ipsum, pulvinar ac est non, auctor tempus ex. Vivamus dignissim mi augue, et ullamcorper justo varius vitae.

Nam pretium ultrices tempor. Maecenas eu dictum sapien. Integer aliquam eget ante id rutrum. Pellentesque vehicula egestas mi id feugiat. Sed aliquet elit et tellus laoreet malesuada. Fusce rutrum posuere diam quis maximus. Nunc id turpis finibus, molestie orci non, dictum dui.

Nunc non sagittis enim. Mauris non diam lacinia, mollis felis ut, vehicula sapien. Morbi egestas, urna eget luctus pellentesque, quam sapien vestibulum lacus, at egestas augue quam et sem. Sed ut est sed magna suscipit fermentum. Morbi vitae odio nec tortor pharetra vulputate. Sed neque lacus, accumsan non faucibus id, mollis et turpis. Morbi vitae eleifend nunc. Fusce dapibus eu lectus at interdum.

Morbi a orci sem. In tincidunt pellentesque tellus. Aliquam ac congue neque, et vehicula massa. Aliquam sed tempus lacus, eu imperdiet magna. Quisque sed neque ac ante interdum imperdiet a at ligula. Nullam efficitur urna diam, in porta quam tristique ac. Duis facilisis interdum sapien et luctus. Fusce hendrerit risus turpis. Mauris suscipit rutrum felis, in pharetra dui pulvinar in. Pellentesque tempor libero purus, non mollis lectus aliquet eu. Sed molestie lacinia nibh a vestibulum. Pellentesque quis quam a odio dignissim consectetur. Proin sodales sem in ultricies blandit.`

    const nextPage = () => changeStep(2)

    const handleScroll = (e) => {
        if (inputElm.scrollHeight - inputElm.scrollTop === inputElm.clientHeight) notScrolled = false
    }

    
</script>

<style>
h3{
    margin: 0 0 1rem;
}
.flow-content-right{
    max-width: 80%;
    align-items: flex-start;
    
}
.accepted{
    color: var(--font-success)
}
.not-accepted{
    color: var(--font-warning)
}
.chk-checkmark{
    top: -3px;
}
.chk-container{
    font-size: 15px;
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Offer for Exchange</h6>
    
        <p class="flow-text-box text-body1 text-primary">
            Please read and <strong class="text-cyan">scroll text all the way to the bottom</strong>, check the box to accept terms and click the button to proceed.
        </p>

        <div class="flex-column flow-buttons">
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Proceed"}
                    disabled={!read_and_confirmed}
                    click={nextPage} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => switchPage('Swaps')} />  
         </div>
    </div>
    <div class="flex-column flow-content-right" in:fade="{{delay: 0, duration: 200}}">
        <h3>TOKENS EXCHANGE - Invitation to present an offer for exchange</h3> 
        <InputBox 
            inputType="textarea"
            bind:thisInput={inputElm}
            value={legalText}
            margin="-1rem 0 2rem"
            rows="19"
            on:scroll={handleScroll}
            readonly={true}
        />
        <div class="checkbox-box">
            <label  class="chk-container" 
                    id="chk-all" 
                    class:text-primary-dark={notScrolled} 
                    class:not-accepted={!read_and_confirmed && !notScrolled} 
                    class:accepted={read_and_confirmed && !notScrolled}>
                <input  type="checkbox" bind:checked={read_and_confirmed} disabled={notScrolled}>
                <span class="chk-checkmark"></span>
                I request the exchange of my TAU Lamden tokens and wish to proceed
            </label>
        </div>
    </div>
</div>

