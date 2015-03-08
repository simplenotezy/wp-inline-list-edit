module.exports = function(grunt) {

	/**
	 * Configuration 
	 * @type {Object}
	 */
	
		grunt.initConfig({
			/**
			 * Uglify
			 * @type {Object}
			 */
			
				uglify: {
					/**
					 * The main JS for butler to work
					 * @type {Object}
					 */
					
						wpille: {
							files: {
								'assets/js/wp-inline-list-edit.min.js': ['src/js/tag-it.js', 'src/js/general.js'],
							}
						}
				},

			/**
			 * Concat
			 * @type {Object}
			 */
			
				concat: {
					options: {
						separator: ';',
					},
					dist: {
						src: ['src/js/tag-it.js', 'src/js/general.js'],
						dest: 'assets/js/general.js',
					},
				},

			/**
			 * Watch
			 */
			
				watch: {
					files: ['src/**'],
					tasks: ['jshint', 'uglify', 'concat'],
					css: {
						files: 'src/scss/wp-inline-list-edit.scss',
						tasks: ['sass'],
						options: {
							livereload: 1339
						}
					}
				},

			/**
			 * JSHint
			 */
			
				jshint: {
					all: ['src/js/general.js']
				},

			/**
			 * Sass
			 * @type {Object}
			 */
			
				sass: {
					dist: {
						files: {
							'assets/css/wp-inline-list-edit.css' : 'src/scss/wp-inline-list-edit.scss'
						},
						options: {
							'style': 'compressed'
						}
					}
				},
		});

	/**
	 * Libaries
	 */
		
		/**
		 * Uglify
		 */
		
			grunt.loadNpmTasks('grunt-contrib-uglify');

		/**
		 * Watch
		 */
		
			grunt.loadNpmTasks('grunt-contrib-watch');


		/**
		 * Concat
		 */
		
			grunt.loadNpmTasks('grunt-contrib-concat');

		/**
		 * JS Hint
		 */
		
			grunt.loadNpmTasks('grunt-contrib-jshint');

		/**
		 * Sass
		 */
		
			grunt.loadNpmTasks('grunt-contrib-sass');

	/**
	 * Default
	 */
	
		grunt.registerTask('default', ['watch']);
};