/*
 * grunt-scriptlinker
 * https://github.com/scott-laursen/grunt-scriptlinker
 *
 * Copyright (c) 2013 scott-laursen
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');

module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('file-and-cdn-linker', 'Your task description goes here.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			startTag: '<!--SCRIPTS-->',
			endTag: '<!--SCRIPTS END-->',
			fileTmpl: '<script src="%s"></script>',
			appRoot: '',
			relative: false,
			cdn: false
		});


		// Iterate over all specified file groups.
		this.files.forEach(function (f) {
			var scripts,
				page = '',
				newPage = '',
				start = -1,
				end = -1;
			//grunt.log.warn('Source file "' + JSON.stringify(f));
			// Create string tags
			if(!options.cdn){
				scripts = f.src.filter(function (filepath) {
						// Warn on and remove invalid source files (if nonull was set).
						//grunt.log.info('Source file "' + filepath);
						if (!grunt.file.exists(filepath)) {
							grunt.log.warn('Source file "' + filepath + '" not found.');
							return false;
						} else { return true; }
					}).map(function (filepath) {
						filepath = filepath.replace(options.appRoot, '');
						// If "relative" option is set, remove initial forward slash from file path
						if (options.relative) {
							filepath = filepath.replace(/^\//,'');
						}
						return util.format(options.fileTmpl, filepath);
					});
			}
			else {
				grunt.log.warn('else "' + JSON.stringify(f));
				scripts = f.orig.src.filter(function (filepath) {
						return true;
						// Warn on and remove invalid source files (if nonull was set).
						//grunt.log.info('Source file "' + filepath);
					}).map(function (filepath) {
						//grunt.log.warn('filepath "' + JSON.stringify(util.format(options.fileTmpl, filepath)));
						return util.format(options.fileTmpl, filepath);
					});
			}
				
			grunt.file.expand({}, f.dest).forEach(function(dest){
				page = grunt.file.read(dest);
				start = page.indexOf(options.startTag);

				end = page.indexOf(options.endTag, start);
				if (start === -1 || end === -1 || start >= end) {
					//grunt.log.warn("start === -1 || end === -1 || start >= end");
					return;
				} else {
				var padding ='';
				var ind = start - 1;
				// TODO: Fix this hack
				while(page.charAt(ind)===' ' || page.charAt(ind)==='  '){
					padding += page.charAt(ind);
					ind -= 1;
				}
					console.log('padding length', padding.length);
					//grunt.log.warn("Script:"+scripts);
					newPage = page.substr(0, start + options.startTag.length) + grunt.util.linefeed + padding + scripts.join(grunt.util.linefeed + padding) + grunt.util.linefeed + padding + page.substr(end);
					// Insert the scripts
					grunt.file.write(dest, newPage);
					grunt.log.writeln('File "' + dest + '" updated.');
				}
			});
		});
	});

};
