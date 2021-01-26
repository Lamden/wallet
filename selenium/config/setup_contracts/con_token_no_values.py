balances = Hash(default_value=0)

# Cannot set breakpoint in @construct
@construct
def seed():
    balances[ctx.caller] = 1000000

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