<script>
    import { onMount } from 'svelte';
    import * as QRCode from 'easyqrcodejs';
   
     export let text;
     let node;
   
     onMount(() => {
       const options = {
         text,
         width: 160,
         height: 160,
         quietZone: 2,
       };
       new QRCode(node, options);
     });
   </script>
   
   <div bind:this={node} mar></div>
   
   <style>
    div {
      /* make QR-wrapper squared */
       width: 100%;
       height: 100%;
       position: relative;
       z-index: 1;
     }
     div :global(canvas) {
       /* fit QR to wrapper */
       width: 100%;
       height: 100%;
       position: absolute;
       left: 0;
       top: 0;
     }
   </style>