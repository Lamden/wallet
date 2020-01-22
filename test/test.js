import Test from '../src/svelte/App.svelte';

async function tick() {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(resolve);
    });
}

export async function testComponent(t) {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const c = new Test({
        target,
        props: {}
    });
    
    //will fail
    t.assert(target.innerHTML === '<h1>Hello world!</h1>');
    
}