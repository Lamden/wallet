import { get } from 'svelte/store';
import { CoinStore, lockedStorage, password, balanceTotal } from '../../../src/js/stores/coinStore.js';
import { encryptObject, decryptObject } from '../../../src/js/utils.js'
import "cypress-localstorage-commands";

function copyItem(item){
    return JSON.parse(JSON.stringify(item))
}

function isObject(value){
    if(Object.prototype.toString.call(value) === "[object Object]") return true;
    return false;
}

function isObjectWithKeys(value){
    if (isObject(value) && Object.keys(value).length > 0) return true;
    return false;
}

function unencryptToJSON(ls){
    let unencryptedLs = decryptObject( testingPassword, JSON.parse(ls))
    return JSON.stringify(unencryptedLs)
}



const storeSpys = {
    'lockCoinStore': () => {
        return CoinStore.lockCoinStore();
    },
    'setPwd': (pwd) => {
        return CoinStore.setPwd(pwd);
    },
    'validatePassword': (pwd) => {
        return CoinStore.validatePassword(pwd);
    },
    'addCoin': (coinInfo) => {
        return CoinStore.addCoin(coinInfo);
    },
    'getCoin': (coinInfo) => {
        return CoinStore.getCoin(coinInfo);
    },
    'updateBalance': (coinInfo, balance) => {
        return CoinStore.updateBalance(coinInfo, balance);
    },
    'updateAllBalances': (networkInfo) => {
        return CoinStore.updateAllBalances(networkInfo);
    },
    'set': (value) => {
        return CoinStore.set(value);
    }
}

const testingPassword = "Testing0!2"
const badValues = [undefined, null, [], {}, true, '', 0.01]
const badSetValues = [undefined, null, {}, true, '', 0.01]

let mockCoin = {
    'network': 'lamden',
    'name': 'Lamden',
    'nickname' : 'Starting Encrypted Coin',
    'symbol': 'TAU',
    'vk': '725438cc4092d6ad233ce70b86b1b17c7c0688c5b51706fa1fd0eeae29c37a5c',
    'sk': 'encrypted-sk',
}

let encryptedStore = encryptObject(testingPassword, [mockCoin]);

