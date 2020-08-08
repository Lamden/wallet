import { writable, derived, get } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 
import { networkKey } from './stores.js';
import { isFileObj } from '../objectValidations';
import { defaultFileCode, makeContractHeader } from './defaults.js';

const createFilesStore = () => {
    let initialized = false;

    //Default File Content that will be created
    const defaultFile = {
        name: 'New Contract',
        code: defaultFileCode,
        type: 'local',
        selected: true
    }

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"files": [JSON.parse(JSON.stringify(defaultFile))]}, function(getValue) {
            initialized = true;
            FilesStore.set(getValue.files)
        });
    }

    //Create Intial Store
    const FilesStore = writable([]);

    //This is called everytime the FilesStore updated
    FilesStore.subscribe(current => {
        if (!initialized) {
            return current
        }
        //Only accept an object that can be determined to be a networks storage object
        // if store has already been initialized
        if (validateTypes.isArray(current)) {
            chrome.storage.local.set({"files": current});
        }else{
            //If non-object found then set the store back to the previous local store value
            getStore()
        }
    });

    //Set the NetworksStore to the value of the chome.storage.local
    getStore()

    let subscribe = FilesStore.subscribe;
    let update = FilesStore.update;
    let set = FilesStore.set;

    return {
        defaultFile,
        subscribe,
        set,
        update,
        //Add a new default file to the internal store
        addDefaultFile: () => {
            FilesStore.update(filesstore => {
                //Make all files unselected
                filesstore.map(file => file.selected = false)
                filesstore.push(JSON.parse(JSON.stringify(defaultFile)))
                //Make the new file selected
                filesstore[filesstore.length - 1].selected = true;
                return filesstore;
            })
        },
        //Add a new default file to the internal store
        addBlankFile: () => {
            FilesStore.update(filesstore => {
                //Make all files unselected
                filesstore.map(file => file.selected = false)
                let newFile = JSON.parse(JSON.stringify(defaultFile))
                newFile.code = ''
                filesstore.push(newFile)
                //Make the new file selected
                filesstore[filesstore.length - 1].selected = true;
                return filesstore;
            })
        },
        //Add a file to the file store by specifying the information
        addFile: (name, code, methods, networkObj) => {
            //Return if arguments are undefined and incorrect types
            if (!isFileObj(name, code, methods, networkObj)) return;

            //Add reminder to the use where the contract exists
            code = `${makeContractHeader(networkObj.name)}\n${code}`

            //Add new files to the files store
            FilesStore.update(filesstore => {
                filesstore.map(file => file.selected = false)
                let newFile = {
                    name,
                    code,
                    methods,
                    type: 'online',
                    networkKey: networkKey(networkObj),
                    network: networkObj.name,
                    selected: true

                }
                filesstore.push(newFile)

                return filesstore;
            })
        },
        //Change the current file to be active in the IDE
        activeTab: (index) => {
            //Return if index is undefined or not a an Integer
            if (!validateTypes.isInteger(index)) return;

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
            if (!validateTypes.isStringWithValue(newName) || !validateTypes.isInteger(index)) return;
            
            FilesStore.update(filesstore => {
                //Set new name of file
                filesstore[index].name = newName;
                return filesstore;
            })
        },
        updateCode:(code, index) => {
            //Return if arguments are undefined or incorrect types
            if (!validateTypes.isString(code) || !validateTypes.isInteger(index)) return;

            FilesStore.update(filesstore => {
                //Set new code in file
                filesstore[index].code = code;
                return filesstore;
            })
        },
        deleteTab: (index) => {
            //Return if index is undefined or not an integer
            if (!validateTypes.isInteger(index)) return;

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
export const FilesStore = createFilesStore();

//Create a store for the current active tab (selected = true)
export const activeTab = derived(FilesStore, ($FilesStore) => {
    let active = $FilesStore.find(file => file.selected)
    active.index = $FilesStore.findIndex(file => active === file)
    return active;
});