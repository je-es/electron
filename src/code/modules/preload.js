/**
 * @name                                    preload.js
 * @description                             preload module
*/



/* ┌─────────────────────────────────────── PACK ───────────────────────────────────────┐  */

    const { ipcRenderer, contextBridge }    = require('electron');
    const { logger }                        = require('@je-es/log');
    const path                              = require('path');
    const { addLayout, addStyle }           = require('./layout');
    const cmpMan = require('./cmp-man');

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── CORE ───────────────────────────────────────┐  */

    const onLoad
    = async () =>
    {
        try
        {
            let win;

            // [0] Requirments
            {
                // - logger
                {
                    global.log = new logger( await ipcRenderer.invoke('events', { group: 'temp', event: 'prolog-options' }) );
                }

                // - ipc
                {
                    global.ipc = async (group, event, args) => await ipcRenderer.invoke('events', { group, event, args });
                    contextBridge.exposeInMainWorld('call', global.ipc);
                }

                // - mainDirectory
                {
                    global.mainDirectory = await global.ipc('temp', 'mainDirectory');
                }
            }

            // [1] Load window
            {
                // what is the name of this window ? Find a way to get it
                win = await global.ipc('window', 'get');

                // load the default window style
                addStyle(path.join(win.path, '../../assets/css/style'));

                // load the window layout
                addLayout(win.path);

                // load the window script
                const windowScript = require(win.path + '/preload.js');
                await windowScript.onLoad();
            }

            // [2] Load components
            if(win.components)
            {
                const components = await cmpMan.setup(win.components, win.name)
            }

            global.log.debug('Preload loaded !');
        }

        catch(error)
        {
            console.error(`Failed to create window : ${error}`);
            throw error;
        }
    };

    document.addEventListener('DOMContentLoaded', onLoad)

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── HELP ───────────────────────────────────────┐  */


/* └────────────────────────────────────────────────────────────────────────────────────┘  */
