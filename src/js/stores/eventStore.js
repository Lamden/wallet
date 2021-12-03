import { writable } from 'svelte/store';

export const createEventStore = () => {
    let initialized = false;
    let startValue = {};

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"events": startValue}, function(getValue) {
            initialized = true;
            EventStore.set(getValue.events)
        });
    }

    //Create Intial Store
    const EventStore = writable(startValue);

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'events') {
                EventStore.set(changes[key].newValue)
            }
        }
    });

    //Get the value of the event Store from chome.storage.local
    getStore()

    let subscribe = EventStore.subscribe;
    let update = EventStore.update;
    let set = EventStore.set;

    return {
        subscribe,
        set,
        update
    };
}

//Event Stores
export const EventsStore = createEventStore();
