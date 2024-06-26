"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/code/main.ts
var main_exports = {};
__export(main_exports, {
  electron: () => electron
});
module.exports = __toCommonJS(main_exports);

// src/code/modules/electron.ts
var import_pug = __toESM(require("pug"));
var import_sass = __toESM(require("sass"));

// src/code/modules/win-man.ts
var import_electron = require("electron");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var data;
var WinMan = {
  setup: (defaultWindow) => __async(void 0, null, function* () {
    try {
      {
        data = {
          defaultWindow,
          windows: Helpers.initWindows(Helpers.fetchWindows())
        };
      }
      WinMan.create(data.defaultWindow);
    } catch (try_err) {
      global.log.error(`Failed to setup windows : ${try_err}`);
      throw try_err;
    }
  }),
  create: (winName, callback) => __async(void 0, null, function* () {
    var _a;
    try {
      const win = Helpers.getWindowByName(winName);
      const window = new import_electron.BrowserWindow(win.config.electronOptions);
      win._window = window;
      win._window.loadFile(import_path.default.join(__dirname, "../src/code/static/index.html"));
      {
        if (!win.config.options.menu)
          win._window.setMenuBarVisibility(false);
      }
      {
        if ((_a = win == null ? void 0 : win.events) == null ? void 0 : _a.onClose)
          win._window.on("closed", win.events.onClose);
        win._window.on("ready-to-show", () => {
          var _a2, _b;
          if (callback)
            callback(winName);
          (_a2 = win._window) == null ? void 0 : _a2.show();
          if ((_b = win.events) == null ? void 0 : _b.onReady)
            win.events.onReady();
        });
      }
    } catch (try_err) {
      global.log.error(`Failed to create window : ${try_err}`);
      throw try_err;
    }
  }),
  close: (winName, callback) => __async(void 0, null, function* () {
    var _a;
    try {
      const win = Helpers.getWindowByName(winName);
      (_a = win._window) == null ? void 0 : _a.close();
      win._window = void 0;
    } catch (try_err) {
      global.log.error(`Failed to close window : ${try_err}`);
    }
  }),
  /**
   *
   * @returns { name: string, path: string }  - The focused window || default window
  */
  get: () => {
    var _a;
    for (let i = 0; i < data.windows.length; i++)
      if ((_a = data.windows[i]._window) == null ? void 0 : _a.isFocused())
        return { name: data.windows[i].name, path: data.windows[i].path, components: data.windows[i].config.components };
    return WinMan.getDefault();
  },
  /**
   *
   * @returns { name: string, path: string }  - The default window
  */
  getDefault: () => {
    let win = Helpers.getWindowByName(data.defaultWindow);
    return { name: win.name, path: win.path, components: win.config.components };
  }
};
var defined = (obj) => typeof obj !== "undefined";
var Helpers = {
  fetchWindows: () => {
    let res = [];
    const windowsRoot = import_path.default.join(global.mainDirectory, "/interface/windows/");
    let windows = import_fs.default.readdirSync(windowsRoot);
    for (let i = 0; i < windows.length; i++) {
      const windowRoot = import_path.default.join(windowsRoot, windows[i]);
      const config = JSON.parse(import_fs.default.readFileSync(import_path.default.join(windowRoot, "/config.json"), "utf8"));
      const events = require(import_path.default.join(windowRoot, "/events.js"));
      res.push({
        name: config.name,
        path: windowRoot,
        config,
        events
      });
    }
    return res;
  },
  initWindows: (windows) => {
    for (let i = 0; i < windows.length; i++) {
      let electronOptions = {};
      {
        {
          if (defined(windows[i].config.options.width))
            electronOptions.width = windows[i].config.options.width;
          if (defined(windows[i].config.options.maxWidth))
            electronOptions.maxWidth = windows[i].config.options.maxWidth;
          if (defined(windows[i].config.options.minWidth))
            electronOptions.minWidth = windows[i].config.options.minWidth;
        }
        {
          if (defined(windows[i].config.options.height))
            electronOptions.height = windows[i].config.options.height;
          if (defined(windows[i].config.options.maxHeight))
            electronOptions.maxHeight = windows[i].config.options.maxHeight;
          if (defined(windows[i].config.options.minHeight))
            electronOptions.minHeight = windows[i].config.options.minHeight;
        }
      }
      {
        if (defined(windows[i].config.options.frame))
          electronOptions.frame = windows[i].config.options.frame;
        if (defined(windows[i].config.options.show))
          electronOptions.show = windows[i].config.options.show;
        if (defined(windows[i].config.options.transparent))
          electronOptions.transparent = windows[i].config.options.transparent;
      }
      {
        electronOptions.webPreferences = {};
        if (defined(windows[i].config.options.webPreferences.preload) && windows[i].config.options.webPreferences.preload)
          electronOptions.webPreferences.preload = import_path.default.join(__dirname, "../src/code/modules/preload.js");
        if (defined(windows[i].config.options.webPreferences.nodeIntegration))
          electronOptions.webPreferences.nodeIntegration = windows[i].config.options.webPreferences.nodeIntegration;
        if (defined(windows[i].config.options.webPreferences.contextIsolation))
          electronOptions.webPreferences.contextIsolation = windows[i].config.options.webPreferences.contextIsolation;
        if (defined(windows[i].config.options.webPreferences.sandbox))
          electronOptions.webPreferences.sandbox = windows[i].config.options.webPreferences.sandbox;
      }
      windows[i].config.electronOptions = electronOptions;
    }
    return windows;
  },
  getWindowByName: (name) => {
    const win = data.windows.find((window) => window.name === name);
    if (!win)
      throw new Error(`Window not found : ${name}`);
    return win;
  }
};

