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
