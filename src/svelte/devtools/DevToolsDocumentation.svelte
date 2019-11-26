<script>
    //Images
    import { backgrounds, icons } from '../../js/images.js';
    const { github_bg, squares_bg } = backgrounds;
    const { doco } = icons;

    function openLink(url){
        window.open(url, '_blank');
    }
    
    let docoLinks = [
        {
            name:'Contracting',
            desc:'Write smart contracts in Python',
            url:'https://contracting.lamden.io/',
            image: squares_bg
        },
        {
            name: 'Mockchain',
            desc: 'Run a local Lamden testnet',
            url: 'https://github.com/Lamden/mockchain',
            image: github_bg
        },
        {
            name: 'Lampy',
            desc: 'Lamden blockchain client for Python',
            url: 'https://github.com/Lamden/lampy',
            image: github_bg
        }
    ]

</script>

<style>
.box{
    display: flex;
    flex-direction: column;
}

.box-link{
    cursor: pointer;
}

.docos-box{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.doco{
    display: flex;
    flex-direction: column;
    margin-right: 20px;
    margin-bottom: 20px;
}

.image{
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 4px;
    height: 232px;
    width: 352px;
}

.content{
    display: flex;
    flex-direction: row;
    background: #272727;
    border-radius: 0px 0px 4px 4px;
    padding: 16px 16px 16px 23px;
}

.logo{
    margin-right: 20px;
}

</style>
 
<div class="box text-primary">
    <h5>Documentation</h5>
    <div class="docos-box">
        {#each docoLinks as docoLink}
            <div class="doco box-link" on:click={() => openLink(docoLink.url) }>
                <div 
                    class="image" 
                    style="background-image: url({docoLink.image});">
                </div>
                <div class="content">
                    <img class="logo" src={doco} alt="doco logo" />
                    <div>
                        <h6>{docoLink.name}</h6>
                        <div class="text-body2 text-primary-dark">{docoLink.desc}</div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>