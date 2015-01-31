var fs    = require('fs'),
    path  = require('path'),
    async = require('async');

exports = module.exports = cp;

function cp(source, destination, cb) {
  cb = cb || function() {};

  options = {
    first:        true,
    source:       path.normalize(source),
    destination:  path.normalize(destination)
  };

  // Init the recursion
  _cp(options, cb);
}

function _cp(options, cb) {
  async.waterfall([

    // Checks sanity of inputs
    function(callback) {
      initialChecks(options, callback);
    },

    // Read the source and acts accordingly to its type
    function(checks, callback) {
      fs.lstat(options.source, function(err, stats) {
        /* istanbul ignore else  */
        if (stats.isFile()) {
          copyFile(options, callback);
        } else if (stats.isDirectory()) {
          copyDir(options, callback);
        } else if (stats.isSymbolicLink()) {
          copySymlink(options, callback);
        } else {
          callback(new Error('Unsupported file type !'));
        }
      });
    }

  ], cb);
}

function initialChecks(options, cb) {
  async.parallel([

    // Check if source exists
    function(callback) {
      fs.exists(options.source, function(exists) {
        if(!exists) { callback(new Error('Source file do not exists!')); }
        else { callback(null, true); }
      });
    },

    // Check if destination folder exists, if not creates it
    function(callback) {
      fs.exists(options.destination, function(exists) {
        if (!exists) {
          fs.mkdir(options.destination, function(err) {
            callback(err, true);
          });
        } else {
          fs.stat(options.destination, function(err, stats) {
            if (stats.isFile()) {
              callback(new Error('Destination is an existing file!'));
            } else {
              callback(null, true);
            }
          });
        }
      });
    }

  ], cb);
}

function copySymlink(options, cb) {
  var symlink = options.source;
  var _toFile = path.join(options.destination, path.basename(symlink));

  async.waterfall([

    // Read the original link to get the absolute/relative target
    function(callback) {
      fs.readlink(symlink, callback);
    },

    // Check if the copied symlink already exists in destination folder
    function(linkString, callback) {
      fs.exists(_toFile, function (exists) {
        callback(null, exists, linkString);
      });
    },

    // If link does not already exists, creates it
    function(exists, linkString, callback) {
      if (exists) {
        return callback(null, symlink);
      }
      fs.symlink(linkString, _toFile, function(err) {
        callback(err, symlink);
      });
    }

  ], cb);
}

function copyFile(options, cb) {
  var file    = options.source;
  var _toFile = path.join(options.destination, path.basename(file));

  async.waterfall([

    // Read file stats
    function(callback) {
      fs.stat(file, callback);
    },

    // Read the file
    function(stats, callback) {
      fs.readFile(file, function(err, data) {
        callback(err, data, stats);
      });
    },

    // Write the new file in destination folder
    function(data, stats, callback) {
      fs.writeFile(_toFile, data, stats, function(err) {
        callback(err, _toFile);
      });
    }

  ], cb);
}

function copyDir(options, cb) {
  var directory = options.source;

  // If not first iteration, auto-correct destination
  if (!options.first) {
    var _previous = path.relative(path.resolve(directory, '..'), directory);
    options.destination = path.join(options.destination, _previous);
  }

  async.waterfall([

    // Read the directory
    function(callback) {
      fs.readdir(directory, callback);
    },

    // Recursively call cp() on each files
    function(files, callback) {
      var recursiveCp = files.map(function(file) {
        return function(callback) {
          _cp({ source: path.join(directory, file), destination: options.destination }, callback);
        };
      });
      async.series(recursiveCp, callback);
    }

  ], cb);
}
