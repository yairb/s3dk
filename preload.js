const ADB = require('appium-adb').ADB;

const {
    contextBridge,
    ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        refresh: (callback) => {
            takeScreenshot(function() {
              elementsTree(function() {
                fs = require('fs');

                fs.readFile( 'window_dump.xml', function(err, data) {
                    var parseString = require('xml2js').parseString;
                    parseString(data, function (err, result) {
                        // console.dir(result)
                        callback(result)
                    });
                 });
              })
            });
        },
        receive: (channel, func) => {
            let validChannels = ["fromMain"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);

window.addEventListener('DOMContentLoaded', () => {
  // getConnectedDevices()
  // takeScreenshot()
  // elementsTree()
})

async function getConnectedDevices() {
  const adb = await ADB.createADB();
  var devices = await adb.getConnectedDevices();
  for (var i = 0; i < devices.length; i++) {
    var device = devices[i];
  }
  console.log("devices: " + devices.length)
}

async function takeScreenshot(callback) {
  const adb = await ADB.createADB();
  await adb.shell(['screencap', '-p', '>', '/sdcard/screen.png'])
  await adb.pull('/sdcard/screen.png', 'screen.png')
  callback()
}

async function elementsTree(callback) {
  const adb = await ADB.createADB();
  await adb.shell(['uiautomator', 'dump'])
  await adb.pull('/sdcard/window_dump.xml', 'window_dump.xml')
  callback()
}
