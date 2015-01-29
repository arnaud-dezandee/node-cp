var rimraf = require('rimraf'),
    assert = require('assert'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    cp = require('../cp');

var FIXTURES_DIR  = path.resolve(__dirname, 'fixtures');
var TMP_DIR       = path.resolve(__dirname, 'tmp');

////////////////////

function assertExists(file) {
  return function(callback) {
    fs.exists(file, function (exists) {
      callback(assert.equal(exists, true, 'Missing file ! ' + file));
    });
  }
}

function assertSymlink(symlink, target) {
  return function(callback) {
    async.series([
      function (cb) {
        fs.lstat(symlink, function (err, stats) {
          cb(assert.equal(stats.isSymbolicLink(), true, 'File is not a symbolic link ! ' + symlink));
        });
      },
      function (cb) {
        fs.readlink(symlink, function (err, linkString) {
          // Get the path to real file
          var realPath = path.join(path.dirname(symlink), linkString);
          cb(assert.equal(realPath, target, 'Symlink target does not match !'));
        });
      }
    ], callback);
  }
}

////////////////////

describe('Node.js cp -r', function() {

  describe('Direct file', function() {
    before(function (cb) {
      cp(FIXTURES_DIR + '/direct_file', TMP_DIR, cb);
    });

    it('should copy the file', function(cb) {
      assertExists(TMP_DIR + '/direct_file')(cb);
    });

    after(function (cb) {
      rimraf(TMP_DIR, cb);
    });
  });

  describe('Folder with files', function() {
    before(function (cb) {
      cp(FIXTURES_DIR + '/folder_with_files', TMP_DIR, cb);
    });

    it('should copy all first level files', function(cb) {
      async.parallel([
        assertExists(TMP_DIR + '/1'),
        assertExists(TMP_DIR + '/2')
      ], cb);
    });
    it('should copy all second level files', function(cb) {
      async.parallel([
        assertExists(TMP_DIR + '/sub/11'),
        assertExists(TMP_DIR + '/sub/12')
      ], cb);
    });

    after(function (cb) {
      rimraf(TMP_DIR, cb);
    });
  });

  describe('File and directory symlink', function() {
    before(function (cb) {
      cp(FIXTURES_DIR + '/folder_with_symlink', TMP_DIR, cb);
    });

    it('should copy file and its symlink', function(cb) {
      async.parallel([
        assertExists(TMP_DIR + '/1'),
        assertExists(TMP_DIR + '/symlink_1'),
        assertSymlink(TMP_DIR + '/symlink_1', TMP_DIR + '/1')
      ], cb);
    });
    it('should copy directory and its symlink', function(cb) {
      async.parallel([
        assertExists(TMP_DIR + '/sub'),
        assertExists(TMP_DIR + '/symlink_sub'),
        assertSymlink(TMP_DIR + '/symlink_sub', TMP_DIR + '/sub'),
        assertExists(TMP_DIR + '/sub/11'),
        assertExists(TMP_DIR + '/symlink_sub/11')
      ], cb);
    });

    after(function (cb) {
      rimraf(TMP_DIR, cb);
    });
  });

});
