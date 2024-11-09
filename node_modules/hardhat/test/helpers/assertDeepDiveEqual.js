/**
 * Assert that two directories contain the same files and folders
 * (by file/directory name only, not contents).
 */

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    dive = require('dive');

module.exports = function assertDeepDiveEqual(dirIn, dirOut, ext, done) {
  // Default ext to 'tpl'.
  if (typeof ext === 'function') {
    done = ext;
    ext = 'tpl';
  }

  assert.ok(fs.existsSync(dirIn), 'dirIn does not exist');
  assert.ok(fs.existsSync(dirOut), 'dirOut does not exist');

  dive(dirIn, {all: true, directories: true}, function(err, file) {
    var relative = file.replace(dirIn, '');
    var copied = path.join(dirOut, relative).replace('.' + ext + '.', '.');
    assert.ok(fs.existsSync(copied), 'output file `<dirOut>' + copied.replace(dirOut, '') + '` was not copied');
  }, function() {
    done();
  });
};
