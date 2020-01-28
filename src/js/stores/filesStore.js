import { writable, derived, get } from 'svelte/store';

function isString(value){
    if(Object.prototype.toString.call(value) === "[object String]") return true;
    return false;
}

const createFilesStore = (key) => {
    //Default File Content that will be created
    const defaultFile = {
        name: 'New Contract',
        code: [
            '# Get started @ https://contracting.lamden.io/',
            '',
            '@export',
            'def first_method(value):',
            '	return value',
        ].join('\n'),
        type: 'local',
        selected: true
    }

    //Set intial value. Will get overwritten if by localstorage state if it exists
    let startValue = [JSON.parse(JSON.stringify(defaultFile))];
    //Get Local Storage value
    const json = localStorage.getItem(key);
    
    //Set intial value to local storage value if it exists 
    if (json) {
        startValue = JSON.parse(json)
    }
    //Create File Store
    const FilesStore = writable(startValue);

    //This funtion gets call everytime the FileStore is updated
    FilesStore.subscribe(current => {
        //Check to make sure the value we just updated in memory is an Array
        if (Array.isArray(current)) {
            localStorage.setItem(key, JSON.stringify(current));
        }else{
            //If the value was not an array then set the memory value back to the previous localstorage value
            let json = localStorage.getItem(key)
            if (json) FilesStore.set(JSON.parse(json))
            console.log('Recovered from bad Files Store Value')
        }
    });

    let subscribe = FilesStore.subscribe;
    let update = FilesStore.update;
    let set = FilesStore.set;

    return {
        startValue,
        defaultFile,
        subscribe,
        set,
        update,
        //Add a new default file to the internal store
        addNewFile: () => {
            FilesStore.update(filesstore => {
                //Make all files unselected
                filesstore.map(file => file.selected = false)
                filesstore.push(JSON.parse(JSON.stringify(defaultFile)))
                //Make the new file selected
                filesstore[filesstore.length - 1].selected = true;
                return filesstore;
            })
        },
        //Add a file to the file store by specifying the information
        addExistingContract: (name, code, methods, network) => {
            //Return if arguments are undefined and incorrect types
            if (!name || typeof name === 'undefined' || !isString(name)) return;
            if (typeof methods === 'undefined' || !isString(code)) return;
            if (!methods || typeof methods === 'undefined' || !Array.isArray(methods)) return;
            if (!network || typeof network === 'undefined' || !isString(network)) return;

            //Add new files to the files store
            FilesStore.update(filesstore => {
                filesstore.map(file => file.selected = false)
                let newFile = {
                    name,
                    code,
                    methods,
                    type: 'online',
                    network,
                    selected: true

                }
                filesstore.push(newFile)
                return filesstore;
            })
        },
        //Change the current file to be active in the IDE
        activeTab: (index) => {
            //Return if index is undefined or not a an Integer
            if (typeof index === 'undefined' || !Number.isInteger(index)) return;
            FilesStore.update(filesstore => {
                //Set all files in store as unselected
                filesstore.map(file => file.selected = false)
                //Select current file index
                filesstore[index].selected = true;
                return filesstore;
            })
        },
        //Change the name of a file
        changeName:(newName, index) => {
            //Return if arguments are undefined or incorrect types
            if (!newName || typeof newName === 'undefined' || !isString(newName)) return;
            if (typeof index === 'undefined' || !Number.isInteger(index)) return;
            
            FilesStore.update(filesstore => {
                //Set new name of file
                filesstore[index].name = newName;
                return filesstore;
            })
        },
        updateCode:(code, index) => {
            //Return if arguments are undefined or incorrect types
            if (typeof code === 'undefined' || !isString(code)) return;
            if (typeof index === 'undefined' || !Number.isInteger(index)) return;
            FilesStore.update(filesstore => {
                //Set new code in file
                filesstore[index].code = code;
                return filesstore;
            })
        },
        deleteTab: (index) => {
            //Return if index is undefined or not an integer
            if (typeof index === 'undefined' || !Number.isInteger(index)) return;
            FilesStore.update(filesstore => {
                //remove index from array
                filesstore.splice(index, 1);
                //If that leaves us with an empty array then push a default file to it
                if (filesstore.length === 0) filesstore.push(defaultFile);
                else {
                    //See if there is a seleted file in the store
                    let selected =  filesstore.find(f => f.selected)
                    //If there isn't then set the next file as selected
                    //if that isn't possible then set the first file in the store as selected
                    if (!selected) {
                        try{
                            filesstore[index].selected = true
                        } catch (e) {
                            filesstore[0].selected  = true
                        }
                    }
                }
                return filesstore;
            })    
        }
    };
}

//Create Files Store
export const FilesStore = createFilesStore('files');

//Create a store for the current active tab (selected = true)
export const activeTab = derived(FilesStore, ($FilesStore) => {
    let active = $FilesStore.find(file => file.selected)
    active.index = $FilesStore.findIndex(file => active === file)
    return active;
});