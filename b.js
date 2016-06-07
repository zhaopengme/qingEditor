/*
 * @Author: mikey.zhaopeng
 * @Date:   2016-06-07 17:17:59
 * @Last Modified by:   mikey.zhaopeng
 * @Last Modified time: 2016-06-07 17:22:15
 */

'use strict';

var rd = require('rd');

// 异步列出目录下的所有文件
rd.eachDir('./', function(filename, stats,next) {
    console.info('111')
    console.log(filename);
    console.log(stats);
    next()
}, function(err, list) {
    console.info('13331')

    console.log(err);
    console.log(list);
});
