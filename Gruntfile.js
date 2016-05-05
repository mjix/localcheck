module.exports = function(grunt){
    
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        
        uglify: {
            all : {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
                },
                files: {
                    './dist/localcheck.min.js' : ['./localcheck.js'],
                    './dist/requirejs-localcheck.min.js' : ['./requirejs-localcheck.js']
                }
            }
        },

        jshint: {
            //定义用于检测的文件
            files: ['js/app/*.js'],
            //配置JSHint (参考文档:http://www.jshint.com/docs)
            options: {
                //你可以在这里重写jshint的默认配置选项
                globals: {
                    jQuery: true,
                    console: true,
                    define:true,
                    module: true
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    grunt.registerTask('build', ['uglify:all']);
    grunt.registerTask('test', ['jshint']);
};



