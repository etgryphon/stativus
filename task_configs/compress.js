module.exports = {
    default: {
        options: {
            mode: 'gzip'
        },
        expand: true,
        cwd: 'dist/',
        src: ['stativus.min.js'],
        dest: "dist/",
        ext: '.min.gz.js'
    }
};
