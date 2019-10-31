<script>
//Stores
import { SettingsStore, currencies, currencyCode } from '../../js/stores/stores.js';

let selected;

function saveCurrency(currency){
    SettingsStore.setCurrency(currency);
}

function isSelected(value){
    return $currencyCode === value.code;
}

</script>

{#if currencies}
    <div>
        <label>Current Currency</label><br>
        <select bind:value={selected}
                on:change={() => saveCurrency(selected)}>
            {#each $SettingsStore.currency.list as currency }
                <option value={currency} selected={isSelected(currency)}>{`${currency.code} - ${currency.name}`}</option>
            {/each}
        </select>
    </div>
{/if}
