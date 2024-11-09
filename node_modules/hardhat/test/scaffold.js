/**
 * Test HardHat's scaffold utility.
 */

var assert = require('assert'),
    path = require('path'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    hardhat = require('../'),
    assertDeepDiveEqual = require('./helpers/assertDeepDiveEqual');

describe('Scaffold', function() {
  var dirIn,
      dirOut = path.join(__dirname, 'fixtures/out'),
      options = {};

  // Clean up output after each test.
  afterEach(function(done) {
    rimraf(dirOut, done);
  });

  describe('Plain Scaffolding', function() {
    beforeEach(function(done){
      dirIn = path.join(__dirname, 'fixtures/plain');
      hardhat.scaffold(dirIn, dirOut, done);
    });

    it('should copy the files and folders from `in` to `out`', function(done) {
      assertDeepDiveEqual(dirIn, dirOut, done);
    });
  });

  describe('Templated Scaffolding', function() {
    beforeEach(function(done) {
      dirIn = path.join(__dirname, 'fixtures/templated');
      options = {data: {title: 'Hot Title', body: 'Sexy Body'}};
      hardhat.scaffold(dirIn, dirOut, options, done);
    });

    it('should copy the files and folders from `in` to `out`', function(done) {
      assertDeepDiveEqual(dirIn, dirOut, done);
    });

    it('should NOT apply the template data to `README.md`', function() {
      var contents = fs.readFileSync(path.join(dirOut, 'README.md'), 'utf8');
      assert.equal(contents, 'This is some templated scaffolding.  {{title}} should not be replaced.');
    });

    it('should apply the template data to `index.tpl.html`', function() {
      var contents = fs.readFileSync(path.join(dirOut, 'index.html'), 'utf8');
      assert.equal(contents, '<html><head><title>Hot Title</title></head><body>Sexy Body</body></html>');
    });
  });

  describe('Non-default templating engine (Jade)', function() {
    beforeEach(function(done) {
      dirIn = path.join(__dirname, 'fixtures/jade');
      options = {
        engine: 'jade',
        ext: 'jade',
        data: {title: 'Hot Title', body: 'Sexy Body'},
      };
      hardhat.scaffold(dirIn, dirOut, options, done);
    });

    it('should apply the template data to `index.jade.html`', function() {
      var contents = fs.readFileSync(path.join(dirOut, 'index.html'), 'utf8');
      assert.equal(contents, '<html><head><title>Hot Title</title></head><body>Sexy Body</body></html>');
    });
  });

  describe('Error Conditions', function() {
    it('should error on a bad input directory', function(done) {
      dirIn = path.join(__dirname, 'fixtures/bad');
      hardhat.scaffold(dirIn, dirOut, function(err) {
        assert.ok(err, 'An error was not present.')
        assert.equal(err.message.indexOf('The input directory does not exist'), 0, 'An incorrect error message was observed.')
        done();
      });
    });

    it('should error on a bad templating engine', function(done) {
      dirIn = path.join(__dirname, 'fixtures/plain');
      hardhat.scaffold(dirIn, dirOut, {engine: 'bad'}, function(err) {
        assert.ok(err, 'An error was not present.')
        assert.equal(err.message.indexOf('The templating engine'), 0, 'An incorrect error message was observed.')
        done();
      });
    });
  });

});
