/*
    onBuildWrite is heavily based on jQuery's build Gruntfile.js:
    https://github.com/jquery/jquery/blob/master/Gruntfile.js
*/
module.exports = function(grunt) {

  var rdefineEnd = /\}\);[^}\w]*$/;

 function convert( name, path, contents ) {
  // Convert var modules
    if ( /.\/(utils|core|deferred)\/(forEach|inArray|isArray|isFunction|slice|splice|trim|extend)/.test( path ) ) {
        if (name.match(/deferred/)) {
            console.log(contents.substr(0,100), contents.match(/define\([\w\W]*?return/));
        }            
            contents = contents
                    .replace( /define\([\w\W]*?return/, "var " + (/\/([\w-]+)/.exec(name)[1]) + " =" )
                    .replace( rdefineEnd, "" );
    } else if ( /.\/(core|deferred)\/(deferred|cache|dom)/.test( path ) ) {
            contents = contents
                    .replace( /define\([\w\W]*?\{/, "var " + (/\/([\w-]+)/.exec(name)[1]) + " = (function() {" )
                    .replace( rdefineEnd, "})();" );
        
    } else {
        // Ignore jQuery's exports (the only necessary one)
        if ( name !== "jq" ) {
                contents = contents
                        .replace( /\s*return\s+[^\}]+(\}\);[^\w\}]*)$/, "$1" )
                        // Multiple exports
                        .replace( /\s*exports\.\w+\s*=\s*\w+;/g, "" );
        }

        // replace version string with current pkg.version
        if (/core\./.test(path)) {
            contents = contents.replace("@VERSION", grunt.config( "pkg.version" ));
        }
    
        // Remove define wrappers, closure ends, and empty declarations
        contents = contents
                .replace( /define\([^{]*?{/, "" )
                .replace( rdefineEnd, "" );

        // Remove anything wrapped with
        // /* ExcludeStart */ /* ExcludeEnd */
        // or a single line directly after a // BuildExclude comment
        contents = contents
                .replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
                .replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );

        // Remove empty definitions
        contents = contents
                .replace( /define\(\[[^\]]+\]\)[\W\n]+$/, "" );
    }
        return contents;
  }

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');
  
  function modularBuild() {
      var availableModules = {
        'domready': 'domready/domready',
        'utils': 'utils/utils',
        'attr': 'attr/attr',
        'callbacks': 'callbacks/callbacks',
        'css': 'css/css',
	    'ajax': 'ajax/ajax',
        'animation': 'css/animation',
        'class': 'css/class',
        'data': 'data/data',
        'event': 'event/event',
        'filter': 'filter/filter',
        'manipulation': 'manipulation/manipulation',
        'misc': 'misc/misc',
        'queue': 'queue/queue',
        'support': 'support/support',
        'traversing': 'traversing/traversing'
      },
      buildModules = "'core'",  // by default only core is added
      cmdModules = arguments[0].split(','),
      startBuildStr = 'define([',
      endBuildStr = '], function(jq) { return jq; });',
      customBuildStr = '';
      
      cmdModules.forEach(function(path) {
          if (availableModules[path] && availableModules[path].length) {
            buildModules += ",'" + availableModules[path] + "'";
          } else {
              console.log("Warning: unknown module '" + path + "', ignoring.");
          }
      });
      
      // make build raw text
      customBuildStr = startBuildStr + buildModules + endBuildStr;
      
      console.log('Selected modules', buildModules);
      console.log('Generated build string: ', customBuildStr);

      // configure grunt for our task
      grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        compress: {
          main: {
            options: {
              mode: 'gzip'
            },
            files: [
              {flatten: true, src: ['build/jq.min.js'], ext: '.gz', dest: './build/jq.min.js.gz'}
            ]
          }
        },
        requirejs: {
          production: {
            options: {
              baseUrl: "src",
              name: "jq-selected-modules",
              out: "build/jq.min.js",
              onBuildWrite: convert,
              wrap: {
                    start: "(function() {",
                    end: "}());"
              },
              rawText: {
                'jq-selected-modules': customBuildStr
              }
            }
          }       
        }
      });
      
      grunt.task.run(['requirejs', 'compress']);
  };
    
  grunt.registerTask('custom', modularBuild);
  grunt.registerTask('default', function() {
    modularBuild('domready,utils,attr,callbacks,css,animation,class,data,event,filter,manipulation,misc,queue,support,traversing');
  });
  grunt.registerTask('build', 'default');
};