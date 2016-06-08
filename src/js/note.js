/*
 * @Author: mikey.zhaopeng
 * @Date:   2016-06-07 14:57:16
 * @Last Modified by:   mikey.zhaopeng
 * @Last Modified time: 2016-06-07 14:57:18
 */

'use strict';

var fileUtil = require('./js/fileUtil')
var electron = require('electron');
var ipc = electron.ipcRenderer;
var Note = function () {
    var self = this;

    this.init = function () {
        self.render();
        self.events();
    }


    this.render = function () {
        self.renderLeftTree();
    }

    this.events = function () {
        $('#left-tree').off('nodeSelected').on('nodeSelected', $.proxy(self.nodeSelected, self));
        $('#center-warp').off('click', 'a.list-group-item').on('click', 'a.list-group-item', $.proxy(self.fileSelected, self));
    }

    this.renderLeftTree = function () {
        var tree = fileUtil.walk('./');
        $('#left-tree').treeview({
            data: [tree],
            showBorder: false
        });
    }

    this.renderCenterList = function (files) {
        $('#center-warp ul.list-group').empty();
        $.each(files, function (i, file) {
            var t = '<a class="list-group-item" data-filepath="' + file.filePath + '"> <div class="bmd-list-group-col"> <p class="list-group-item-heading">' + file.fileName + '</p> <p class="list-group-item-text">' + file.filePath + '</p> </div> </a>';
            $('#center-warp ul.list-group').append(t);
        });
    }

    this.nodeSelected = function (e, node) {
        self.renderCenterList(node.files || []);

    }

    this.fileSelected = function (e) {
        var filepath = $(e.currentTarget).data('filepath');
        window.mainView.send('fileSelected', filepath);


    }
}

var note = new Note();
note.init();


