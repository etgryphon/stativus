/*global module:false*/
module.exports = function(grunt) {

    // Some pre-build stuff
    var pkgData = grunt.file.readJSON('package.json');

    // Project configuration.
    var gruntConfig = {
        // Metadata.
        pkg: pkgData,
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n*' +
            ' Licensed <%= _.map(pkg.licenses, "type").join(", ") %> */\n',
        VERSION: '1.0.0'
    };

    // Task Configurations
    gruntConfig.clean = require("./task_configs/clean.js");
    // File Manipulation Configs
    gruntConfig.metascript = require("./task_configs/metascript.js");
    gruntConfig.uglify = require("./task_configs/uglify.js");
    gruntConfig.replace = require("./task_configs/replace.js");
    gruntConfig.compress = require("./task_configs/compress.js");
    //gruntConfig.jshint = require("./task_configs/jshint.js");
    //gruntConfig.watch = require("./task_configs/watch.js");


    // Load all the configs
    grunt.initConfig(gruntConfig);

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-metascript');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-compress');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-watch');

    // Hybrid Tasks
    grunt.registerTask('debug_build', ['clean:debug', 'metascript:debug'/*, 'jshint:debug'*/]);
    grunt.registerTask('full_build', ['clean:full', 'metascript:full'/*, 'jshint:full'*/]);
    grunt.registerTask('min_build', ['clean:min', 'metascript:min',/* 'jshint:debug',*/ 'uglify', 'replace', 'compress']);

    // Default task.
    grunt.registerTask('default', ['debug_build', 'full_build', 'min_build']);
};
