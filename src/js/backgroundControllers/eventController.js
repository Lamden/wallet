const period = 6 * 60 * 60 * 1000;

const latest_event = require('../latest_event.json')

export const eventController = () => {

    const autoFetchUpdates = () => {
        chrome.storage.local.get("events", function(r){
            console.log(r)
            const updates = [];
            let event_storage = r.events || [];

            let index = event_storage.find(e => e.version === latest_event.version);
            if (!index) {
                latest_event.viewed = false
                event_storage.push(latest_event)

                chrome.storage.local.set({"events": event_storage.slice(-5)});
            }

            console.log(JSON.parse(JSON.stringify({"events": event_storage.slice(-5)})))
        });
    }

    autoFetchUpdates();

    return  {
        autoFetchUpdates
    }
}