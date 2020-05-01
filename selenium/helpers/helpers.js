const wait_sync = (seconds) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, seconds);
}

const wait_async = async (seconds) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), seconds)
      });
}

const sleep = async (seconds, async) => {
    //console.log(`sleeping ${seconds/1000} seconds`, new Date().toLocaleTimeString())
    if (async) await wait_async(seconds)
    else await wait_sync(seconds)
    //console.log('done', new Date().toLocaleTimeString())
}

const switchWindow = async (driver, windowNum) => {
    let winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[windowNum])
}


module.exports = {
    sleep,
    switchWindow
}