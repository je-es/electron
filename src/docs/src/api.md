# [@je-es/electron](../../../README.md) API

> **You must read and understand every letter of this document before you start creating your own projects**

| API                        | Desc                                                                                            |
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
    │  │        ├─ config.json
    │  │  │     ├─ build.js
    │  │  │     ├─ layout.pug
    │  │  │     └─ style.scss
    │  │  └─ windows
    │  │     └─ window
    │  │        ├─ config.json
    │  │        ├─ events.js
    │  │        ├─ preload.js
    │  │        ├─ layout.pug
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
        const electron
        = async (options : i_electron = {})
        : Promise<void>
        ```

    - **Example**

      ```ts
      // as `main.js`
      import { electron } from '@je-es/electron';

      electron(
      {
            meta:
            {
                defaultWindow   : 'splash',
                mainDirectory   : path.join(__dirname, '/'),
                logsDirectory   : path.join(__dirname, '../../'),
            },

            events:
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
            }
      })
      ```

    - **Types**

        ```ts
        interface i_electron
        {
            meta            ?: i_meta;
            events          ?: i_events;
        }
        ```

        ```ts
        interface i_meta
        {
            defaultWindow   ?: string,
            mainDirectory   : string,
            logsDirectory   ?: string | null,
        }
        ```

        ```ts
        interface i_events
        {
            app                 ?: i_baseEvents;
            ipc                 ?: i_ipcEvents;
        }
        ```

        ```ts
        interface i_baseEvents
        {
            onReady             ?: () => void;
            onClose             ?: () => void;
        }
        ```

        ```ts
        interface i_ipcEvents
        {
            [key : string] : { [key : string] : (...args : any[]) => any }
        }
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

    - `windows/?/*`

      - `windows/?/config.json`

          - **Example**

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

                        "contextIsolation"  : true,
                        "nodeIntegration"   : false,
                        "sandbox"           : false
                    }
                }
            }
            ```

          - **Types**

              ```ts
              interface i_win_opt
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

                  menu                ?: boolean; // if true, hide the menu

                  webPreferences      ?: any;     // .preload as boolean not string
              }
              ```

              > `webPreferences.preload` is boolean, **not string**_(path like the default in electron)_
              >
              > **By enabling it**, the script/layout (and its assets like styles, images,...) and components will be loaded, and you can manage the program in a really easy way

      - `windows/?/events.js`

          - **Example**

              ```js
              let win;

              module.exports =
              {
                  onReady: async () =>
                  {
                      win = await global.win.get();

                      global.log.debug(`${win.name} window loaded in Browser`);

                      setTimeout(async () =>
                      {
                          await global.win.create('main');
                          await global.win.close(win.name);
                      }, 1000);
                  },

                  onClose: async () => global.log.debug(`${win.name} window closed in Browser`),
              };
              ```

          - **Types**

              ```ts
              interface i_baseEvents
              {
                  onReady             ?: () => void;
                  onClose             ?: () => void;
              }
              ```

          - **`global.win`**

              > in `events.js` file you can use the following functions

              ```js
              // Create a window
              global.win.create(winName);
              ```

              ```js
              // Close the window
              global.win.close(winName);
              ```

              ```js
              // Get focused window || default window
              global.win.get();
              ```


      - `windows/?/preload.js`

          - **Example**

              ```js
              module.exports =
              {
                  onLoad : async () =>
                  {
                      const win = await global.ipc('window', 'get')

                      global.log.debug(`${win.name} window loaded in Browser`);
                  }
              };
              ```

          - **Types**

            > **This is Javascript**, so just **Follow the following syntax :**

            ```ts
            {
                // The main function [REQUIRED]
                onLoad               : () => void;
            }
            ```

      - `windows/?/layout.pug`

          - **Example**

              > **Pre-made HTML content**: The HTML code written here will be inside the `body` tag.

              ```pug
              h1="In " + winName + " Window"
              ```

              > `winName` : Provides a current window name.

      - `?.scss`

          - **Examples**

              > Style files associated with each element will be automatically detected without the need for a link:style tag.

              - `assets/css/root.scss`

                  ```scss
                  $font-stack         : Helvetica, sans-serif;
                  $fg-color           : #ffe922;
                  $bg-color           : #333;
                  ```

              - `assets/css/style.scss`

                  ```scss
                  @use './root' as root;

                  body
                  {
                      font              : 100% root.$font-stack;
                      background-color  : root.$bg-color;
                  }
                  ```

              - `windows/*/style.scss`

                  ```scss
                  @use '../../assets/css/root' as root;

                  h1
                  {
                  color             : root.$fg-color;
                  }
                  ```

    - `components/?/*`


      - `components/?/config.json`

          - **Example**

            ```json
            {
                "name" : "componentName",

                "options" :
                {
                    "loc":
                    {
                        "inside" : "body"
                    }
                }
            }
            ```

          - **Types**

            > This is **Javascript** so just follow this syntax:

            ```ts
            interface i_cmp_cnf
            {
                name                : string;
                options             : i_cmp_opt;
            }
            ```


            ```ts
            interface i_cmp_opt
            {
                loc ?:
                {
                    inside ?: string;
                    as     ?: string;
                }
            }
            ```

      - `components/?/build.js`

          - **Example**

            ```js
            module.exports =
            {
                onAwake: async () =>
                {
                    global.log.debug(`my component loaded`);
                },

                onStart: async () =>
                {
                    global.log.debug(`my component main code !`);
                },

                onFinish: async () =>
                {
                    global.log.debug(`my component finished`);
                },
            };
            ```

          - **Types**

            > **This is Javascript**, so just **Follow the following syntax :**

            ```ts
            {
                onAwake             : () => void;   // call when loading this component
                onStart             : () => void;   // call when loading all the components [by order]
                onFinish            : () => void;   // call when the onStart finished
            }
            ```

      - `components/?/layout.pug`

        > **Same as `windows`**

      - `components/?/?.scss`

        > **Same as `windows`**

  ---

  > **Made with ❤ by [Maysara Elshewehy](https://github.com/Maysara-Elshewehy)**
