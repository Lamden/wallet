<script>
  import Monaco from './IdeMonacoEditor.svelte';

  //Components
  import { IdeErrorsBox }  from '../../js/router.js'
  
  let monaco;
  window['monaco'] = monaco;

  let errorsList = ["Line:1:3 - Error", "Line:2:30- Error as well"]
</script>

<style>
  #monaco_window {

  }
  /*
  * :global(.buttons) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
    width: 500px;
  }
  */
</style>

<div id="monaco_window" class="flex-column">
  <Monaco bind:this={monaco} />
  <IdeErrorsBox {errorsList} />
</div>