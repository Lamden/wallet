<script>
    import { onMount, getContext } from 'svelte';
    import { fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    //Stores
    import { steps, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;

    //Utils
    import ClearingHouse_API from '../../js/crypto/clearingHouseAPI'

    //Context
    const { changeStep, setAnswers, getStepList } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let read_and_confirmed = false;
    let yourself_or_company = null;
    let permanent_establishment_in_switzerland = null;
    let domiciled_or_usually_staying = null;

    $: answeredAll = read_and_confirmed !== false && (yourself_or_company === true && domiciled_or_usually_staying !== null || yourself_or_company === false && permanent_establishment_in_switzerland !== null )

    onMount(() => {
        steps.set({
            currentStep: 1,
            stepList: getStepList()
        });
    })

    const nextPage = () => {
        setAnswers(constructAnswers())
        changeStep(1)
    }

    const constructAnswers = () => {
        return [
            'read_and_confirmed? ' + read_and_confirmed,
            yourself_or_company
            ? "Acting for yourself as a natural person holding TAU tokens"
            : "Acting on behalf of a company or a business which is holding TAU tokens.",
            yourself_or_company 
            ? `Are you domiciled or usually staying in Switzerland or Lichtenstein? ${domiciled_or_usually_staying ? "YES" : "NO"}`
            : `Do you have your place of business or a permanent establishment in Switzerland or Liechtenstein? ${permanent_establishment_in_switzerland ? "YES" : "NO"}`
        ]
    }

    const resetAnswers = () => {
        yourself_or_company = null;
        permanent_establishment_in_switzerland = null;
        domiciled_or_usually_staying = null;
    }

</script>

<style>
h3{
    margin-top: 2rem;
}
.flow-content-right{
    max-width: 80%;
    align-items: flex-start;
    
}
ul{
    list-style-type: none
}
li {
    margin: 0 0 1rem;
    font-size: 13px;
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
input[type="radio"]{
    height: 12px;
    width: 12px;
}
.question-box{
    overflow-y: auto;
}
.first{
   margin-top: 0;
}
label{
    margin: 0 0 0.5rem;   
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Accept Swap Disclaimer</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            {`Please read and accept the swap disclaminer to begin the process.`}
        </div>

        <div class="flex-column flow-buttons">
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Accept Terms"}
                    disabled={!answeredAll}
                    click={nextPage} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => switchPage('Swaps')} />  
         </div>
    </div>
    <div class="flow-content-right" >
        <div class="question-box flex-column">
            <div in:fade="{{delay: 0, duration: 200}}">
                <h3 class="first">
                    By accessing this section of the wallet, you confirm that
                </h3>    
                    <ul>
                        <li><strong>(i)</strong> you currently own TAU Lamden token(s) for your own account and</li>
                        <li><strong>(ii)</strong> you are not residing nor are you physically present in any jurisdiction where participating in an exchange of tokens is not permitted or is subject to specific registration or licensing requirements.</li>
                        </ul>
                
                <div class="checkbox-box">
                    <label class="chk-container" id="chk-all" class:not-accepted={!read_and_confirmed} class:accepted={read_and_confirmed}>
                        <input  type="checkbox" bind:checked={read_and_confirmed} on:change={resetAnswers}>
                        <span class="chk-checkmark"></span>
                        I have read and confirm the above statements are all true.
                    </label>
                </div>
            </div>
            {#if read_and_confirmed}
                <div in:fade="{{delay: 0, duration: 200}}">
                    <h3>
                        Are you acting:
                    </h3>
                    <div class="flex-column padding text-body2">
                        <label>
                            <input id="trusted" type="radio" bind:group={yourself_or_company} value={true} on:change={() => {permanent_establishment_in_switzerland = null}}>
                            <strong>A.</strong> for yourself as a natural person holding TAU tokens?
                        </label>
                        <label>
                            <input id="trusted" type="radio" bind:group={yourself_or_company} value={false} on:change={() => {domiciled_or_usually_staying = null}}>
                            <strong>B.</strong> on behalf of a company or a business which is holding TAU tokens?
                        </label>
                        {#if yourself_or_company === true}
                            <div class="sub-question">
                                <h3>Are you domiciled or usually staying in Switzerland or Lichtenstein?</h3>
                                <label>
                                    <input id="trusted" type="radio" bind:group={domiciled_or_usually_staying} value={true}}>
                                    <strong>Yes</strong>
                                </label>
                                <label>
                                    <input id="trusted" type="radio" bind:group={domiciled_or_usually_staying} value={false}}>
                                    <strong>No</strong>
                                </label>
                            </div>
                        {/if}
                        {#if yourself_or_company === false}
                            <div class="sub-question">
                                <h3>Do you have your place of business or a permanent establishment in Switzerland or Liechtenstein?</h3>
                                <label>
                                    <input id="trusted" type="radio" bind:group={permanent_establishment_in_switzerland} value={true}}>
                                    <strong>Yes</strong>
                                </label>
                                <label>
                                    <input id="trusted" type="radio" bind:group={permanent_establishment_in_switzerland} value={false}}>
                                    <strong>No</strong>
                                </label>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

