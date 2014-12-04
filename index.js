'strict';
// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var minimatch = require('minimatch');
var Path = require('path');
var PluginError = gutil.PluginError;

// consts
var PLUGIN_NAME = 'gulp-bower-normalize';

// Gets the component parts, package name, filename, ext
function getComponents(file) {
    var relativePath = file.relative;
    var pathParts = Path.dirname(relativePath).split(Path.sep);
    return {
        ext: Path.extname(relativePath).substr(1), // strip dot
        filename: Path.basename(relativePath),
        packageName: pathParts[0]
    };
}

// plugin level function (dealing with files)
function gulpBowerNormalize(userOptions) {
    var options = userOptions || {},
        bowerJson = options.bowerJson || "./bower.json",
        overrides = {};

    bowerJson = Path.join(process.cwd(), bowerJson);

    try {
        overrides = require(bowerJson);
        overrides = overrides.overrides || {};
    } catch(e) {
        throw new PluginError(PLUGIN_NAME, "No bower.json at " + bowerJson + " or overrides invalid!");
    }

    // creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, cb) {
        var components = getComponents(file),
            type = components.ext,
            pkgOverrides = null,
            normalize = null;

        // Check if there are overrides
        if (components.packageName in overrides) {
            pkgOverrides = overrides[components.packageName];
            // Check if there are any normalize overrides
            if ('normalize' in pkgOverrides) {
                normalize = pkgOverrides.normalize;
                // Loop through each type in normalize
                Object.keys(normalize).forEach(function(key) {
                    var filter = normalize[key];

                    // Check if it's a string and make it an array, just for ease of processing
                    if (typeof filter === "string") {
                        filter = [filter];
                    }

                    // Check each glob
                    filter.map(function(glob) {
                        // Potential bug here if multiple types match glob
                        // Last one in wins right now, maybe throw error?
                        if (minimatch(components.filename, glob)) {
                            type = key;
                        }
                    });
                });
            }
        }

        file.path = Path.join(file.cwd, file.base, components.packageName, type, components.filename);

        this.push(file);

        return cb();
    });

    // returning the file stream
    return stream;
}

// exporting the plugin main function
module.exports = gulpBowerNormalize;
