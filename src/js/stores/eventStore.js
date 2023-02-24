import { writable, derived } from 'svelte/store';

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
        update,
        setEventStatus: (version, status) => {
            EventStore.update(eventStore => {
                let index = eventStore.findIndex(x => x.version === version );
                if (index === -1) return;
                eventStore[index].viewed = status;
                chrome.storage.local.set({"events": eventStore});
                return eventStore;
            }) 
        }
    };
}

//Event Stores
export const EventsStore = createEventStore();

export const newEventNum = derived(
	EventsStore,
	$EventsStore => {
        let num = 0;
        if (Array.isArray($EventsStore)) {
            $EventsStore.forEach(e => {
                if (!e.viewed) {
                    num = num + 1;
                }
            })
        }
        return num;
    }
);
