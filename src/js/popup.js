import App from '../svelte/Popup.svelte';

import '../css/global.css'

const app = new App({
	target: document.body,
});

window.app = app;

export default app;