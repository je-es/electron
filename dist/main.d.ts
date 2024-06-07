/**
 * @name                                    types.ts
 * @description                             types module
*/
interface i_baseEvents {
    onReady?: () => void;
    onClose?: () => void;
}
interface i_ipcEvents {
    [key: string]: {
        [key: string]: (...args: any[]) => any;
    };
}
interface i_events {
    app?: i_baseEvents;
    ipc?: i_ipcEvents;
}
interface i_meta {
    defaultWindow?: string;
    mainDirectory: string;
    logsDirectory?: string | null;
}
interface i_electron {
    meta?: i_meta;
    events?: i_events;
}

/**
 * @name                                    electron.ts
 * @description                             electron module
*/

/**
* Initializes the Electron application with the provided Electron options.
*
* @param {i_electron} options           - The options for the Electron application. Defaults to an empty object.
*
* @return {Promise<void>}               - A promise that resolves when the Electron application is successfully initialized.
*/
declare const electron: (options?: i_electron) => Promise<void>;

export { electron };
