import App from '../svelte/App.svelte';
import { writable } from 'svelte/store';

const loaded = writable(false);
console.log('loading...')

import '../css/global.css'

window.addEventListener('load', (event) => {
	try{
		console.log('loaded')
		loaded.set(true)
	} catch (e) {
		console.log(e)
	}
});

const app = new App({
	target: document.body,
	props: {loaded}
});

window.app = app;

export default app;