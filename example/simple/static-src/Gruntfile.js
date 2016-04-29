module.exports = function(grunt){
    
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        
        concat: {
            options: {
                //定义一个用于插入合并输出文件之间的字符
                separator: ";\n\n"
            },
            all : {
                src: [],
                dest: '../static/js/<%= pkg.name %>.src.js'
            }
        },
        
        uglify: {
            all : {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
                },
                files: [{
                    expand: true,
                    cwd: 'js/',
                    src: '**/*.js',
                    dest: '../static/js'
                }]
            }
        },

        localcheck : {
            options : {
                substrstart : '../static/js/'.length
            },
            all : {
                expand: true,
                cwd: '../static/js/',
                src: ['**/*.js'],
                dest: '../static/js',
                hashConfigTo : '../index.html'
            }
        },

        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            compress: {
                files: {
                    '../static/css/soft-index.min.css': ["css/soft-index-v3.css"]
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('localcheck');
    
    grunt.registerTask('build', ['uglify:all', 'localcheck:all']);
};



