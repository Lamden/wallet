balances = Hash(default_value=0) # Required

# use token_owner if you want to change logo, name or symbol after submission
token_owner = Variable() # Optional

# Token Meta (Name, Symbol, Logo Image). Set values in the "seed" method
## the below metadata will be available to any app using the Lamden Token standard
token_name = Variable() # Optional
token_symbol = Variable() # Optional

## Token Logo (base64 svg/png image or url). Use 1 of the variables below.
# ** A base64 value that is too long will cause the smart contract to fail on submission.
# ** It is recommended that you submit your contract with an owner and then after the contract is submitted 
# ** use the "set_logo" method to set the base64 value of either token_base64_svg or token_base64_png.
# ** URLs are generally short enough that you can sit it in the seed method to provide it on submission.
token_base64_svg = Variable() # Optional
token_base64_png = Variable() # Optional
token_logo_url = Variable()  # Optional

@construct
def seed():
    # Create a token with the information from fixtures/tokenInfo
    token_name.set("")
    token_symbol.set("")

    # change the commented out variable to what you used in the variable declaration token_base64_svg, token_base64_png or token_logo_url
    ## for example it should be token_logo_url.set('http://www.someurl.com/image.png') if you defiend the token_logo_url variable above.
    ## base64 values should be set to "" here and the actual value should be set after submission using the "set_logo" method from the owners account.
    '''token_logo_url'''.set("")

    balances[ctx.caller] = 1000000
    token_owner.set(ctx.caller)

# set_logo, set_name, set_symbol and assert_owner are only needed if you set an owner. Otherwise they can be removed
@export 
def set_logo(new_value: str):
    assert_owner()
    # change the commented out variable to what you used in the variable declaration token_base64_svg, token_base64_png or token_logo_url
    ## for example it should be token_logo_url.set(new_value) if you defiend the token_logo_url variable above.
    '''#token_base64_svg'''.set(new_value)

@export 
def set_name(new_value: str):
    assert_owner()
    token_name.set(new_value)

@export 
def set_symbol(new_value: str):
    assert_owner()
    token_symbol.set(new_value)

def assert_owner():
    assert ctx.caller == token_owner.get(), 'Only the owner can change contract meta'

# ALL methods below here are REQUIRED and should not be altered. This includes method names, argument names and arguement types
## Changing any information below this comment could cause your token to be incompatible with apps using the Lamden Token Standard.
@export
def transfer(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'
    sender = ctx.caller

    assert balances[sender] >= amount, 'Not enough coins to send!'

    balances[sender] -= amount
    balances[to] += amount

@export
def balance_of(account: str):
    return balances[account]

@export
def main_balance_of(main_account: str, account: str):
    return balances[main_account, account]

@export
def allowance(owner: str, spender: str):
    return balances[owner, spender]

@export
def approve(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'

    sender = ctx.caller
    balances[sender, to] += amount
    return balances[sender, to]

@export
def transfer_from(amount: float, to: str, main_account: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[main_account] > amount, 'Cannot send amount greater than balance!'

    balances[main_account] -= amount
    balances[to] += amount