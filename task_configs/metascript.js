module.exports = {
    debug: {
        options: {
            mode: "transform",
            scope: {
                DEBUG_MODE: true,
                COLOR_MODE: true,
                EVENT_COLOR: true,
                EXIT_COLOR: true,
                ENTER_COLOR: true,
                VERSION: '<%= VERSION %>'
            },
            logLevel: 3
        },
        src: "stativus.js",
        dest: "dist/stativus.debug.js"
    },
    full: {
        options: {
            mode: "transform",
            scope: {
                DEBUG_MODE: false,
                COLOR_MODE: false,
                EVENT_COLOR: false,
                EXIT_COLOR: false,
                ENTER_COLOR: false,
                VERSION: '<%= VERSION %>'
            },
            logLevel: 3
        },
        src: "stativus.js",
        dest: "dist/stativus.js"
    },
    min: {
        options: {
            mode: "transform",
            scope: {
                DEBUG_MODE: false,
                COLOR_MODE: false,
                EVENT_COLOR: false,
                EXIT_COLOR: false,
                ENTER_COLOR: false,
                VERSION: '<%= VERSION %>'
            },
            logLevel: 3
        },
        src: "stativus.js",
        dest: "dist/stativus.min.js"
    },
};
