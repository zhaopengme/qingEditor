var fs = require('fs'),
    util = require('util');
var path = require('path');
var ignores = ['dist', 'node_modules', 'dist', '.git', '.idea', '.gitignore'];
var defaultData = {};

function walk(rootPath) {

    var dirs = [];
    var files = [];
    var node = {};
    if (fs.statSync(rootPath).isDirectory()) {
        rootPath = path.resolve(rootPath);
        var dirNameArr = rootPath.split(path.sep);
        node.text = dirNameArr[dirNameArr.length - 1];
        node.href = rootPath;
        if(node.text){

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
            var dirNode = walk(filePath);
            dir.node = dirNode;
        }
    });


    node.nodes = dirs;
    node.files = files;

    //
    // dirList.forEach(function (item) {
    //     if (fs.statSync(path + '/' + item).isFile()) {
    //         fileList.push(path + '/' + item);
    //     }
    // });
    //
    // dirList.forEach(function (item) {
    //     if (fs.statSync(path + '/' + item).isDirectory()) {
    //         walk(path + '/' + item);
    //     }
    // });
    return node;
}

var json = walk('./');
console.log(json);