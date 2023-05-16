module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "webextensions": true,
        "node": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": ["no-floating-promise"],
    "rules": {
        "require-await": 2,
        "no-floating-promise/no-floating-promise": 2
    }
}
