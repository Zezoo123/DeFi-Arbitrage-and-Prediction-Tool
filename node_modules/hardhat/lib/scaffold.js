/**
 * scaffold.js
 *
 * Copy files and directorys from `in` to `out`, applying templating and data.
 */

var path = require('path'),
    dive = require('dive'),
    cons = require('consolidate'),
    mkdirp = require('mkdirp'),
    fs = require('fs-extra'),
    async = require('async');

// `options` can be omitted to fallback to the defaults.
// If you are using templates, set the template data on `options.data`.
module.exports = function(dirIn, dirOut, options, callback) {
  var files = [];

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // Which consolidate-supported templating engine to use.
  options.engine = options.engine || 'handlebars';

  // Which extension hardhat should apply templating to.
  // HardHat will run '*.[ext].*'' files through the templating engine and
  // remove '.[ext]' from the resulting file.
  //
  // For example: 'index.tpl.html' will run through the engine and be copied to
  // the destination as 'index.html'.
  options.ext = options.ext || 'tpl';

  // The data option is passed to consolidate for templating.
  options.data = options.data || {};

  // All templatable files are assumed to be utf8 by default.
  options.encoding = 'utf8';

  // Ensure dirIn exists.
  if (!fs.existsSync(dirIn)) {
    return callback(new Error('The input directory does not exist (' + dirIn + ').'));
  }
  // If dirOut does not exist, try to create it.
  if (!fs.existsSync(dirOut)) {
    if (!mkdirp.sync(dirOut)) {
      return callback(new Error('Could not create the output directory (' + dirOut + ').'));
    }
  }

  // Ensure the caller has chosen a real templating engine.
  if (!cons[options.engine]) {
    return callback(new Error('The templating engine `' + options.engine + '` does not exist.'));
  }

  // Recurse through dirIn. Create any directories found and build an array of
  // file paths to copy over.
  dive(dirIn, {all: true, directories: true}, function(err, path) {
    var stats = fs.statSync(path);
    if (stats.isDirectory()) {
      mkdirp.sync(path.replace(dirIn, dirOut));
    }
    else {
      files.push(path);
    }
  }, function() {
    // Now copy over all the files, applying templating where necessary.
    var tasks = [];
    for (var i in files) {
      (function(file) {
        var dest = file.replace(dirIn, dirOut);
        tasks.push(function(done) {
          var pos;
          // If the file does not contain `.[ext].`, just copy it.
          if (file.indexOf('.' + options.ext + '.') < 0) {
            fs.copy(file, dest, done);
          }
          // Otherwise, we need to run this file through the templating engine.
          else {
            dest = dest.replace('.' + options.ext, '');
            cons[options.engine](file, options.data, function(err, templated) {
              if (err) return done(err);
              fs.writeFile(dest, templated, options.encoding, done);
            });
          }
        });
      })(files[i]);
    }
    async.parallel(tasks, callback);
  });
};
