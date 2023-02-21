const period = 6 * 60 * 60 * 1000;

const event_log = require('../event_log.json')

export const eventController = () => {

    const autoFetchUpdates = () => {
        chrome.storage.local.get("events", function(r){
            const updates = [];
            let old = r.events || [];
            event_log.forEach(x => {
                let index = old.findIndex(oldEvent => oldEvent.id === x.id);
                if (index !== -1) {
                    x.viewed = old[index].viewed
                } 
                updates.push(x)
            });

            console.log(updates)

            //chrome.storage.local.set({"events": updates.slice(-10)});
        });
    }

    autoFetchUpdates();

    return  {
        autoFetchUpdates
    }
}