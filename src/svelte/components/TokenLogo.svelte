<script>
    export let tokenMeta;
    export let width = '24px';
    export let margin = '0 10px';
    export let verticalAlign = "inherit";
    export let alt = "token logo";

    const genericIcon_base64_svg = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+";
    
    let height = width;
    let brokenLogoLink = false;

    $: id = tokenMeta ? 'token-logo-' + tokenMeta.tokenSymbol : ""
    $: svgLogo = tokenMeta ? tokenMeta.logo_base64_svg || undefined : undefined;
    $: pngLogo = tokenMeta ? tokenMeta.logo_base64_png || undefined : undefined;
    $: urlB64Logo = tokenMeta ? tokenMeta.logo_base64_url || undefined : undefined;
    $: urlLogo = tokenMeta ? tokenMeta.logo_url || undefined : undefined;

    $: placeholderLogo = !svgLogo && !pngLogo && !urlLogo && !urlB64Logo ? genericIcon_base64_svg : undefined;
</script>

<style>
    img{
        border-radius: 99px;
    }
</style>

{#if svgLogo || pngLogo}
    {#if svgLogo}   
        <img id={`${id}-svg`} style={`margin: ${margin};vertical-align: ${verticalAlign};`} {width} {height} src="{`data:image/svg+xml;base64,${svgLogo}`}" alt={alt}/>
    {:else if pngLogo}
        <img id={`${id}-png`} style={`margin: ${margin};vertical-align: ${verticalAlign};`} {width} {height} src="{`data:image/png;base64,${pngLogo}`}" alt={alt}/>
    {/if}
{:else}
    {#if urlB64Logo}   
        <img id={`${id}-urlB64`} style={`margin: ${margin};vertical-align: ${verticalAlign};`} {width} {height} src="{urlB64Logo}" alt={alt}/>
    {/if}

    {#if urlLogo && !urlB64Logo}
        {#if !brokenLogoLink}
            <img id={`${id}-url`} style={`margin: ${margin};vertical-align: ${verticalAlign};`} {width} {height} src="{urlLogo}" alt={alt} on:error={() => brokenLogoLink = true}/>
        {:else}
            <img id={`${id}-url`} style={`margin: ${margin};vertical-align: ${verticalAlign};`} {width} {height} src="{`data:image/svg+xml;base64,${genericIcon_base64_svg}`}" alt={alt}/>
        {/if}
    {/if}
{/if}

{#if placeholderLogo}   
    <img id={`${id}-placeholder`} style={`margin: ${margin};vertical-align: ${verticalAlign};`} {width} {height} src="{`data:image/svg+xml;base64,${placeholderLogo}`}" alt={alt}/>
{/if}



