import App from '../svelte/Popup.svelte';

import '../css/global.css'

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

window.app = app;

export default app;