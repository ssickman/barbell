module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
        	'js/<%= pkg.name %>.min.js': ['js/static-data.js', 'js/classes.js', 'js/main.js']
		} 
      },
    },
    cssmin: {
    	combine: {
    		files: {
	        	'css/<%= pkg.name %>.min.css': ['css/normalize.min.css', 'css/font.css', 'css/main.css']
			} 
    	}
    },
    jshint: {
	    all: ['Gruntfile.js', 'js/static-data.js', 'js/classes.js', 'js/main.js', 'js/tests.js']
	  }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);
  grunt.registerTask('build', ['uglify', 'cssmin']);

};
