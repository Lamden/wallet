const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let walletInfo = require("../../fixtures/walletInfo")
let keys = require("../../fixtures/mnemonic")
let dappsInfo = require("../../fixtures/dappsInfo_v2.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

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
            false
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
  
        connectionInfo = response;
        assert.equal(response.errors, null);
        await helpers.sleep(2000, false);
    });

    it('Can Sign a Challenge', async function() {
        const challenge = "testing"
        const response = await helpers.sendDappVerifyRequest({challenge, vk: keys.vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.vk, keys.vk)
        assert.equal(response.challenge, challenge)
        assert.equal(response.signature, "2ce66907215e3d93ebf8b4d5f6225dbfcb56e441a5616e30add6c6a5fe63e43e0ec1abbc91c47c3b4b24c44e30eafdc998cf3a7c519ccc0e201b7684fbae340a")

    });

    it('Returns ERROR if vk not in wallet accounts', async function() {
        const challenge = "testing"
        const vk = "2341d744f11658d7f1ca1c514a1b76ff07898435c46402b1e4f8b00d4a13f5f9"
        const response = await helpers.sendDappVerifyRequest({challenge, vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.challenge, challenge)
        assert.equal(response.vk, vk)
        assert.equal(response.errors[0].includes(`Account address '${vk}' not in Lamden Vault.`), true)
        assert.equal(response.signature, undefined)

    });

    it('Returns ERROR if vk is missing from data', async function() {
        const challenge = "testing"
        const response = await helpers.sendDappVerifyRequest({challenge}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.challenge, challenge)
        assert.equal(response.vk, undefined)
        assert.equal(response.errors[0].includes(`Error: Malformed vk: Must be a string with a length of 64.`), true)
        assert.equal(response.signature, undefined)

    });

    it('Returns ERROR if vk is longer than 64 characters', async function() {
        const challenge = "testing"
        const vk = new Array(66).join("0");
        const response = await helpers.sendDappVerifyRequest({challenge, vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.challenge, challenge)
        assert.equal(response.vk, vk)
        assert.equal(response.errors[0].includes(`Error: Malformed vk: Must be a string with a length of 64.`), true)
        assert.equal(response.signature, undefined)
    });

    it('Returns ERROR if vk is not a string', async function() {
        const challenge = "testing"
        const vk = true;
        const response = await helpers.sendDappVerifyRequest({challenge, vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.challenge, challenge)
        assert.equal(response.vk, vk)
        assert.equal(response.errors[0].includes(`Error: Malformed vk: Must be a string with a length of 64.`), true)
        assert.equal(response.signature, undefined)
    });

    it('Returns ERROR if vk is an empty string', async function() {
        const challenge = "testing"
        const vk = "";
        const response = await helpers.sendDappVerifyRequest({challenge, vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.challenge, challenge)
        assert.equal(response.vk, vk)
        assert.equal(response.errors[0].includes(`Error: Malformed vk: Must be a string with a length of 64.`), true)
        assert.equal(response.signature, undefined)
    });

    it('Returns ERROR if challenge > 64 characterse', async function() {
        const challenge = new Array(66).join("0");
        const response = await helpers.sendDappVerifyRequest({challenge, vk: keys.vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.challenge, challenge)
        assert.equal(response.vk, keys.vk)
        assert.equal(response.errors[0].includes(`Error: Malformed challenge request: Must be a string with a max length of 64.`), true)
        assert.equal(response.signature, undefined)
    });

    it('Returns ERROR if challenge is not a string', async function() {
        const challenge = true
        const response = await helpers.sendDappVerifyRequest({challenge, vk: keys.vk}, driver)

        assert.notEqual(response, undefined)

        assert.equal(response.challenge, challenge)
        assert.equal(response.vk, keys.vk)
        assert.equal(response.errors[0].includes(`Malformed challenge request: Must be a string with a max length of 64.`), true)
        assert.equal(response.signature, undefined)
    });

    it('Returns ERROR if challenge is JSON string', async function() {
        const response = await helpers.sendDappVerifyRequest_special( driver)

        assert.notEqual(response, undefined)
        
        assert.equal(response.challenge, '{\"test\":\"test\"}')
        assert.equal(response.vk, keys.vk)
        assert.equal(response.errors[0].includes(`Error: Malformed challenge request: Cannot sign JSON string.`), true)
        assert.equal(response.signature, undefined)
    });
})