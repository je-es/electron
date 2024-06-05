# [@je-es](https://github.com/je-es)/electron

> A robust and standardized solution for creating a Desktop applications.

- #### 📥 Usage

    ```Bash
    npm i @je-es/electron
    ```

- #### 🌟 Syntax

  ```js
  import { electron } from '@je-es/electron';

  electron(
  {
      meta:
      {
        mainDirectory   ?: string,
        logsDirectory   ?: string,
        defaultWindow   ?: string,
        ...
      },

      events:
      {
        app :
        {
            onReady         ?: function,
            onClose         ?: function,
        },

        ipc :
        {
            'group' :
            {
                'event'      : function,
                ...
            },
            ...
        ...
      }
  });
  ```

---

### Documentation

  - [API](./src/docs/src/api.md)

---

> **Made with ❤ by [Maysara Elshewehy](https://github.com/Maysara-Elshewehy)**