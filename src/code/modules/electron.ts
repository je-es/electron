/**
 * @name                                    electron.ts
 * @description                             electron module
*/



/* ┌─────────────────────────────────────── PACK ───────────────────────────────────────┐  */

    import pug                              from 'pug';
    import sass                             from 'sass';
    import { WinMan }                       from './win-man';
    import { logger }                       from '@je-es/log';
    import { app, BrowserWindow, ipcMain }  from 'electron';

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── TYPE ───────────────────────────────────────┐  */

    import { i_electron, i_ipcEvents }        from './types';

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── DATA ───────────────────────────────────────┐  */

    declare const global: any;

    let data: i_electron;

    const static_ipcEvents: i_ipcEvents =
    {
        'window':
        {
            'get'               : (args: any) =>
            WinMan.get(),

            'create'            : (winName: string) =>
            WinMan.create(winName),

            'close'             : (winName: string) =>
            WinMan.close(winName),
        },

        'libs':
        {
            'pug'               : (args: any) =>
            pug.compileFile(args.targetPath, args.options)(args.data),

            'sass'              : (args: any) =>
            sass.compile(args.targetPath).css,
        },

        'temp':
        {
            'prolog-options'    : (): string =>
            {
                if (data.meta?.logsDirectory) return data.meta?.logsDirectory;
                if (data.meta?.mainDirectory) return data.meta?.mainDirectory;
                return process.cwd();
            },

            'mainDirectory': () =>
            global.mainDirectory,
        }
    };

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── CORE ───────────────────────────────────────┐  */

    /**
    * Initializes the Electron application with the provided Electron options.
    *
    * @param {i_electron} options           - The options for the Electron application. Defaults to an empty object.
    *
    * @return {Promise<void>}               - A promise that resolves when the Electron application is successfully initialized.
    */
    export const electron
    = async (options: i_electron = {})
    : Promise<void> =>
    {
        try
        {
            // [0] Requirments
            {
                if (!global.log)
                {
                    const root = options.meta?.mainDirectory || process.cwd();
                    global.log = new logger({ root, save: true });
                }
            }

            // [1] Assign data
            {
                data = options;

                // - add ipc events
                if (data.events)
                {
                    if (!data.events.ipc) data.events.ipc = static_ipcEvents;
                    else
                    {
                        for (const group in static_ipcEvents)
                        {
                            if (!data.events.ipc[group]) data.events.ipc[group] = static_ipcEvents[group];
                            else
                            {
                                for (const event in static_ipcEvents[group])
                                    if (!data.events.ipc[group][event]) data.events.ipc[group][event] = static_ipcEvents[group][event];
                            }
                        }
                    }

                    // - global window api
                    global.win = data.events.ipc.window;
                }

                // - set global __dirname
                global.mainDirectory = options.meta?.mainDirectory || process.cwd();
            }

            // [2] Bind events
            {
                app.on('window-all-closed', Helpers.onWindowAllClosed);
                app.on('ready', Helpers.onReady);
            }
        }

        catch (error)
        {
            console.error(`Failed to start electron : ${error}`);
            throw error;
        }
    };

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── HELP ───────────────────────────────────────┐  */

    const Helpers =
    {
        /**
         * Executes the onWindowAllClosed function asynchronously.
         *
         * This function is called when all windows are closed. It performs the following steps:
         * 1. If there is a close callback defined in the data.events.app object, it awaits its execution.
         * 2. If the current platform is not 'darwin' (i.e., not macOS), it quits the application.
         *
         * @return {Promise<void>} A promise that resolves when the function completes.
        */
        onWindowAllClosed: async () =>
        {
            // [0] Use close callback
            if (data.events && data.events.app && data.events.app.onClose)
                await data.events.app.onClose(); // - keep await

            // [1] Close application
            if (process.platform !== 'darwin')
            {
                // - on OS X it is common for applications and their menu bar
                // - to stay active until the user quits explicitly with Cmd + Q
                app.quit();
            }
        },

        /**
         * Executes the onReady function asynchronously.
         *
         * This function sets up IPC event handling and initializes the Electron application.
         * It checks if the IPC has a group and an event, and calls the event with the provided arguments.
         * If the IPC is not found or the group or event is not found, an error is thrown.
         * The function also checks if the 'onReady' callback is defined in the 'data.events.app' object,
         * and if so, it awaits its execution.
         * Finally, it creates a default window if no windows are currently open.
         *
         * @return {Promise<void>} A promise that resolves when the onReady function is successfully executed.
        */
        onReady: async () =>
        {
            // [0] Events
            ipcMain.handle('events', async (event, options: { group: string, event: string, args: any }) =>
            {
                try
                {
                    // ! check if data.events.ipc
                    if (!data.events || !data.events.ipc)
                        throw new Error(`data.events.ipc not found`);

                    // ! check if the IPC has a group
                    if (!data.events.ipc[options.group])
                        throw new Error(`data.events.ipc.group not found: ${options.group}`);

                    // ! check if the IPC has an event
                    if (!data.events.ipc[options.group][options.event])
                        throw new Error(`data.events.ipc.group.event not found: ${options.group}.${options.event}`);

                    // - call the event
                    const res = await data.events.ipc[options.group][options.event](options.args);

                    // - return the result
                    return res;
                }

                catch (err : any)
                {
                    console.error(`Error handling IPC event: ${err.message}`);
                    throw err;
                }
            });

            // [1] Use ready callback
            if (data.events && data.events.app && data.events.app.onReady)
                await data.events.app.onReady(); // - keep await

            // [2] Create default window
            if (BrowserWindow.getAllWindows().length === 0)
                await WinMan.setup(data.meta?.defaultWindow || 'splash');
        },
    };

/* └────────────────────────────────────────────────────────────────────────────────────┘  */
