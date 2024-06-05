# [@je-es/electron](../../../README.md) API

| API               Desc     |                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| [Tree](#tree)              | The project structure for building Electron applications.                                       |
| [Electron](#electron)      | Instructions for initializing the Electron application with the provided configuration options. |
| [IPC](#ipc)                | Handling Inter-Process Communication (IPC) events in Electron.                                  |
| [Examples](#file-examples) | Sample file configurations and examples used in the project.                                    |


---


- #### Tree

    > **Syntax for structuring your Electron project :**

  ```
  root
  ├─ .env
  └─ src
    ├─ code
    │  ├─ interface
    │  │  ├─ assets
    │  │  │  └─ css
    │  │  │     ├─ root.scss
    │  │  │     └─ style.scss
    │  │  ├─ components
    │  │  │  └─ component
    │  │  │     ├─ layout.pug
    │  │  │     ├─ preload.js
    │  │  │     └─ style.scss
    │  │  └─ windows
    │  │     └─ window
    │  │        ├─ config.json
    │  │        ├─ events.js
    │  │        ├─ layout.pug
    │  │        ├─ preload.js
    │  │        └─ style.scss
    │  └─ main.js
    ├─ tests
    └─ docs
    ...
  ```

---

- #### Electron

    - **Prototype**

        ```ts
        interface i_appEvents
        {
            onReady             ?: () => void;
            onClose             ?: () => void;
        }

        interface i_ipcEvents
        {
            [key : string] : { [key : string] : (...args : any[]) => any }
        }

        interface i_events
        {
            app                 ?: i_appEvents;
            ipc                 ?: i_ipcEvents;
        }

        interface i_meta
        {
            defaultWindow   ?: string,

            mainDirectory   : string,
            logsDirectory   ?: string | null,
        }

        interface i_electron
        {
            meta            ?: i_meta;
            events          ?: i_events;
        }
        ```

        ```ts
        const electron
        = async (options : i_electron = {})
        : Promise<void>
        ```

    - **Example**

      > _in `main.js`_

      ```ts
      import { electron } from '@je-es/electron';

      electron(
      {
            app :
            {
                onReady : () => (global as any).log.debug('App is ready !'),  // global.log is legal here
                onClose : () => (global as any).log.debug('App is closed !'), // ..
            },

            ipc :
            {
                // see IPC section
            }
      })
      ```

---

- #### IPC

    - #### Back-End

        - **Prototype**

            ```ts
            interface i_ipcEvents
            {
                [key : string] :                                // as groups
                {
                    [key : string] : (...args : any[]) => any   // as events
                }
            }
            ```

        - **Example**

            ```js
            // setup ipc events IN main.js
            ipc :                                 /* ipc : i_ipcEvents   */
            {
                'Emotions' :
                {
                    'greeting' : async (name) => `Hello ${name} !`,
                }
            }
            ```

    - #### Front-End

        - **Prototype**

            ```ts
            global.ipc
            = async (group : string, event : string, args ?: any)
            : Promise<void>
            ```

        - **Example**

            ```js
            // call ipc events FROM preload
            const res = await global.ipc('Emotions', 'greeting', 'Maysara'); // => Hello Maysara !
            ```

            ```js
            // call ipc events FROM browser
            const res = await window.ipc... // just replace the global with window !
            ```

---

- #### File Examples

    - `windows/window/config.json`

        ```json
        {
            "name" : "winName",

            "options" :
            {
                "width"                 : 300,
                "height"                : 300,
                "frame"                 : false,
                "show"                  : false,

                "webPreferences" :
                {
                    "preload"           : true,
                    "nodeIntegration"   : true
                }
            }
        }
        ```

    - `windows/window/events.js`

        ```js
        const win = await global.ipc('window', 'get');

        module.exports =
        {
            onStart: async () => global.log.debug(`${win.name} window loaded in Browser`),
            onClose: async () => global.log.debug(`${win.name} window loaded in Browser`),
        };
        ```

    - `windows/window/preload.js`

        ```js
        module.exports =
        {
            onLoad : async () =>
            {
                const win = await global.ipc('window', 'get');

                global.log.debug(`${win.name} window loaded in Browser`);
            }
        };
        ```

    - `windows/window/layout.pug`

        > **Pre-made HTML content**: The HTML code written here will be inside the `body` tag.

        ```pug
        h1='Hello World !'
        ```

    - `?.scss`

        > Style files associated with each element will be automatically detected without the need for a link:style tag.

        - `assets/css/root.scss`

            ```scss
            $font-stack         : Helvetica, sans-serif;
            $fg-color           : #ffe922;
            $bg-color           : #333;
            ```

        - `assets/css/style.scss`

            ```scss
            @import './root.scss';

            body
            {
                font              : 100% $font-stack;
                background-color  : $bg-color;
            }
            ```

        - `windows/window/style.scss`

            ```scss
            @import '../../assets/css/root.scss';

            h1
            {
                color             : $fg-color;
            }
            ```

---

> **Made with ❤ by [Maysara Elshewehy](https://github.com/Maysara-Elshewehy)**
