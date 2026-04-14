from web3 import Web3
import json, os
from dotenv import load_dotenv

load_dotenv('.env', override=True)

rpc = 'https://evm.wirefluid.com'
w3 = Web3(Web3.HTTPProvider(rpc))
print(f'RPC connected: {w3.is_connected()}')
if w3.is_connected():
    print(f'Block number: {w3.eth.block_number}')

vault_addr = os.getenv('HASH_VAULT_ADDRESS')
print(f'HASH_VAULT_ADDRESS: {vault_addr}')

ABI = [
    {'inputs':[],'name':'currentHash','outputs':[{'name':'','type':'bytes32'}],'stateMutability':'view','type':'function'},
    {'inputs':[],'name':'executionCount','outputs':[{'name':'','type':'uint256'}],'stateMutability':'view','type':'function'},
    {'inputs':[],'name':'remainingExecutions','outputs':[{'name':'','type':'uint256'}],'stateMutability':'view','type':'function'},
    {'inputs':[{'name':'_preimage','type':'bytes32'}],'name':'validatePreimage','outputs':[{'name':'','type':'bool'}],'stateMutability':'view','type':'function'},
    {'inputs':[],'name':'wireFluid','outputs':[{'name':'','type':'address'}],'stateMutability':'view','type':'function'},
    {'inputs':[],'name':'sponsor','outputs':[{'name':'','type':'address'}],'stateMutability':'view','type':'function'},
]

vault = w3.eth.contract(address=Web3.to_checksum_address(vault_addr), abi=ABI)
current_hash = vault.functions.currentHash().call()
exec_count = vault.functions.executionCount().call()
remaining = vault.functions.remainingExecutions().call()
wirefluid = vault.functions.wireFluid().call()
sponsor = vault.functions.sponsor().call()

print(f'Contract deployed at: {vault_addr}')
print(f'currentHash:         0x{current_hash.hex()}')
print(f'executionCount:      {exec_count}')
print(f'remainingExecutions: {remaining}')
print(f'wireFluid addr:      {wirefluid}')
print(f'sponsor:             {sponsor}')

# Check hash chain alignment
with open('glue/hash_chain.json') as f:
    chain = json.load(f)

root_hash = chain['rootHash']
print(f'hash_chain rootHash: {root_hash}')
is_match = ('0x'+current_hash.hex()) == root_hash
print(f'Root hash matches currentHash: {is_match}')
print(f'Total preimages in chain: {len(chain["preimages"])}')

# Validate first preimage (or rather the NEXT preimage based on exec_count)
p_next = chain['preimages'][exec_count]
p_next_bytes = bytes.fromhex(p_next.replace('0x',''))
valid = vault.functions.validatePreimage(p_next_bytes).call()
print(f'Next Preimage[{exec_count}] valid against currentHash: {valid}')
