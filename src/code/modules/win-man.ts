/**
 * @name                                    win-man.ts
 * @description                             WinMan module
*/



/* ┌─────────────────────────────────────── PACK ───────────────────────────────────────┐  */

    import { app, BrowserWindow }           from 'electron';
    import fs                              from 'fs';
    import path                            from 'path';

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── TYPE ───────────────────────────────────────┐  */

    import { i_winman, i_window, i_win_cnf, i_appEvents as i_win_evt }
    from './types';

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── DATA ───────────────────────────────────────┐  */

    declare const global : any;

    let data : i_winman;

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── CORE ───────────────────────────────────────┐  */

    export const WinMan
    =
    {
        setup  : async (defaultWindow : string) =>
        {
            try
            {
                // [0] Assign data
                {
                    data =
                    {
                        defaultWindow   : defaultWindow,
                        windows         : Helpers.initWindows(Helpers.fetchWindows()),
                    }
                }

                // [1] Create default window
                WinMan.create(data.defaultWindow);
            }

            catch(try_err)
            {
                global.log.error(`Failed to setup windows : ${try_err}`);

                throw try_err;
            }
        },

        create  : async (winName : string, callback ?: (winName : string) => void) =>
        {
            console.log('create', winName);
            try
            {
                // [0] Get window
                const win = Helpers.getWindowByName(winName);

                // [1] Create window
                const window = new BrowserWindow(win.config.electronOptions);

                // [2] Save window
                win._window = window;

                // [3] Load HTML
                win._window.loadFile(path.join(__dirname, '../src/code/static/index.html'));

                // [z] Extra Options
                {
                    // - Hide menu bar (if not configured || false
                    if(!win.config.options.menu)
                        win._window.setMenuBarVisibility(false);
                }

                // [x] Events
                {
                    if(win?.events?.onClose) win._window.on('closed', win.events.onClose);

                    win._window.on('ready-to-show', () =>
                    {
                        win._window?.show();

                        if(win.events?.onReady) win.events.onReady();
                    });
                }
            }

            catch(try_err)
            {
                global.log.error(`Failed to create window : ${try_err}`);

                throw try_err;
            }
        },

        close   : async (winName : string, callback ?: (winName : string) => void) =>
        {
            try
            {
                // [0] Get window
                const win = Helpers.getWindowByName(winName);

                // [1] Close window
                win._window?.close();
                win._window = undefined;
            }

            catch(try_err)
            {
                global.log.error(`Failed to close window : ${try_err}`);
            }
        },

        /**
         *
         * @returns { name: string, path: string }  - The focused window || default window
        */
        get     : () : any =>
        {
            for(let i = 0; i < data.windows.length; i++)
                if(data.windows[i]._window?.isFocused())
                    return { name: data.windows[i].name, path: data.windows[i].path };

            // return to default
            return WinMan.getDefault();
        },

        /**
         *
         * @returns { name: string, path: string }  - The default window
        */
        getDefault : () : any =>
        {
            let win = Helpers.getWindowByName(data.defaultWindow);

            return { name: win.name, path: win.path };
        }
    }

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── HELP ───────────────────────────────────────┐  */

    const defined = (obj : any) : boolean => typeof obj !== 'undefined';

    const Helpers =
    {
        fetchWindows                        : () : i_window[] =>
        {
            // - to store fetched windows
            let res : i_window[] = [];

            // - get windows root path
            const windowsRoot = path.join(global.__dirname, '/interface/windows/');

            // - read windows directory
            let windows = fs.readdirSync(windowsRoot);

            // - loop through windows
            for(let i = 0; i < windows.length; i++)
            {
                // - get window root path
                const windowRoot = path.join(windowsRoot, windows[i]);

                // - window config
                const config : i_win_cnf = JSON.parse(fs.readFileSync(path.join(windowRoot, '/config.json'), 'utf8'));

                // - window events
                const events : i_win_evt = require(path.join(windowRoot, '/events.js'));

                // - save fetched window
                res.push
                ({
                    name    : config.name,
                    path    : windowRoot,
                    config  : config,
                    events  : events,
                });
            }

            return res;
        },

        initWindows                         : (windows : i_window[]) =>
        {
            // - loop through windows
            for(let i = 0; i < windows.length; i++)
            {
                let electronOptions : any = {};

                // - size
                {
                    // - width
                    {
                        if(defined(windows[i].config.options.width))
                            electronOptions.width           = windows[i].config.options.width;

                        if(defined(windows[i].config.options.maxWidth))
                            electronOptions.maxWidth        = windows[i].config.options.maxWidth;

                        if(defined(windows[i].config.options.minWidth))
                            electronOptions.minWidth        = windows[i].config.options.minWidth;
                    }

                    // - height
                    {
                        if(defined(windows[i].config.options.height))
                            electronOptions.height          = windows[i].config.options.height;

                        if(defined(windows[i].config.options.maxHeight))
                            electronOptions.maxHeight       = windows[i].config.options.maxHeight;

                        if(defined(windows[i].config.options.minHeight))
                            electronOptions.minHeight       = windows[i].config.options.minHeight;
                    }
                }

                // - window
                {
                    if(defined(windows[i].config.options.frame))
                        electronOptions.frame               = windows[i].config.options.frame;

                    if(defined(windows[i].config.options.show))
                        electronOptions.show                = windows[i].config.options.show;

                    if(defined(windows[i].config.options.transparent))
                        electronOptions.transparent         = windows[i].config.options.transparent;
                }

                // - web preferences
                {
                    electronOptions.webPreferences = {};

                    // - preload
                    if(defined(windows[i].config.options.webPreferences.preload) && windows[i].config.options.webPreferences.preload)
                        electronOptions.webPreferences.preload = path.join(__dirname, '../src/code/modules/preload.js');
                    // electronOptions.webPreferences.preload = path.join(__dirname, './preload.js');

                    // - node integration
                    if(defined(windows[i].config.options.webPreferences.nodeIntegration))
                        electronOptions.webPreferences.nodeIntegration = windows[i].config.options.webPreferences.nodeIntegration;
                }

                windows[i].config.electronOptions = electronOptions;
            }

            return windows;
        },

        readConfig                          : () =>
        {
            // [1] Fetch windows

        },

        getWindowByName                    : (name : string) =>
        {
            const win = data.windows.find((window : i_window) => window.name === name);

            if(!win)
            throw new Error(`Window not found : ${name}`);

            return win;
        },
    };

/* └────────────────────────────────────────────────────────────────────────────────────┘  */

