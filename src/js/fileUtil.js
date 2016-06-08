var fs = require('fs'),
    util = require('util');
var path = require('path');
var ignores = ['dist', 'node_modules', 'dist', '.git', '.idea', '.gitignore'];


exports.walk = function (rootPath) {
    var self = this;
    var dirs = [];
    var files = [];
    var node = {};
    if (fs.statSync(rootPath).isDirectory()) {
        rootPath = path.resolve(rootPath);
        var dirNameArr = rootPath.split(path.sep);
        node.text = dirNameArr[dirNameArr.length - 1];
        node.href = rootPath;
        if (node.text == 'dist' || node.text == 'node_modules' || node.text == '.git' || node.text == '.idea' || node.text == '.gitignore') {
            return null;
        }
    } else {
        throw new Error(rootPath + ' is a file!!!!');
    }

    var tempDirs = fs.readdirSync(rootPath);

    tempDirs.forEach(function (item) {
        var filePath = rootPath + path.sep + item;
        if (fs.statSync(filePath).isFile()) {
            var file = {
                fileName: item,
                filePath: filePath
            }
            files.push(file);
        }
    });

    tempDirs.forEach(function (item) {
        var filePath = rootPath + path.sep + item;
        if (fs.statSync(filePath).isDirectory()) {
            var dir = {
                dirName: item,
                dirPath: filePath,
                text: item,
                href: filePath
            }
            dirs.push(dir);
            var dirNode = self.walk(filePath);
            if (dirNode) {
                dir.nodes = dirNode.nodes;
                dir.files = dirNode.files;

            }
        }
    });


    node.nodes = dirs;
    node.tags = [files.length];
    node.files = files;
    return node;
}
