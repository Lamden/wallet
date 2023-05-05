const assert = require('assert');
const {Builder, By } = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let walletInfo = require("../../fixtures/walletInfo")
let keys = require("../../fixtures/mnemonic")
let dappsInfo = require("../../fixtures/dappsInfo_v2.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

const Lamden = require('lamden-js')

function create_challenge_message(dapp_challenge, vault_challenge){
    return `[VAULT_AUTH]__DAPP__${dapp_challenge}__VAULT__${vault_challenge}`
}

describe('Content Script - Testing Dapp Verify API', function () {
    let driver;
    let httpServer;

    before(async function() {
        httpServer = await helpers.startServer(config.port)
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        await helpers.completeFirstRunSetupRestore(
            driver,
            config.workingDir,
            walletInfo,
            false,
            false,
            true
          );
          await helpers.changeToTestnetV2(driver)
    });

    after(() => {
        return helpers.closeTest(driver, httpServer)
     });


     it("Loads Test Website", async function () {
        await driver.executeScript(
          `window.open('http://localhost:${config.port}','_blank');`
        );
  
        await helpers.switchWindow(driver, 1);
        await helpers.setupSendListener(driver);
        await driver.findElement(By.id("wallet-tests")).then((element) => {
          assert.ok(element);
        });
      });

    it('Create conenction to test dApp website', async function() {
        this.timeout(30000);
        let connection = helpers.getInstance(dappsInfo.basicConnectionInfo);
        await helpers.sendConnectRequest(driver, connection, false);
        await helpers.approvePopup(driver, 2, 1, false);
        let response = await helpers.getWalletResponse(driver);
  
        assert.equal(response.errors, null);
        await helpers.sleep(2000, false);
    });

    it('Can Sign a Challenge', async function() {
        const dapp_challenge = "testing"
        const response = await helpers.sendDappVerifyRequest({dapp_challenge}, driver)

        assert.notEqual(response, undefined)

        const challenge_message = create_challenge_message(dapp_challenge, response.vault_challenge)
        assert.equal(Lamden.wallet.verify(keys.vk, challenge_message, response.signature, response.signature), true)
    });

    it('Returns ERROR if dapp_challenge > 64 characterse', async function() {
        const dapp_challenge = new Array(66).join("0");
        const response = await helpers.sendDappVerifyRequest({dapp_challenge, vk: keys.vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.dapp_challenge, dapp_challenge)
        assert.equal(response.errors[0].includes(`Error: Malformed 'dapp_challenge': Must be a string with a max length of 64.`), true)
        assert.equal(response.signature, undefined)
    });

    it('Returns ERROR if dapp_challenge is not a string', async function() {
        const dapp_challenge = true
        const response = await helpers.sendDappVerifyRequest({dapp_challenge, vk: keys.vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.dapp_challenge, dapp_challenge)
        assert.equal(response.errors[0].includes(`Error: Malformed 'dapp_challenge': Must be a string with a max length of 64.`), true)
        assert.equal(response.signature, undefined)
    });

    it('Returns ERROR if dapp_challenge is JSON string', async function() {
        const response = await helpers.sendDappVerifyRequest_special( driver)

        assert.notEqual(response, undefined)
        
        assert.equal(response.dapp_challenge, '{"test":"test"}')
        assert.equal(response.errors[0].includes(`Error: Malformed 'dapp_challenge': Cannot sign JSON string.`), true)
        assert.equal(response.signature, undefined)
    });

})