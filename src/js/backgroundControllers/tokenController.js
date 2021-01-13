/*
TO DO

    1. manage a storage object for tokens
        - Add a new token
        - Remove a token
        - Update a token

    2. Refresh token balances
        - Get all account addresses currently in wallet
        - For each token, get balance on each account
        - Store balance associated to accounts

    Storage:
        tokens: {
            <contract_name>: {
                symbol, name, contract_name
            }
        }
        token_balances: {
            <vk>: {
                <contract_name>:{ balance }
            }
        }
*/