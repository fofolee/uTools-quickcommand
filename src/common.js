const fs = require('fs');
const path = require('path');

exports.fofo = {
    pluginInfo: function () {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')))
    },
    
    isDev: function () {
        return /[a-zA-Z0-9\-]+\.asar/.test(__dirname) ? false : true
    },

    pushData: function (databases, data) {
        var db = utools.db.get(databases);
        if (db) {
            utools.db.put({ _id: databases, data: data, _rev: db._rev });
        } else {
            utools.db.put({ _id: databases, data: data });
        }
    },
    
    showChangeLog: function () {
        this.pushData('plugin', { version: this.pluginInfo().version })
        fs.readFile(path.join(__dirname, 'CHANGELOG.md'), { encoding: 'utf8' }, (err, data) => {
            if (data) utools.ubrowser.goto(data, '更新日志').run({
                width: 1080,
                height: 860
            })
        })
    },
    
    isRunningAtFirstTime: function () {
        try {
            var historyVersion = utools.db.get('plugin').data.version
            if (historyVersion != this.pluginInfo().version) {
                return true
            } else {
                return false
            }
        } catch (error) {
            return true
        }
    },
    
    GetFilePath: function (Path, File) {
        if (this.isDev()) {
            return path.join(__dirname, Path, File)
        } else {
            return path.join(__dirname.replace(/([a-zA-Z0-9\-]+\.asar)/,'$1.unpacked'), Path, File)  
        }
    }
}