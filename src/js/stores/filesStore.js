import { writable, derived } from 'svelte/store';

const createFilesStore = (key) => {
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

    let startValue = [defaultFile];

    const json = localStorage.getItem(key);
    if (json) {
        startValue = JSON.parse(json)
    }
    const FilesStore = writable(startValue);
    FilesStore.subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
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
        addNewTab: () => {
            FilesStore.update(filesstore => {
                filesstore.map(file => file.selected = false)
                filesstore.push(JSON.parse(JSON.stringify(defaultFile)))
                filesstore[filesstore.length - 1].selected = true;
                return filesstore;
            })
        },
        addExistingContract: (name, code, methods, network) => {
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
        activeTab: (index) => {
            FilesStore.update(filesstore => {
                filesstore.map(file => file.selected = false)
                filesstore[index].selected = true;
                return filesstore;
            })
        },
        changeName:(name, index) => {
            FilesStore.update(filesstore => {
                filesstore[index].name = name;
                return filesstore;
            })
        },
        updateCode:(code, index) => {
            FilesStore.update(filesstore => {
                filesstore[index].code = code;
                return filesstore;
            })
        },
        deleteTab: (index) => {
            FilesStore.update(filesstore => {
                filesstore.splice(index, 1);
                if (filesstore.length === 0) filesstore.push(defaultFile);
                else {
                    let selected =  filesstore.find(f => f.selected)
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

//Files Stores
export const FilesStore = createFilesStore('files');

export const activeTab = derived(FilesStore, ($FilesStore) => {
    let active = $FilesStore.find(file => file.selected)
    active.index = $FilesStore.findIndex(file => active === file)
    return active;
});