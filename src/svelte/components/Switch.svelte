<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let checked;

    const dispatchState = () => {
		  dispatch('toggleState', checked);
	  }
</script>

<style>
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 14px;
  width: 34px;
  background-color: #461BC2;
  transition: .4s;
}

.slider:before {
    position: absolute;
    bottom: -3px;
    left: -3px;
    content: "";
    width: 20px;
    height: 20px;
    border-radius: 20px;
    background-color: #848484;
    transition: .4s;
}

input:checked + .slider {
  background-color: rgb(204, 204, 204, 0.24);
  box-shadow: 0px 1px 2px rgba(48, 79, 254, 0.54);
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>

<label class="switch">
  <input type="checkbox" bind:checked={checked} on:click={() => dispatchState()}>
  <span class="slider round"></span>
</label>