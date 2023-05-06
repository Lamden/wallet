import { getLastestTauPrice, getTokenPrice ,getFiatPrice} from '../utils.js';

function runPriceService() {

    let priceStore = {}
    chrome.storage.local.get({"price":{}},function(value) {priceStore = value.price;})

    function updateExchangeRate() {
        // get exchange rate
        getFiatPrice().then(res => {
            if (res.success) {
                chrome.storage.local.set({"exchangeRate": {
                    base: res.base,
                    date: res.date,
                    rates: res.rates,
                }});
            }
        })
    }

    function updatePrice() {
        // get tau price
        getLastestTauPrice().then(res => {
            priceStore['currency'] = res
            chrome.storage.local.set({"price": priceStore});
        })

        // get toekn price
        chrome.storage.local.get({"tokens": {}}, function(value) {
            if (value.tokens['Lamden Mainnet|mainnet|lamden'] && Array.isArray(value.tokens['Lamden Mainnet|mainnet|lamden'])) {
                const list = value.tokens['Lamden Mainnet|mainnet|lamden'].map(token => {
                    return token.contractName
                });
                getTokenPrice(list).then(res => {
                    priceStore = {
                        ...priceStore,
                        ...res
                    }
                    chrome.storage.local.set({"price": priceStore});
                })
            }
        });
    }

    // run immediately
    updatePrice()
    updateExchangeRate()

    // listen for price change
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'price') priceStore = changes[key].newValue;
        }
    });

    // run every 24 hour
    chrome.alarms.create('periodExRate', { periodInMinutes: 24 * 60 });

    // run every 10 min if app page open
    chrome.alarms.create('periodPrice', { periodInMinutes: 1 });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === "periodExRate") {
            updateExchangeRate()
        } else if (alarm.name === "periodPrice") {
            chrome.tabs.query({}, function(tabs) {
                const foundTab = tabs.find((tab) => {
                    if (typeof tab.url !== 'undefined') return tab.url.includes(`chrome-extension://${chrome.runtime.id}/app.html`)
                    else return false
                });
    
                if (foundTab) { 
                    updatePrice()
                }
            });
        }
    }); 
}

export default runPriceService