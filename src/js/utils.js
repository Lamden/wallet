export function copyToClipboard(textTOcopy='', callback=undefined){
    if (typeof textTOcopy === "string"){
        try{
            var dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.setAttribute("id", "copyhelper");
            document.getElementById("copyhelper").value=textTOcopy;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            
        } catch (e) {
            new Error('unable to copy')
        }
        if (callback){callback()}
    }
}