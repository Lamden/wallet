<script>
//Stores
import { SettingsStore, currencies } from '../../js/stores/stores.js';

let selected;

function saveCurrency(currency){
    SettingsStore.setCurrency(currency);
}

</script>

{#if currencies}
    <div>
        <label>Current Currency</label><br>
        <select bind:value={selected}
                on:change={() => saveCurrency(selected)}>
            {#each $SettingsStore.currency.list as currency }
                <option value={currency}>{`${currency.code} - ${currency.name}`}</option>
            {/each}
        </select>
    </div>
{/if}
