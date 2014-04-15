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
      }
    },
    cssmin: {
    	combine: {
    		files: {
	        	'css/all.min.css': ['css/normalize.min.css', 'css/font.css', 'css/main.css']
			} 
    	}
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};
