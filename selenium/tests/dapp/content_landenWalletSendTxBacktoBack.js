const whitelabel = require("../../../whitelabel.json");

const assert = require("assert");
const { Builder, By, until } = require("selenium-webdriver");
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config");
const helpers = require("../../helpers/helpers");
let walletInfo = require("../../fixtures/walletInfo");
let dappsInfo = require("../../fixtures/dappsInfo.json");

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

function verify(tx, res){
    // check res is the result of tx
    console.log(res.data.resultInfo.errorInfo)
    assert.equal(res.status, "success");
    let result = res.data;
    assert.equal(result.resultInfo.type, "success");
    assert.equal(result.signature.length > 0, true);
    assert.equal(result.uid, tx.uid)
    assert.equal(
      JSON.stringify(result.txInfo.kwargs),
      JSON.stringify(tx.kwargs)
    );
    assert.equal(result.txInfo.methodName, tx.methodName);
    assert.equal(result.txInfo.stampLimit, tx.stampLimit);
}

describe("Content Script - Testing Dapp SendTx API", function () {
  var driver;
  var httpServer;
  var connectionInfo;

  before(async function () {
    httpServer = await helpers.startServer(config.port);
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .build();
    //open tab to wallet
    await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    await helpers.completeFirstRunSetupRestore(
      driver,
      config.workingDir,
      walletInfo,
      false
    );
  });

  after(() => {
    return helpers.closeTest(driver, httpServer);
  });

  context("Test Setup", function () {
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
    it("Create wallet connection to our test dApp website ", async function () {
        this.timeout(30000);
        let connection = helpers.getInstance(dappsInfo.basicConnectionInfo);
        await helpers.sendConnectRequest(driver, connection, false);
        await helpers.approvePopup(driver, 2, 1, true);
        let response = await helpers.getWalletResponse(driver);
  
        connectionInfo = response;
        assert.equal(response.errors, null);
        await helpers.sleep(2000, false);
      });
  });

  context("lamdenWalletSendTx", function () {
    it("sends transactions backtoback and verify theses transactions", async function () {
        // send tx
        let transaction1 = helpers.getInstance(dappsInfo.basicTransactionInfo);
        transaction1.uid = helpers.createUID()
        await helpers.sendTx(driver, transaction1, false);
        // avoid invalid nonce
        await helpers.sleep(5000)
        let transaction2 = helpers.getInstance(dappsInfo.basicTransactionInfo);
        transaction2.uid = helpers.createUID()
        transaction2.stampLimit = 31
        await helpers.sendTx(driver, transaction2, false);
        // avoid invalid nonce
        await helpers.sleep(5000)
        let transaction3 = helpers.getInstance(dappsInfo.basicTransactionInfo);
        transaction3.uid = helpers.createUID()
        transaction3.stampLimit = 32
        await helpers.sendTx(driver, transaction3, false);

        // verify the result
        let response1 = await helpers.getTxResult(driver, transaction1.uid);
        let response2 = await helpers.getTxResult(driver, transaction2.uid);
        let response3 = await helpers.getTxResult(driver, transaction3.uid);
        verify(transaction1, response1)
        verify(transaction2, response2)
        verify(transaction3, response3)
    });
  });
});
