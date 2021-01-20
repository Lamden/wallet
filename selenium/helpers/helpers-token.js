const {By, until} = require('selenium-webdriver');
const assert = require('assert');
const helpers = require('./helpers')
const config = require("../config/config")
const path = require('path')

const placeholder_base64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+"

const openAddAccountsAndTokens = async (driver) => {
    await driver.findElement(By.id('accounts')).click();
    await driver.findElement(By.id('add-btn')).click();
}

const addToken_ShowDetails = async (driver, token) => {
    await openAddAccountsAndTokens(driver)
    await driver.findElement(By.className('select-selected')).click()
    await helpers.sleep(500, true)
    await driver.findElement(By.id("select-option-1")).click()
    await helpers.sleep(500, true)
    await driver.findElement(By.id("contract_name")).sendKeys(`${token.contractName}\n`)
}

const addToken_Save = async (driver, token) => {
    let addbutton = await driver.findElement(By.id("add-token-btn"))
    assert.equal(await addbutton.isEnabled(), true);
    await addbutton.click()
    let messageField = await driver.wait(until.elementLocated(By.id(`message-text`)), 5000);
    let message = await messageField.getAttribute("innerText")
    assert.equal(message, `${token.tokenName} added successfully`);
    await driver.findElement(By.id("home-btn")).click()
    await driver.wait(until.elementLocated(By.id(`token-row-${token.tokenSymbol}`)), 5000);
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
    let input = await driver.findElement(By.id(`token-logo-${token.tokenSymbol}-${type}`))
    let src = await input.getAttribute("src")
    if (type === "placeholder") assert.equal(src, placeholder_base64); 
    else  assert.equal(src, token.logo);
}

const validateInputError = async (driver, errorShouldBe) => {
    let inputMessage = await driver.findElement(By.className('inputbox-message'))
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

const uploadImage = async (driver, imagePath ) => {
    let filePicker = await driver.wait(until.elementLocated(By.id(`filePicker`)), 10000);
    await filePicker.sendKeys(path.join(config.workingDir, imagePath))
}

const validateImageTooLargeError = async (driver) => {
    let inputMessage = await driver.findElement(By.className('logo-warning'))
    let errorIs = await inputMessage.getAttribute("innerText")
    assert.equal("image size maximum 192x192", errorIs);
}

const clearUploadImage = async (driver) => {
    let clearButton = await driver.wait(until.elementLocated(By.className(`clear-button`)), 10000);
    await clearButton.click()
}

module.exports = {
    addToken_ShowDetails, addToken_Save,
    validateTokenName, validateTokenSymbol, validateTokenLogo, validateInputError,
    changeTokenName, changeTokenSymbol,
    cancelAddTokenModal,
    uploadImage, clearUploadImage,
    validateImageTooLargeError
}