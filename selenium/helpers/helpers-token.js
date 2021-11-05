const {By, until} = require('selenium-webdriver');
const assert = require('assert');
const helpers = require('./helpers')
const config = require("../config/config")
const path = require('path')

const placeholder_base64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+"

const openAddAccountsAndTokens = async (driver) => {
    await helpers.sleep(1000);
    await driver.findElement(By.id('accounts')).click();
    await driver.findElement(By.id('add-btn')).click();
}
/**
 * @param {Object} driver Selenium Driver
 * @param {Object} token Token Info
 * @param {number} type 0: existing tokens; 1: custom token. 
 */

const addToken_ShowDetails = async (driver, token, type) => {
    await helpers.sleep(500, true)
    await openAddAccountsAndTokens(driver)
    await driver.findElement(By.id('options-currently-selected')).click()
    await helpers.sleep(500, true)
    await driver.findElement(By.xpath("//*[@id='options-currently-selected']/following-sibling::div[1]/div[@id='select-option-1']")).click()
    let id = type === 0?"add-existing-token-btn": "add-custom-token-btn"
    await driver.findElement(By.id(id)).click()

    if(type === 0){
        await helpers.sleep(2000, true)
        await driver.wait(until.elementLocated(By.id('contract_name-currently-selected')), 25000).click();
        await helpers.sleep(1000, true)
        await driver.findElement(By.xpath(`//*[starts-with(@id,'select-option')]/div[text()='${token.tokenName} (${token.tokenSymbol})']`)).click()
        return
    }
    await helpers.sleep(500, true)
    await driver.findElement(By.id("contract_name")).sendKeys(`${token.contractName}\n`)
}

const addToken_Save = async (driver, token) => {
    let addbutton = await driver.findElement(By.id("add-token-btn"))
    await driver.wait(until.elementIsEnabled(addbutton, 15000))
    await addbutton.click()
    let messageField = await driver.wait(until.elementLocated(By.id(`message-text`)), 25000);
    let message = await messageField.getAttribute("innerText")
    assert.equal(message, `${token.tokenName} added successfully`);
    await driver.findElement(By.id("home-btn")).click()
    await helpers.sleep(500, true)
    await validateTokenOnAccountsScreen(driver, token)
}

const validateTokenOnAccountsScreen = async (driver, token) => {
    await helpers.gotoAccountsPage(driver)
    await driver.wait(until.elementLocated(By.id(`token-row-${token.tokenSymbol}-${token.tokenName.replace(" ", "")}`)), 5000);
    await validateTokenLogo(driver, token)
}

const validateTokenNotOnAccountsScreen = async (driver, token)=> {
    await helpers.gotoAccountsPage(driver)
    await helpers.sleep(500, true)
    let tokenRows = await driver.findElements(By.id(`token-row-${token.tokenSymbol}-${token.tokenName.replace(" ", "")}`))
    assert.equal(tokenRows.length, 0)
}

const validateTokenName = async (driver, token) => {
    let input = await driver.findElement(By.id("input-token-name"))
    let value = await input.getAttribute("value")
    assert.equal(value, token.tokenName);
}

const validateTokenSymbol = async (driver, token) => {
    let input = await driver.findElement(By.id("input-token-symbol"))
    let value = await input.getAttribute("value")
    assert.equal(value, token.tokenSymbol);
}

const validateTokenLogo = async (driver, token, overrideLogoType=undefined) => {

    let type = token.logo_type;
    if (overrideLogoType) type = overrideLogoType

    let input = await driver.wait(until.elementLocated(By.id(`token-logo-${token.tokenSymbol}-${type}`)), 5000);
    let src = await input.getAttribute("src")
    if (type === "placeholder") assert.equal(src, placeholder_base64); 
    else  {
        if (type === "urlB64") {
            assert.equal(src.indexOf("data:image/jpeg;base64") !== -1, true)
        }
        else assert.equal(src, token.logo);
    }
}

const validateTokenLogoInBox = async (driver, token, overrideLogoType=undefined) => {
    let type = token.logo_type;
    if (overrideLogoType) type = overrideLogoType
    helpers.sleep(15000, true)
    let input = await driver.wait(until.elementLocated(By.css(`.token-logo-box #token-logo-${token.tokenSymbol}-${type}`)), 15000);  
    let src = await input.getAttribute("src")
    if (type === "placeholder") assert.equal(src, placeholder_base64); 
    else  {
        if (type === "urlB64") assert.equal(src, token.logo_base64_url);
        else assert.equal(src, token.logo);
    }
}

