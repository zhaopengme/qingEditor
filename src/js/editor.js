$ = window.$;
var util = require('./util')
var Config = require('./config')
var fsutils = require('fs-utils');
var moment = require('moment');
var _ = require('underscore');
var electron = require('electron');
var ipc = electron.ipcRenderer;

var dialog = electron.remote.dialog;
var remote = electron.remote;

module.exports = function () {
    var mdEditor = null;
    var fileEntry = null;
    var hasWriteAccess = false;
    var config = new Config();
    var self = this;

    this.init = function () {
        this._initEditor();
    };

    /**
     * 初始化编辑器 for _initEditor
     * @private
     * @method _initEditor
     * @return {Object} description
     */
    this._initEditor = function () {
        mdEditor = window.editormd("editormd", {
            width: "100%",
            height: "600",
            syncScrolling: "single",
            path: "./verdor/editor/lib/",
            watch: false,
            onload: self._configOnload(),
            toolbarIcons: self._configToolbarIcons(),
            toolbarCustomIcons: self._configToolbarCustomIcons(),
            toolbarHandlers: {
                open: function (cm, icon, cursor, selection) {
                    self.triggerClick('#openFile');
                },
                new: function (cm, icon, cursor, selection) {
                    remote.getCurrentWindow().reload();
                },
                save: function (cm, icon, cursor, selection) {
                    if (self.fileEntry && self.hasWriteAccess) {
                        self.writeEditor2File(self.fileEntry);
                    } else {
                        self.triggerClick('#saveFile');
                    }
                },
                config: function (cm, icon, cursor, selection) {
                    config.openConfigDialog();
                },
                about: function (cm, icon, cursor, selection) {
                    self.openAboutDialog();
                }
            }
        });
    };
    /**
     * 添加自定义按钮 for _configToolbarIcons
     * @private
     * @method _configToolbarIcons
     * @return {Object} description
     */
    this._configToolbarIcons = function () {
        var toolbars = ["open", "new", "save", "|", "undo", "redo", "|", "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", "h1", "h2", "h3", "h4", "h5", "h6", "|", "list-ul", "list-ol", "hr", "|", "link", "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime", "emoji", "html-entities", "pagebreak", "|", "goto-line", "watch", "preview", "clear", "search", "|", "help", "about", "|", "config"];
        return toolbars;
    };
    /**
     * 添加自定义图标 for _configToolbarCustomIcons
     * @private
     * @method _configToolbarCustomIcons
     * @return {Object} description
     */
    this._configToolbarCustomIcons = function () {
        var icons = {
            open: '<a href="javascript:;" title="打开（Ctrl+O）"><i class="fa fa-file-o" name="open"></i></a>',
            new: '<a href="javascript:;" title="新建（Ctrl+N）"><i class="fa fa-file" name="new"></i></a>',
            save: '<a href="javascript:;" title="保存（Ctrl+S）"><i class="fa fa-floppy-o" name="save"></i></a>',
            config: '<a href="javascript:;" title="配置（Ctrl+P）"><i class="fa fa-cogs" name="config"></i></a>',
            about: '<a href="javascript:;" title="关于"><i class="fa fa-info-circle" name="about"></i></a>'
        };
        return icons;
    };


    this._configOnload = function () {

        this._configUploadImage();
    }
    this._configKeymap = function () {
        var keyMap = {
            "Ctrl-S": function (cm) {
                $('i[name="save"]').trigger('click');
            },
            "Ctrl-O": function (cm) {
                $('i[name="open"]').trigger('click');
            },
            "Ctrl-N": function (cm) {
                $('i[name="new"]').trigger('click');
            }
        };
        mdEditor.addKeyMap(keyMap);
    }

    /**
     * 图片上传需要重写默认的上传组件 for _configUploadImage
     * @private
     * @method _configUploadImage
     * @return {Object} description
     */
    this._configUploadImage = function () {

        setTimeout(function () {
            mdEditor.fullscreen();
            mdEditor.toolbarHandlers.image = function () {
                var t = '<div style="padding:15px;"><form class="editormd-form"><label>图片地址</label><input type="text" data-url=""><div class="editormd-file-input"><input type="file" name="editormd-image-file" accept="image/*"><input type="submit" id="upload-btn" value="本地上传"></div><br><label>图片描述</label><input type="text" value="" data-alt=""><br><label>图片链接</label><input type="text" value="http://" data-link=""></form></div>';
                var prams = {
                    width: '550',
                    height: '300',
                    title: '图片上传',
                    content: t,
                    btns: ['插入图片'],
                    ok: $.proxy(self._dialogOkCallback, self)
                }
                util.dialog(prams);
            }
            self._configKeymap();
            self.events();
        }, 600);
    };
    this.openAboutDialog = function () {
        var t = '<div class="editormd-dialog-container"> <h1>ndpeditor<small>v1.0.0</small></h1> <p> ndpeditor 支持七牛 <br>Open source online Markdown editor.</p> <p style="margin: 10px 0 20px 0;"><a href="https://github.com/zhaopengme/ndpediter" target="_blank">https://github.com/zhaopengme/ndpediter <i class="fa fa-external-link"></i></a></p> <p style="font-size: 0.85em;">Copyright © 2015 <a href="http://zhaopeng.me" target="_blank" class="hover-link">zhaopeng.me</a></p> </div>';
        var prams = {
            width: '500',
            height: '300',
            title: '关于',
            content: t,
        }
        util.dialog(prams);
    }
    this.insertImageMd = function (url, alt, link) {
        var altAttr = (alt !== "") ? " \"" + alt + "\"" : "";
        if (link === "" || link === "http://") {
            mdEditor.replaceSelection("![" + alt + "](" + url + altAttr + ")");
        } else {
            mdEditor.replaceSelection("[![" + alt + "](" + url + altAttr + ")](" + link + altAttr + ")");
        }
        if (alt === "") {
            mdEditor.setCursor(mdEditor.getCursor().line, mdEditor.getCursor().ch + 2);
        }
    }


    /**
     * 事件处理 for _events
     * @private
     * @method _events
     * @return {Object} description
     */
    this.events = function () {
        var imageFile = 'input[name="editormd-image-file"]';
        $('body').off('change', imageFile).on('change', imageFile, $.proxy(this.uploadImage, this));
        $('#openFile').off('click').on('click', $.proxy(this.openFile, this));
        $('#saveFile').off('click').on('click', $.proxy(this.saveFile, this));
        $(window).on('resize', $.proxy(this.resizeEditor, this));
        $(document).on('paste', $.proxy(this.paste, this));
        ipc.on('fileSelected', function (e, fileEntry) {
            if (fileEntry) {
                self.configFile(fileEntry, true);
                self.readFileEditor(fileEntry);
            }
        })


        $(document).on({
            dragleave: function (e) { //拖离
                e.preventDefault();
                console.log('dragleave');
            },
            drop: function (e) { //拖后放
                e.preventDefault();
                console.log('drop');
                var file = e.originalEvent.dataTransfer.files[0].path;
                var fileName = util.getFileName(file);
                var fileSuffix = util.getFileSuffix(file);
                var key = moment().format('YYYY/MM/DD/') + util.guid() + fileSuffix;
                var params = {
                    key: key,
                    filePath: file,
                }
                var option = config.readConfig();
                util.uploadFile(option, params, function (url) {
                    self.insertImageMd(url, fileName, '');
                });


            },
            dragenter: function (e) { //拖进
                e.preventDefault();
                console.log('dragenter');

            },
            dragover: function (e) { //拖来拖去
                e.preventDefault();
                console.log('dragover');

            }
        });

    };


    this.resizeEditor = function () {
        mdEditor.fullscreen();
        mdEditor.fullscreen();
    }


    this.paste = function (e) {

        console.log(e)
        var clipboard = e.originalEvent.clipboardData;
        if (!clipboard.items || !clipboard.items.length) {
            clear();
            return;
        }
        var temp;
        if ((temp = clipboard.items[clipboard.items.length - 1]) && temp.kind === 'file' && temp.type.indexOf('image') === 0) {
            var imgFile = temp.getAsFile();
            var key = moment().format('YYYY/MM/DD/') + util.guid() + '.png';
            var options = config.readConfig();
            var token = util.getQiniuToken(options);
            self.qiniuUpload(imgFile, token, key, function (result) {
                console.log(result);
                var url = options.QINIU_URL + result.key;
                self.insertImageMd(url, '', '');
            });


        } else if (temp = clipboard.getData('text/plain')) {

        }
    }

    //上传图片,参数为:图片2进制内容,七牛token,文件名,回调函数
    this.qiniuUpload = function (f, token, key, fn) {
        var xhr = new XMLHttpRequest();
        //创建表单
        xhr.open('POST', 'http://up.qiniu.com', true);
        var formData, startDate;
        formData = new FormData();
        if (key !== null && key !== undefined) formData.append('key', key);
        formData.append('token', token);
        formData.append('file', f);
        var taking;

        xhr.onreadystatechange = function (response) {
            //上传成功则执行回调
            if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText) {
                var blkRet = JSON.parse(xhr.responseText);
                fn(blkRet);
            } else if (xhr.status != 200 && xhr.responseText) {
                if (xhr.status == 631) {
                    util.msg('七牛空间不存在!');
                } else {
                    util.msg('七牛设置错误!');
                }
            }
        };
        startDate = new Date().getTime();
        //提交数据
        xhr.send(formData);
    }

    /**
     * 上传图片 for uploadImage
     * @private
     * @method uploadImage
     * @return {Object} description
     */
    this.uploadImage = function (e) {
        console.log(e);

        var file = e.target.files[0].path;
        var fileName = util.getFileName(file);
        var fileSuffix = util.getFileSuffix(file);
        var key = moment().format('YYYY/MM/DD/') + util.guid() + fileSuffix;
        var params = {
            key: key,
            filePath: file,
        }
        var option = config.readConfig();
        util.uploadFile(option, params, function (url) {
            if (_.isObject(url)) {
                $('input[data-url]').val(url.error);
            } else {
                $('input[data-url]').val(url);
                $('input[data-alt]').val(fileName);
            }
        });
    };


    /**
     * 读取文件到编辑器 for readFileEditor
     * @private
     * @method readFileEditor
     * @param {Object} theFileEntry
     * @return {Object} description
     */
    this.readFileEditor = function (theFileEntry) {
        var content = fsutils.readFileSync(theFileEntry);
        mdEditor.setMarkdown(content);
    };

    /**
     * 保存文件 for writeEditor2File
     * @private
     * @method writeEditor2File
     * @param {Object} theFileEntry
     * @return {Object} description
     */
    this.writeEditor2File = function (theFileEntry) {
        var content = mdEditor.getMarkdown();
        fsutils.writeFileSync(theFileEntry, content);
        util.msg('保存成功!');
    };

    /**
     * 设置文件属性 for setFile
     * @private
     * @method setFile
     * @param {Object} theFileEntry
     * @param {Object} isWritable
     * @return {Object} description
     */
    this.configFile = function (theFileEntry, isWritable) {
        this.fileEntry = theFileEntry;
        this.hasWriteAccess = isWritable;
    }

    this.openFile = function (e) {
        var self = this;
        dialog.showOpenDialog({properties: ['openFile']}, function (filename) {
            var fileEntry = filename.toString();
            self.configFile(fileEntry, true);
            self.readFileEditor(fileEntry);
        });
    }
    this.saveFile = function (e) {
        var self = this;
        var option = {
            defaultPath: 'default.md'
        }
        dialog.showSaveDialog(option, function (filename) {
            var fileEntry = filename.toString();
            self.configFile(fileEntry, true);
            self.writeEditor2File(fileEntry);
        });
    };

    /**
     * dom 触发一个click事件 for triggerClick
     * @private
     * @method triggerClick
     * @param {Object} dom
     * @return {Object} description
     */
    this.triggerClick = function (dom) {
        $(dom).trigger('click');
    };
    /**
     * 对话框确定回调 for _dialogOkCallback
     * @private
     * @method _dialogOkCallback
     * @return {Object} description
     */
    this._dialogOkCallback = function () {
        var self = this;
        var url = $('input[data-url]').val();
        var alt = $('input[data-alt]').val();
        var link = $('input[data-link]').val();
        self.insertImageMd(url, alt, link);
    };
};
