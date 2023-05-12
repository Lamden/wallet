const whitelabel = require("../../../whitelabel.json");

const assert = require("assert");
const { Builder, By, until } = require("selenium-webdriver");
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config");
const helpers = require("../../helpers/helpers");
let walletInfo = require("../../fixtures/walletInfo");
let dappsInfo = require("../../fixtures/dappsInfo_v2.json");

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

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
    await driver.manage().setTimeouts({
        script: 60000
    })
    await helpers.completeFirstRunSetupRestore(
      driver,
      config.workingDir,
      walletInfo,
      false
    );
    //await helpers.changeToTestnetV2(driver)
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
  });

  context("lamdenWalletSendTx", function () {
    it("Returns error if event detail is not a JSON string", async function () {
      let transaction = "";
      //await helpers.sleep(500000);
      let response = await helpers.sendTx(driver, transaction, true);
      assert.equal(response.errors.length, 1);
      assert.equal(
        response.errors[0].includes("Expected event detail to be JSON string"),
        true
      );
    });
    it("Returns error if wallet is not authorized", async function () {
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      let response = await helpers.sendTx(driver, transaction, true);
      assert.equal(response.errors.length, 1);
      assert.equal(
        response.errors[0].includes("You must be an authorized dApp"),
        true
      );
    });
    it("Create wallet connection to our test dApp website ", async function () {
      this.timeout(30000);
      let connection = helpers.getInstance(dappsInfo.basicConnectionInfo);
      await helpers.sendConnectRequest(driver, connection, false);
      await helpers.approvePopup(driver, 2, 1, false);
      let response = await helpers.getWalletResponse(driver);

      connectionInfo = response;
      assert.equal(response.errors, null);
      await helpers.sleep(2000, false);
    });
    it("Reject tx with missing networkType", async function () {
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = helpers.createUID()
      transaction.networkType = null;
      let response = await helpers.sendTx(driver, transaction, true);
      assert.equal(response.status, "Unable to process transaction");
      assert.equal(response.data.errors.length, 1);
      assert.equal(
        response.data.errors[0],
        "networkType <string> required but not provided"
      );
    });
    it("Reject tx with invalid Lamden networkType", async function () {
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = helpers.createUID()
      transaction.networkType = "badNetworkType";
      let response = await helpers.sendTx(driver, transaction, true);
      assert.equal(response.status, "Unable to process transaction");
      assert.equal(response.data.errors.length, 1);
      assert.equal(
        response.data.errors[0].includes(
          "'badNetworkType' is not a valid network type"
        ),
        true
      );
    });
    it("Reject tx attempt on unapproved Lamden Network", async function () {
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = helpers.createUID()
      transaction.networkType = "mockchain";
      let response = await helpers.sendTx(driver, transaction, true);
      assert.equal(response.status, "Unable to process transaction");
      assert.equal(response.data.errors.length, 1);
      assert.equal(
        response.data.errors[0].includes(
          "'networkType' <string> 'mockchain' is not a valid network type."
        ),
        true
      );
    });
    it("Forwards error from lamden.js if issues occur building transaction", async function () {
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = helpers.createUID()
      transaction.methodName = 1000;
      let response = await helpers.sendTx(driver, transaction, true);

      assert.equal(response.status, "Unable to process transaction");
      assert.equal(response.data.errors.length, 2);
      assert.equal(
        response.data.errors[0].includes(
          `Unable to Build ${whitelabel.companyName} Transaction`
        ),
        true
      );
      assert.equal(
        response.data.errors[1].includes("Method Required (Type: String)"),
        true
      );
    });
    it("POPUP: Reports the user denying the transaction", async function () {
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      await helpers.sendTx(driver, transaction, false);
      await helpers.sleep(2000, true);
      await helpers.switchWindow(driver, 2);
      let popupDeny_Buttom = await driver.wait(
        until.elementLocated(By.id("deny-btn")),
        5000
      );
      await popupDeny_Buttom.click();
      await helpers.switchWindow(driver, 1);
      await helpers.sleep(2000, true);
      let response = await helpers.getTxResult(driver, "emptyuid");
      assert.equal(response.status, "Transaction Cancelled");
      assert.equal(response.data.errors.length, 1);
      assert.equal(response.data.errors[0], "User closed Popup window");
    });
    it("Rejects tx if wallet is locked", async function () {
      await helpers.lockWallet(driver, 1);
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = helpers.createUID()
      let response = await helpers.sendTx(driver, transaction, true);
      assert.equal(response.status, "Unable to process transaction");
      assert.equal(response.data.uid, transaction.uid)
      assert.equal(response.data.errors.length, 1);
      assert.equal(response.data.errors[0], "Lamden Vault is Locked");
      await helpers.unlockWallet(driver, walletInfo.walletPassword, 1);
      await helpers.switchWindow(driver, 0);
      await helpers.ignoreBackupModal(driver);
    });
    it("Show errormsg if stamps is large than user's balance", async function () {
      await helpers.switchWindow(driver, 1);
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = "changeStampLimit"
      await helpers.sendTx(driver, transaction, false);
      await helpers.sleep(2000);
      await helpers.switchWindow(driver, 2);
      let change_Button = await driver.wait(
        until.elementLocated(By.id("change-btn")),
        5000
      );
      await change_Button.click();
      await helpers.sleep(500);
      let input = await driver.wait(
        until.elementLocated(By.id("stamp-input")),
        5000
      );
      await driver.executeScript("arguments[0].value = '';", input)
      await input.sendKeys(`99999999`);
      await change_Button.click();
      let msg = await driver.findElement(By.css(".error-msg")).getText();
      let stamps = await driver.findElement(By.id("stamps")).getText();
      assert.equal(msg, "Insufficient dTAU2 to pay for stamps");
      assert.equal(stamps.includes("99999999"), true);
      await helpers.sleep(1000);
    });
    it("Can change stamp limit and send tx successfully", async function () {
      this.timeout(70000)
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = "changeStampLimit"
      let change_Button = await driver.wait(
        until.elementLocated(By.id("change-btn")),
        6000
      );
      await change_Button.click();
      let input = await driver.wait(
        until.elementLocated(By.id("stamp-input")),
        5000
      );
      await driver.executeScript("arguments[0].value = '';", input)
      await input.sendKeys(`${transaction.stampLimit + 1}`);
      await change_Button.click();
      let approve_Button = await driver.wait(
        until.elementLocated(By.id("approve-btn")),
        5000
      );
      await approve_Button.click();
      await helpers.switchWindow(driver, 1);
      let response = await helpers.getTxResult(driver, transaction.uid);
      assert.equal(response.status, "success");
      let result = response.data;
      assert.equal(result.uid, transaction.uid)
      assert.equal(result.nonceResult.sender, connectionInfo.wallets[0]);
      assert.equal(result.resultInfo.type, "success");
      assert.equal(result.signature.length > 0, true);
      assert.equal(
        JSON.stringify(result.txInfo.kwargs),
        JSON.stringify(transaction.kwargs)
      );
      assert.equal(result.txInfo.senderVk, connectionInfo.wallets[0]);
      assert.equal(
        result.txInfo.contractName,
        connectionInfo.approvals[`${transaction.networkName}`][`${transaction.networkType}`].contractName
      );
      assert.equal(result.txInfo.methodName, transaction.methodName);
      assert.equal(result.txInfo.stampLimit, transaction.stampLimit + 1);
    });
    it("sends a transactions successfully after popup approval", async function () {
      this.timeout(10000);
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = helpers.createUID()
      await helpers.sendTx(driver, transaction, false);
      await helpers.approveTxPopup(driver, 2, 1);
      let response = await helpers.getTxResult(driver, transaction.uid);
      assert.equal(response.status, "success");
      let result = response.data;
      assert.equal(result.uid, transaction.uid)
      assert.equal(result.nonceResult.sender, connectionInfo.wallets[0]);
      assert.equal(result.resultInfo.type, "success");
      assert.equal(result.signature.length > 0, true);
      assert.equal(
        JSON.stringify(result.txInfo.kwargs),
        JSON.stringify(transaction.kwargs)
      );
      assert.equal(result.txInfo.senderVk, connectionInfo.wallets[0]);
      assert.equal(
        result.txInfo.contractName,
        connectionInfo.approvals[`${transaction.networkName}`][`${transaction.networkType}`].contractName
      );
      assert.equal(result.txInfo.methodName, transaction.methodName);
      assert.equal(result.txInfo.stampLimit, transaction.stampLimit);
    });
    it("Sends Currency/Approval transaction after Popup", async function () {
      this.timeout(60000);
      let currentApprovalAmount = await helpers.getApprovalAmount(
        connectionInfo.wallets[0],
        dappsInfo.approvalTransaction.kwargs.to,
        2
      );

      let transaction = helpers.getInstance(dappsInfo.approvalTransaction);
      transaction.uid = helpers.createUID()
      await helpers.sendTx(driver, transaction, false);
      await helpers.approveApprovalPopup(driver, 2, 1);
      await helpers.sleep(40000);
      let afterApprovalAmount = await helpers.getApprovalAmount(
        connectionInfo.wallets[0],
        dappsInfo.approvalTransaction.kwargs.to,
        2
      );

      assert.equal(
        afterApprovalAmount,
        currentApprovalAmount + dappsInfo.approvalTransaction.kwargs.amount
      );
    });
    it("sends a transactions successfully after Trusted App", async function () {
      this.timeout(60000);
      await helpers.switchWindow(driver, 0);
      await helpers.setAsTrustedDapp(driver);
      await helpers.switchWindow(driver, 1);

      //Send a transaction with pre-approval
      let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo);
      transaction.uid = helpers.createUID()

      let txResponse = await helpers.sendTx(driver, transaction, true);

      assert.equal(txResponse.status, "success");
      let result = txResponse.data;
      assert.equal(result.uid, transaction.uid)
      assert.equal(result.nonceResult.sender, connectionInfo.wallets[0]);
      assert.equal(result.resultInfo.type, "success");
      assert.equal(result.signature.length > 0, true);
      assert.equal(
        JSON.stringify(result.txInfo.kwargs),
        JSON.stringify(transaction.kwargs)
      );
      assert.equal(result.txInfo.senderVk, connectionInfo.wallets[0]);
      assert.equal(
        result.txInfo.contractName,
        connectionInfo.approvals[`${transaction.networkName}`][`${transaction.networkType}`].contractName
      );
      assert.equal(result.txInfo.methodName, transaction.methodName);
      assert.equal(result.txInfo.stampLimit, transaction.stampLimit);
    });
    it("ignores Trusted App auto transactions if contract differs from approved", async function () {
      this.timeout(30000);
      let transaction = helpers.getInstance(
        dappsInfo.nonStandardTransactionInfo
      );
      await helpers.sendTx(driver, transaction, false);

      await helpers.sleep(2000, true);
      await helpers.switchWindow(driver, 2);
      let approve_Button = await driver.wait(
        until.elementLocated(By.id("approve-btn")),
        500
      );
      assert.equal(typeof approve_Button !== "undefined", true);
    });
  });
});
