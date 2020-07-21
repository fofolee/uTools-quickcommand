const fs = require('fs');
const path = require('path');

exports.fofo = {
    pluginInfo: function () {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')))
    },

    isDev: function () {
        return /[a-zA-Z0-9\-]+\.asar/.test(__dirname) ? false : true
    },

    getDB: id => {
        var db = utools.db.get(id),
            dbData = db ? db.data : {};
        return dbData;
    },

    putDB: (key, value, id) => {
        var db = utools.db.get(id);
        if (db) {
            var rev = db._rev
            var data = db.data
            data[key] = value;
            utools.db.put({ _id: id, data: data, _rev: rev });
        } else {
            var data = {};
            data[key] = value;
            utools.db.put({ _id: id, data: data });
        }
    },

    showChangeLog: function () {
        this.putDB('version', this.pluginInfo().version, 'plugin')
        fs.readFile(path.join(__dirname, 'CHANGELOG.md'), { encoding: 'utf8' }, (err, data) => {
            if (data) utools.ubrowser.goto(data, '更新日志').run({
                width: 1280,
                height: 920
            })
        })
    },

    isRunningAtFirstTime: function () {
        var historyVersion = this.getDB('plugin').version
        if (!historyVersion) return 'init'
        if (this.pluginInfo().version > historyVersion) return 'update'
        return false
    },

    GetFilePath: function (Path, File) {
        if (this.isDev()) {
            return path.join(__dirname, Path, File)
        } else {
            return path.join(__dirname.replace(/([a-zA-Z0-9\-]+\.asar)/,'$1.unpacked'), Path, File)
        }
    }
}
