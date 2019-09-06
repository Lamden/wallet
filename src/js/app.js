import App from '../svelte/App.svelte';

import '../css/global.css'

const app = new App({
	target: document.body,
});

window.app = app;

export default app;