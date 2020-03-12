import Confirm from '../svelte/Confirm.svelte';

import '../css/global.css'

const confirm = new Confirm({
	target: document.body,
});

window.confirm = confirm;

export default confirm;