describe('Test the Coins Store', () => {
    before(function() {
        //Set intial value of localstorage
        window.localStorage.setItem("coins",  JSON.stringify(encryptedStore))
        cy.log(get(CoinStore))
        cy.saveLocalStorage();
    })

    describe('Test Coins Store Decryption', () => {
        it('setPwd: Decrypts local Storage', () => {
            //Validate the current value of the coinstore doesn't match what was
            //initially set in the before function
            let beforeSetPwd = get(CoinStore)
            cy.expect(JSON.stringify(beforeSetPwd)).to.not.eq(JSON.stringify(mockCoin))

            //Unlock storage before each test
            storeSpys.setPwd(testingPassword);
    
            //Validate the store was decrypted
            let afterSetPwd = get(CoinStore)
            cy.expect(JSON.stringify(afterSetPwd)).to.eq(JSON.stringify([mockCoin]))
        })
    })

    describe('Test Store Methods', () => {
        beforeEach(function() {
            cy.restoreLocalStorage();

            //Unlock storage before each test
            storeSpys.setPwd(testingPassword);

            //create spys
            Object.keys(storeSpys).map(func => {
                cy.spy(storeSpys, func)
            })
        })

        afterEach(function() {
            cy.saveLocalStorage();
        })

        //Set Password
        it('setPwd: Saves Password in Storage and updated Derived password store', () => {
            //Validate testingPassword equals what was set
            let passwordStoreAfter = get(CoinStore.passwordStore)
            cy.expect(passwordStoreAfter).to.eq(testingPassword)

            //Validate Derived password store is updated
            cy.expect(get(password)).to.eq(testingPassword)
        })

        it('setPwd: Returns locked or unlocked and updates Derived lockedStorage Store', () => {
            //Validate unlocked
            cy.expect(get(CoinStore.lockedStore)).to.eq(false)
            //Validate Derived value is also unlocked
            cy.expect(get(lockedStorage)).to.eq(false)

            //Lock the store
            storeSpys.lockCoinStore();

            //Validate locked 
            cy.expect(get(CoinStore.lockedStore)).to.eq(true)
            //Validate Derived value is also locked
            cy.expect(get(lockedStorage)).to.eq(true)
        })

        //Add Coin
        it('addCoin: Can save a new coin', () => {
            //Create a new coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = '1'

            //Record the size of the store before
            let beforeSize = get(CoinStore).length

            //Add a new coin to the store
            let response = CoinStore.addCoin(newCoin)
            cy.expect(response.added).to.eq(true)

            //Record the size of the store after
            let afterSize = get(CoinStore).length
            cy.expect(afterSize).to.eq(beforeSize + 1)
        })

        it('addCoin: Can update coin from watched to sk value', () => {
            //Create a new watchOnly coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = '2'
            newCoin.sk = 'watchOnly'

            //Add a new coin to the store
            let addResponse = CoinStore.addCoin(newCoin)
            cy.expect(addResponse.added).to.eq(true)

            //Record the size of the store before
            let beforeSize = get(CoinStore).length

            //Update the coin's sk
            newCoin.sk = 'this-is-an-sk'

            //Add updated coin to the store
            let updateResponse = CoinStore.addCoin(newCoin)
            cy.log(updateResponse)
            cy.expect(updateResponse.added).to.eq(true)
            cy.expect(updateResponse.reason.includes('Private Key Updated')).to.eq(true)

            //Validate coin was updated and not a new coin added
            let afterSize = get(CoinStore).length
            cy.expect(afterSize).to.eq(beforeSize)
        })

        it('addCoin: Will reject a duplicate coin from being added', () => {
            //Create a new watchOnly coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = '3'
            newCoin.sk = 'watchOnly'

            //Add a new coin to the store
            let addResponse1 = CoinStore.addCoin(newCoin)
            cy.expect(addResponse1.added).to.eq(true)

            //Record the size of the store before
            let beforeSize = get(CoinStore).length

            //Try to readd same coin
            let addResponse2 = CoinStore.addCoin(newCoin)
            cy.log(addResponse2)
            cy.expect(addResponse2.added).to.eq(false)
            cy.expect(addResponse2.reason).to.eq('duplicate')

            //Validate the coin was not added because the store size did not change
            let afterSize = get(CoinStore).length
            cy.expect(afterSize).to.eq(beforeSize)
        })

        it('addCoin: Reject bad or undefined arguments and does not error', () => {
            function runAddCoin(coinInfo){
                let response = storeSpys.addCoin(coinInfo)
                cy.expect(response.added).to.eq(false)
                cy.expect(response.reason).to.eq('badArg')
            }

            //Get the JSON value of the store so we can compare it later
            let storeStringBefore = JSON.stringify(get(CoinStore))
            let network = 'test'
            let name = 'Testing Coin'
            let nickname = 'This is a test'
            let symbol = 'TEST'
            let vk = 'dont-reject-this'
            //Try a bunch of bad values
            try {
                badValues.map(value => runAddCoin({'network': value, name, nickname, symbol, vk}))
                badValues.map(value => runAddCoin({network, 'name': value, nickname, symbol, vk}))
                badValues.map(value => {
                    if (value !== ''){
                        runAddCoin({network, name, 'nickname': value, symbol, vk})
                    }
                })
                badValues.map(value => runAddCoin({network, name, nickname, 'symbol': value, vk}))
                badValues.map(value => runAddCoin({network, name, nickname, symbol, 'vk': value}))
            } catch (e) {}
            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.addCoin).to.not.have.thrown(Error)

            let storeStringAfter = JSON.stringify(get(CoinStore))
            //No new objects should have been added
            cy.expect(storeStringBefore).to.eq(storeStringAfter)
        })

        it('addCoin: Replicates CoinStore to local storage', () => {
            //Create a new coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = '4'

            //Add a new coin to the store
            CoinStore.addCoin(newCoin)
            
            //Get and unencrypt local storage value
            let encryptedLs = window.localStorage.getItem("coins")
            let unencryptedLs = decryptObject( testingPassword, JSON.parse(encryptedLs))
            let lsString = JSON.stringify(unencryptedLs)

            //Get CoinStore value
            let storeString = JSON.stringify(get(CoinStore))

            //Validate they are the same
            cy.expect(lsString).to.eq(storeString)
        })

        //Validate Password
        it('validatePassword: Validate a correct password', () => {
            //Check correct password
            let response = storeSpys.validatePassword(testingPassword)
            cy.expect(response).to.eq(true)
        })

        it('validatePassword: Rejects an incorrect Password', () => {
            //Check correct password
            let response = storeSpys.validatePassword('bad-password')
            cy.expect(response).to.eq(false)
        })

        it('validatePassword: Does not error on non-string values', () => {
            //Get the JSON value of the store so we can compare it later
            let storeStringBefore = JSON.stringify(get(CoinStore))

            //Try a bunch of bad values
            try {
                badValues.map(value => storeSpys.validatePassword(value))

            } catch (e) {}
            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.addCoin).to.not.have.thrown(Error)

            let storeStringAfter = JSON.stringify(get(CoinStore))
            //No new objects should have been added
            cy.expect(storeStringBefore).to.eq(storeStringAfter)
        })

        // GET COIN
        it('getCoin: Will return a specific coin from the store', () => {
            //Create a new coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = 'get-this-coin'

            //Add Coin the Store
            let response = storeSpys.addCoin(newCoin)
            cy.expect(response.added).to.eq(true)

            //Get Coin from the Store
            let coin = storeSpys.getCoin(newCoin)

            //Validate coinInfo
            cy.expect(coin.vk).to.eq('get-this-coin')
        })

        it('getCoin: Rejects bad values and does not error on non-string values', () => {
            function runGetCoin(coinInfo){
                let coin = storeSpys.getCoin(coinInfo)
                cy.expect(response.added).to.eq(false)
                cy.expect(response.reason).to.eq('badArg')
                return coin;
            }

            //This should be null after test
            let testingCoin = null;

            function handleCoin(coin){
                if (isObjectWithKeys(coin)) testingCoin = coin;
            }

            //Create a new coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = 'do-not-get-this-coin'

            //Add Coin the Store
            let response = storeSpys.addCoin(newCoin)
            cy.expect(response.added).to.eq(true)

            //Set testing values
            let network = newCoin.network
            let name = newCoin.name
            let nickname = newCoin.nickname
            let symbol = newCoin.symbol
            let vk = newCoin.vk

            //Try a bunch of bad values to get coin
            try {
                badValues.map(value => {handleCoin(runGetCoin({'network': value, name, nickname, symbol, vk}))})
                badValues.map(value => {handleCoin(runGetCoin({network, 'name': value, nickname, symbol, vk}))})
                badValues.map(value => {handleCoin(runGetCoin({network, name, 'nickname': value, symbol, vk}))})
                badValues.map(value => {
                    if (value !== ''){
                        handleCoin(runGetCoin({network, name, 'nickname': value, symbol, vk}))
                    }
                })
                badValues.map(value => {handleCoin(runGetCoin({network, name, nickname, 'symbol': value, vk}))})
                badValues.map(value => {handleCoin(runGetCoin({network, name, nickname, symbol, 'vk': value}))})
            } catch (e) {}
            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.getCoin).to.not.have.thrown(Error)

            //Make sure a coin was not returned
            cy.expect(testingCoin).to.not.exist

        })

        // UPDATE BALANCE
        it('updateBalance: Updates the balance of a coin with a new value', () => {
            //Create a new coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = 'update-this-balace'

            //Add Coin the Store
            let response = storeSpys.addCoin(newCoin)
            cy.expect(response.added).to.eq(true)

            let balance = 100
            CoinStore.updateBalance(newCoin, balance)

            //Get Coin from the Store and validate balance is updated
            let coin = storeSpys.getCoin(newCoin)
            cy.log(JSON.stringify(coin))
            cy.expect(coin.vk).to.eq('update-this-balace')
            cy.expect(coin.balance).to.eq(100)

            //Validate Derived Store is updated
            cy.expect(get(balanceTotal)).to.eq(balance)
            
        })

        it('updateBalance: Reject bad or undefined arguments and does not error', () => {
            function runUpdateBalance(coinInfo, balance){
                storeSpys.updateBalance(coinInfo, balance)
            }

            //Create a new coin
            let newCoin = copyItem(mockCoin)
            newCoin.vk = 'do-not-update-this-balance'

            //Add Coin the Store
            let response = storeSpys.addCoin(newCoin)
            cy.expect(response.added).to.eq(true)

            //Set testing values
            let network = newCoin.network
            let name = newCoin.name
            let nickname = newCoin.nickname
            let symbol = newCoin.symbol
            let vk = newCoin.vk

            //Try a bunch of bad values to get coin
            try {
                badValues.map(value => runUpdateBalance({'network': value, name, nickname, symbol, vk}, balance))
                badValues.map(value => runUpdateBalance({network, 'name': value, nickname, symbol, vk}, balance))
                badValues.map(value => {
                    if (value !== ''){
                        runUpdateBalance({network, name, 'nickname': value, symbol, vk}, balance)
                    }
                })
                badValues.map(value => runUpdateBalance({network, name, nickname, 'symbol': value, vk}, balance))
                badValues.map(value => runUpdateBalance({network, name, nickname, symbol, 'vk': value}, balance))
            } catch (e) {}
            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.getCoin).to.not.have.thrown(Error)

            //Get Coin and validate balance is not updated
            //Get Coin from the Store
            let coin = storeSpys.getCoin(newCoin)
            cy.log(JSON.stringify(coin))
            cy.expect(coin.vk).to.eq('do-not-update-this-balance')
            cy.expect(coin.balance).to.not.exist
        })

        //Test Store Corruptability
        it('set: Cannot set a non Array Value', () => {
            //Get the current value of the localstorage
            let beforeLs = window.localStorage.getItem("coins");

            //Attempt to set the Store Value to corrupt values
            try {
                badSetValues.map(value => storeSpys.set(value))
            } catch (e) {}

            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.set).to.not.have.thrown(Error)
            
            //Get the new value of the localstorage
            let afterLs = window.localStorage.getItem("coins");
            
            //Expect the local storage to not have been overwritten and still contain the file
            cy.expect(unencryptToJSON(beforeLs)).to.eq(unencryptToJSON(afterLs))
            cy.expect(unencryptToJSON(afterLs)).to.eq(JSON.stringify(get(CoinStore)))
        })

        it('set: Can set an Array Value', () => {
            //Attempt to set the Store Value to corrupt values
            try {
                storeSpys.set([])
            } catch (e) {}

            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.set).to.not.have.thrown(Error)
            
            //Get the new value of the localstorage
            let afterLs = window.localStorage.getItem("coins");
            
            //Expect the local storage to not have been overwritten and still contain the file
            cy.expect(unencryptToJSON(afterLs)).to.eq('[]')
            cy.expect(unencryptToJSON(afterLs)).to.eq(JSON.stringify(get(CoinStore)))
        })
    })
    
})