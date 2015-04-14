'use strict';

var fs = require('fs');
var rimraf = require('rimraf');
var acorn = require('acorn');
var walk = require('acorn/dist/walk');

var ids = [];
var names = {};

function getIdFor(name) {
  if (name in names) return names[name];
  var id;
  do {
    id = '_' + Math.floor(Math.random() * 100);
  } while (ids.indexOf(id) !== -1)
  ids.push(id);
  names[name] = id;
  return id;
}

function fixup(src) {
  var ast = acorn.parse(src);
  src = src.split('');
  walk.simple(ast, {
    MemberExpression: function (node) {
      if (node.computed) return;
      if (node.property.type !== 'Identifier') return;
      if (node.property.name[0] !== '_') return;
      replace(node.property, getIdFor(node.property.name));
    }
  });
  function source(node) {
    return src.slice(node.start, node.end).join('');
  }
  function replace(node, str) {
    for (var i = node.start; i < node.end; i++) {
      src[i] = '';
    }
    src[node.start] = str;
  }
  return src.join('');
}
rimraf.sync(__dirname + '/lib/');
fs.mkdirSync(__dirname + '/lib/');
fs.readdirSync(__dirname + '/src').forEach(function (filename) {
  var src = fs.readFileSync(__dirname + '/src/' + filename, 'utf8');
  var out = fixup(src);
  fs.writeFileSync(__dirname + '/lib/' + filename, out);
});

rimraf.sync(__dirname + '/domains/');
fs.mkdirSync(__dirname + '/domains/');
fs.readdirSync(__dirname + '/src').forEach(function (filename) {
  var src = fs.readFileSync(__dirname + '/src/' + filename, 'utf8');
  var out = fixup(src);
  out = out.replace(/require\(\'asap\/raw\'\)/g, "require('asap')");
  fs.writeFileSync(__dirname + '/domains/' + filename, out);
});

rimraf.sync(__dirname + '/setimmediate/');
fs.mkdirSync(__dirname + '/setimmediate/');
fs.readdirSync(__dirname + '/src').forEach(function (filename) {
  var src = fs.readFileSync(__dirname + '/src/' + filename, 'utf8');
  var out = fixup(src);
  out = out.replace(/var asap \= require\(\'([a-z\/]+)\'\);/g, '');
  out = out.replace(/asap/g, 'setImmediate');
  fs.writeFileSync(__dirname + '/setimmediate/' + filename, out);
});

var output = {};
fs.readdirSync(__dirname + '/src').forEach(function (filename) {
  var out = fs.readFileSync(__dirname + '/src/' + filename, 'utf8');
  out = out.replace(/var asap \= require\(\'([a-z\/]+)\'\);/g, '');
  out = out.replace(/asap/g, 'setImmediate');

  out = out.replace(/var (.*?) \= require\(\'(.*?)\'\);/g, '');
  out = out.replace(/module\.exports = Promise;/g, '');
  out = out.replace(/'use strict';/g, '');

  output[filename] = out;
});

var config = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8'));

var code = [
  '// then/promise version: ' + config.version + '\n',
  "'use strict';\n\n",
  "var setImmediate = require('setImmediate');\n",
  [
    'core.js',
    'done.js',
    'finally.js',
    'es6-extensions.js'
  ].reduce(function(src, file) {
    return src + output[file];
  }, ''),
  'module.exports = Promise;\n'
].join('');

rimraf.sync(__dirname + '/single-browser/');
fs.mkdirSync(__dirname + '/single-browser/');
fs.writeFileSync(
  __dirname + '/single-browser/promise.js',
  code.replace(/\n\n+/g, '\n\n')
);
