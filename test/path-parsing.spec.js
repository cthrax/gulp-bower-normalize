var expect = require("chai").expect;
var File = require('vinyl');
var es = require('event-stream');
var Path = require('path');
var normalizer = require('../');
describe("gulp-bower-normalize", function() {
    var assertFlattened = function(fakeFile, expected) {
        var myNormalizer = normalizer({flatten: true, bowerJson: './test/fixtures/bower.json'});
        myNormalizer.write(fakeFile);
        myNormalizer.once("data", function(file) {
            expect(file.path).to.equal(Path.normalize(expected));
        });
    };

    var assertNormalized = function(fakeFile, expected) {
        var myNormalizer = normalizer({bowerJson: './test/fixtures/bower.json'});
        myNormalizer.write(fakeFile);
        myNormalizer.once("data", function(file) {
            expect(file.path).to.equal(Path.normalize(expected));
        });
    };

    var getFakeFiles = function(packageName) {
        var bowerJson = require('./fixtures/bower.json');
        var depOverrides = bowerJson.overrides[packageName];
        var files = [];
        var main = depOverrides.main;
        if (typeof main === "string") {
            main = [main];
        }

        main.map(function(file) {
            files.push(new File({
                cwd: '/',
                base: '/path',
                path: '/path/' + packageName + '/a/' + file
            }));
        });

        return files;
    };

    it("should implicitly set normalized path without override section", function() {
        var fakeFile = new File({
            cwd: '/',
            base: '/path',
            path: '/path/to/a/file.ext'
        });

        var myNormalizer = normalizer({bowerJson: './test/fixtures/bower-without-override.json'});
        myNormalizer.write(fakeFile);
        myNormalizer.once("data", function(file) {
            expect(file.path).to.equal(Path.normalize('/path/to/ext/file.ext'));
        });
    });

    it("should implicitly set normalized path without overrides", function() {
        var fakeFile = new File({
            cwd: '/',
            base: '/path',
            path: '/path/to/a/file.ext'
        });

        assertNormalized(fakeFile, '/path/to/ext/file.ext');
    });

    it("should implicitly set normalized path with override and no normalize", function() {
        var fakeFiles = getFakeFiles("dependency1");
        assertNormalized(fakeFiles[0], '/path/dependency1/js/some.js');
    });

    it("should normalize based on explicit normalize overrides", function() {
        var fakeFiles = getFakeFiles("dependency2");
        assertNormalized(fakeFiles[0], '/path/dependency2/javascript/some.js');
    });

    it("should normalize with multiple normalization targets", function() {
        var fakeFiles = getFakeFiles("dependency3");
        assertNormalized(fakeFiles[0], '/path/dependency3/js/some.js');
        assertNormalized(fakeFiles[1], '/path/dependency3/css/some.css');
    });

    it("should normalize with multiple filter to one target", function() {
        var fakeFiles = getFakeFiles("dependency4");
        assertNormalized(fakeFiles[0], '/path/dependency4/js/some.js');
        assertNormalized(fakeFiles[1], '/path/dependency4/js/some.json');
    });

    it("should normalize with a mix of implicit and explicit", function() {
        var fakeFiles = getFakeFiles("dependency5");
        assertNormalized(fakeFiles[0], '/path/dependency5/js/some.js');
        assertNormalized(fakeFiles[1], '/path/dependency5/json/some.json');
    });

    it("should normalize long file paths to a short path", function() {
        var fakeFiles = getFakeFiles("dependency6");
        assertNormalized(fakeFiles[0], '/path/dependency6/js/file.js');
    });

    it("should implicitly set flattened path with override and no normalize", function() {
        var fakeFiles = getFakeFiles("dependency1");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
    });

    it("should flatten based on explicit normalize overrides", function() {
        var fakeFiles = getFakeFiles("dependency2");
        assertFlattened(fakeFiles[0], '/path/javascript/some.js');
    });

    it("should flatten with multiple normalization targets", function() {
        var fakeFiles = getFakeFiles("dependency3");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
        assertFlattened(fakeFiles[1], '/path/css/some.css');
    });

    it("should flatten with multiple filter to one target", function() {
        var fakeFiles = getFakeFiles("dependency4");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
        assertFlattened(fakeFiles[1], '/path/js/some.json');
    });

    it("should flatten with a mix of implicit and explicit", function() {
        var fakeFiles = getFakeFiles("dependency5");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
        assertFlattened(fakeFiles[1], '/path/json/some.json');
    });

    it("should flatten long file paths", function() {
        var fakeFiles = getFakeFiles("dependency6");
        assertFlattened(fakeFiles[0], '/path/js/file.js');
    });
});