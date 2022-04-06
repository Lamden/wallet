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

    // run every 10 min if app page open
    setInterval(() => {
        chrome.tabs.query({}, function(tabs) {
			const foundTab = tabs.find((tab) => {
				if (typeof tab.url !== 'undefined') return tab.url.includes(`chrome-extension://${chrome.runtime.id}/app.html`)
				else return false
			});

			if (foundTab) { 
                updatePrice()
            }
		});
    }, 10 * 60 * 1000)

    // run every 1 hour if app page open
    setInterval(() => {
        chrome.tabs.query({}, function(tabs) {
			const foundTab = tabs.find((tab) => {
				if (typeof tab.url !== 'undefined') return tab.url.includes(`chrome-extension://${chrome.runtime.id}/app.html`)
				else return false
			});

			if (foundTab) { 
                updateExchangeRate
            }
		});
    }, 60 * 60 * 1000)

    // listen for price change
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'price') priceStore = changes[key].newValue;
        }
    });
}

export default runPriceService