// src/code/modules/electron.ts
var import_log = require("@je-es/log");
var import_electron2 = require("electron");
var data2;
var static_ipcEvents = {
  "window": {
    "get": (args) => WinMan.get(),
    "create": (winName) => WinMan.create(winName),
    "close": (winName) => WinMan.close(winName)
  },
  "libs": {
    "pug": (args) => import_pug.default.compileFile(args.targetPath, args.options)(args.data),
    "sass": (args) => import_sass.default.compile(args.targetPath).css
  },
  "temp": {
    "prolog-options": () => {
      var _a, _b, _c, _d;
      if ((_a = data2.meta) == null ? void 0 : _a.logsDirectory)
        return (_b = data2.meta) == null ? void 0 : _b.logsDirectory;
      if ((_c = data2.meta) == null ? void 0 : _c.mainDirectory)
        return (_d = data2.meta) == null ? void 0 : _d.mainDirectory;
      return process.cwd();
    },
    "mainDirectory": () => global.mainDirectory
  }
};
var electron = (..._0) => __async(void 0, [..._0], function* (options = {}) {
  var _a, _b;
  try {
    {
      if (!global.log) {
        const root = ((_a = options.meta) == null ? void 0 : _a.mainDirectory) || process.cwd();
        global.log = new import_log.logger({ root, save: true });
      }
    }
    {
      data2 = options;
      if (data2.events) {
        if (!data2.events.ipc)
          data2.events.ipc = static_ipcEvents;
        else {
          for (const group in static_ipcEvents) {
            if (!data2.events.ipc[group])
              data2.events.ipc[group] = static_ipcEvents[group];
            else {
              for (const event in static_ipcEvents[group])
                if (!data2.events.ipc[group][event])
                  data2.events.ipc[group][event] = static_ipcEvents[group][event];
            }
          }
        }
        global.win = data2.events.ipc.window;
      }
      global.mainDirectory = ((_b = options.meta) == null ? void 0 : _b.mainDirectory) || process.cwd();
    }
    {
      import_electron2.app.on("window-all-closed", Helpers2.onWindowAllClosed);
      import_electron2.app.on("ready", Helpers2.onReady);
    }
  } catch (error) {
    console.error(`Failed to start electron : ${error}`);
    throw error;
  }
});
var Helpers2 = {
  /**
   * Executes the onWindowAllClosed function asynchronously.
   *
   * This function is called when all windows are closed. It performs the following steps:
   * 1. If there is a close callback defined in the data.events.app object, it awaits its execution.
   * 2. If the current platform is not 'darwin' (i.e., not macOS), it quits the application.
   *
   * @return {Promise<void>} A promise that resolves when the function completes.
  */
  onWindowAllClosed: () => __async(void 0, null, function* () {
    if (data2.events && data2.events.app && data2.events.app.onClose)
      yield data2.events.app.onClose();
    if (process.platform !== "darwin") {
      import_electron2.app.quit();
    }
  }),
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
  onReady: () => __async(void 0, null, function* () {
    var _a;
    import_electron2.ipcMain.handle("events", (event, options) => __async(void 0, null, function* () {
      try {
        if (!data2.events || !data2.events.ipc)
          throw new Error(`data.events.ipc not found`);
        if (!data2.events.ipc[options.group])
          throw new Error(`data.events.ipc.group not found: ${options.group}`);
        if (!data2.events.ipc[options.group][options.event])
          throw new Error(`data.events.ipc.group.event not found: ${options.group}.${options.event}`);
        const res = yield data2.events.ipc[options.group][options.event](options.args);
        return res;
      } catch (err) {
        console.error(`Error handling IPC event: ${err.message}`);
        throw err;
      }
    }));
    if (data2.events && data2.events.app && data2.events.app.onReady)
      yield data2.events.app.onReady();
    if (import_electron2.BrowserWindow.getAllWindows().length === 0)
      yield WinMan.setup(((_a = data2.meta) == null ? void 0 : _a.defaultWindow) || "splash");
  })
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  electron
});
//# sourceMappingURL=main.js.map