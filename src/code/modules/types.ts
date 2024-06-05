/**
 * @name                                    types.ts
 * @description                             types module
*/



/* ┌─────────────────────────────────────── TYPE ───────────────────────────────────────┐  */

    export interface                        i_appEvents
    {
        onReady             ?: () => void;
        onClose             ?: () => void;
    }

    export interface                        i_ipcEvents
    {
        [key : string] : { [key : string] : (...args : any[]) => any }
    }

    export interface                        i_events
    {
        app                 ?: i_appEvents;
        ipc                 ?: i_ipcEvents;
    }

    export interface                        i_meta
    {
        defaultWindow       ?: string,

        mainDirectory       : string,
        logsDirectory       ?: string | null,
    }

    export interface                        i_electron
    {
        meta                ?: i_meta;
        events              ?: i_events;
    }

    export interface                        i_winman
    {
        defaultWindow       : string;
        windows             : t_windows;
    }

    export interface                        i_win_opt
    {
        width               ?: number;
        maxWidth            ?: number;
        minWidth            ?: number;

        height              ?: number;
        maxHeight           ?: number;
        minHeight           ?: number;

        frame               ?: boolean;
        show                ?: boolean;
        transparent         ?: boolean;

        menu                ?: boolean;

        webPreferences      ?: any;
    }

    export interface                        i_win_cnf
    {
        name                : string;
        options             : i_win_opt;
        electronOptions     ?: any;
    }

    export interface                        i_window
    {
        name                : string;
        path                : string;
        config              : i_win_cnf;
        events              : i_appEvents;
        _window             ?: Electron.BrowserWindow;
    }

    export type                             t_windows =
    i_window[]

/* └────────────────────────────────────────────────────────────────────────────────────┘  */