const validateInputError = async (driver, errorShouldBe) => {
    let inputMessage = await driver.findElement(By.className('inputbox-message'))
    let errorIs = await inputMessage.getAttribute("innerText")
    assert.equal(errorShouldBe, errorIs);
}

const validateDropdownError = async (driver, errorShouldBe) => {
    let inputMessage = await driver.findElement(By.id('dropdown-error'))
    let errorIs = await inputMessage.getAttribute("innerText")
    assert.equal(errorShouldBe, errorIs);
}

const changeTokenName = async (driver, newName) => {
    let input = await driver.findElement(By.id("input-token-name"))
    await input.clear()
    await input.sendKeys(`${newName}\n`)
}

const changeTokenSymbol = async (driver, newSymbol) => {
    let input = await driver.findElement(By.id("input-token-symbol"))
    await input.clear()
    await input.sendKeys(`${newSymbol}\n`)
}

const cancelAddTokenModal = async (driver) => {
     await driver.findElement(By.id('modal-cancel-btn')).click();
}

const cancelTokenOptionsModal = async (driver) => {
    await driver.findElement(By.id('cancel-modal-btn')).click();
}

const uploadImage = async (driver, imagePath ) => {
    let filePicker = await driver.wait(until.elementLocated(By.id(`filePicker`)), 15000);
    await filePicker.sendKeys(path.join(config.workingDir, imagePath))
}

const validateImageTooLargeError = async (driver) => {
    await helpers.sleep(1000, true)
    let inputMessage = await driver.findElement(By.className('logo-warning'))
    let errorIs = await inputMessage.getAttribute("innerText")
    assert.equal("image size maximum 192x192", errorIs);
}

const clearUploadImage = async (driver) => {
    let clearButton = await driver.wait(until.elementLocated(By.className(`clear-button`)), 15000);
    await clearButton.click()
}

const refreshTokenInfoButton = async (driver) => {
    await driver.wait(until.elementLocated(By.id(`modify-refresh-btn`)), 2000).click();
    await helpers.sleep(4000, true)
}

const addToken = async (driver, token) => {
        await addToken_ShowDetails(driver, token, 1)
        await helpers.sleep(3000)
        await addToken_Save(driver, token)
        await helpers.sleep(1000)
}

const deleteToken = async (driver) => {
    await driver.wait(until.elementLocated(By.id(`modify-delete-btn`)), 2000).click();
    await driver.wait(until.elementLocated(By.id(`delete-token-btn`)), 2000).click();
    await driver.wait(until.elementLocated(By.id(`home-btn`)), 2000).click();
}

const saveTokenModal = async (driver, token) => {
    let saveButton = await driver.findElement(By.id("token-options-save-btn"))
    assert.equal(await saveButton.isEnabled(), true);
    await saveButton.click()
}

const gotoTokenDetails = async (driver, token) => {
    await driver.findElement(By.xpath(`//div[contains(text(),'${token.tokenName}')]`)).click()
}

const gotoTokenOptions = async (driver, token) => {
    await driver.wait(until.elementLocated(By.id(`modify-token-btn`)), 2000).click();
}

const validateSimpleTransacationFormDetails = async (driver, token) => {
    helpers.sleep(1000)
    let tokenInput = await driver.findElement(By.id("tokeninput"));
    let tokenInputValue = await tokenInput.getText();
    assert.equal(tokenInputValue, token.tokenName);
}

const validateTransacationFormDetails = async (driver, token, method) => {
    helpers.sleep(1000)
    let contractInput = await driver.findElement(By.id("contract-input"))
    let contractInputValue = await contractInput.getAttribute("value")
    assert.equal(contractInputValue, token.contractName);
    helpers.sleep(1000)
    let methodsSelect = await driver.findElement(By.id("methods-currently-selected"))
    let methodsSelectValue = await methodsSelect.getAttribute("innerText")
    assert.equal(methodsSelectValue, method);



}

const cancelTransferModal = async (driver) => {
    await driver.findElement(By.id("transfer-modal-cancel")).click()
}

module.exports = {
    addToken_ShowDetails, addToken_Save,
    validateTokenName, validateTokenSymbol, validateTokenLogo, validateInputError, validateTokenLogoInBox,
    changeTokenName, changeTokenSymbol,
    cancelAddTokenModal, cancelTokenOptionsModal, cancelTransferModal,
    uploadImage, clearUploadImage,
    validateImageTooLargeError,
    gotoTokenDetails, gotoTokenOptions,
    addToken, saveTokenModal, deleteToken,
    validateTokenOnAccountsScreen,
    refreshTokenInfoButton,
    validateTokenNotOnAccountsScreen,
    validateTransacationFormDetails,
    validateDropdownError,
    validateSimpleTransacationFormDetails
}