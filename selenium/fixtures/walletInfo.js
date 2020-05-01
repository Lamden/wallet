var path = require('path');

module.exports = {
    walletPassword : "Testing0!2",
    keystoreInfo: {
        keys: {
            vk: "2341d744f11658d7f1ca1c514a1b76ff07898435c46402b1e4f8b00d4a13f5f9",
            sk: "a57a2c0c7907ec65fddf50302ea4d2e2aa8d66fb2074c5e022052ed695b43d42"
        },
        file: path.join("selenium", "fixtures", "testing.keystore"),
        password: "Testing0!234567",
        hint: "testingPW"
    }
}