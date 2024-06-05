var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
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

// src/code/modules/win-man.ts
import { BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
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
      const window = new BrowserWindow(win.config.electronOptions);
      win._window = window;
      win._window.loadFile(path.join(__dirname, "../src/code/static/index.html"));
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
    const windowsRoot = path.join(global.mainDirectory, "/interface/windows/");
    let windows = fs.readdirSync(windowsRoot);
    for (let i = 0; i < windows.length; i++) {
      const windowRoot = path.join(windowsRoot, windows[i]);
      const config = JSON.parse(fs.readFileSync(path.join(windowRoot, "/config.json"), "utf8"));
      const events = __require(path.join(windowRoot, "/events.js"));
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
          electronOptions.webPreferences.preload = path.join(__dirname, "../src/code/modules/preload.js");
        if (defined(windows[i].config.options.webPreferences.nodeIntegration))
          electronOptions.webPreferences.nodeIntegration = windows[i].config.options.webPreferences.nodeIntegration;
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
import { logger } from "@je-es/log";
import { app as app2, BrowserWindow as BrowserWindow2, ipcMain } from "electron";
var data2;
var static_ipcEvents = {
  "window": {
    "get": (args) => WinMan.get(),
    "create": (winName) => WinMan.create(winName),
    "close": (winName) => WinMan.close(winName)
  },
  "component": {
    "__load": (cmpName) => WinMan.create(cmpName)
    // 'build'         : (cmpName : string) => CmpMan.build(cmpName),
    // 'valueOf'       : (cmpName : string) => CmpMan.valueOf(cmpName),
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
        global.log = new logger({ root, save: true });
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
      app2.on("window-all-closed", Helpers2.onWindowAllClosed);
      app2.on("ready", Helpers2.onReady);
    }
  } catch (error) {
    console.error(`Failed to start electron : ${error}`);
    throw error;
  }
});
var Helpers2 = {
  onWindowAllClosed: () => __async(void 0, null, function* () {
    if (data2.events && data2.events.app && data2.events.app.onClose)
      yield data2.events.app.onClose();
    if (process.platform !== "darwin") {
      app2.quit();
    }
  }),
  onReady: () => __async(void 0, null, function* () {
    var _a;
    ipcMain.handle("events", (event, options) => __async(void 0, null, function* () {
      if (!data2.events || !data2.events.ipc)
        throw new Error(`data.events.ipc not found`);
      if (!data2.events.ipc[options.group])
        throw new Error(`data.events.ipc.group not found : ${options.group}`);
      if (!data2.events.ipc[options.group][options.event])
        throw new Error(`data.events.ipc.group.event not found : ${options.group}.${options.event}`);
      const res = yield data2.events.ipc[options.group][options.event](options.args);
      return res;
    }));
    if (data2.events && data2.events.app && data2.events.app.onReady)
      yield data2.events.app.onReady();
    if (BrowserWindow2.getAllWindows().length === 0)
      yield WinMan.setup(((_a = data2.meta) == null ? void 0 : _a.defaultWindow) || "splash");
  })
};
export {
  electron
};
//# sourceMappingURL=main.mjs.map