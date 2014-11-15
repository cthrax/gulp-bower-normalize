gulp-bower-normalize
================

Use rules in the bower.json or implicit rules to normalize the files being copied out of bower_components so that a consistent and clean version of the bower dependencies can be checked into the repo. This is intended to work with main-bower-files.

bower.json
```json
{
    name and otherstuff
    "dependencies": {
        "dependency1": "~1.0.1"
        "dependency2": "~1.0.1"
        "dependency3": "~1.0.1"
        "dependency4": "~1.0.1"
    },
    "overrides": {
        // Implicitly normalizes this file by file extension 'dependency1/js/some.js'
        "dependency1": {
            "main": "some.js"
        },
        // Implicitly organized into 'dependency2/js/some.js' 'dependency2/js/some.js'
        "dependency2": {
            "main": ["some.js", "some.css"]
        },
        // Explicitly organized into 'dependency3/js/some.js', 'dependency3/css/some.ext', 'dependency3/css/some.css'
        "dependency3": {
            "main": ["some.js", "some.ext", "some.css"],
            "normalize": {
                "js": "*.js",
                "css": ["*.ext", "*.css"]
            }
        } // dependency4 is implicitly organized into 'dependency4/<ext>/<file>
    }
}
```
