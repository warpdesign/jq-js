# jq-js - an experimental modular jQuery implementation

jq-js is a reimplemention of a subset of jQuery 1.8+ APIs for modern browsers in a modular way.

It is only made as an educationnal purpose since some very complete and solid (read: bug-free and fast ;)) jQuery reimplementations only exists (like Zepto).

Compared with these implementations, jq-js lacks a selector engine and only relies on standard querySelectorAll and matchesSelector methods so it's severly limited when compared with jQuery & Zepto.

jq-js also won't support older browsers and requires a fresh build of your prefered browser (see Requirements below).

jq-js is licensed under the terms of the MIT License.


Currently supported
-------------------

Here is a list of the APIs that are supported by jq-js. Note that some APIs may be incomplete.

 - $._data (internal)
 - $._removeData (internal)
 - $.ajax
 - $.ajaxOptions
 - $.css (not documented ?)
 - $.each
 - $.extend
 - $.getScript
 - $.inArray
 - $.isArray
 - $.isFunction
 - $.isNumeric
 - $.noConflict
 - $.holdReady
 - $.trim

 - .add
 - .addClass
 - .ajax
 - .ajaxSetup
 - .animate
 - .append
 - .appendTo
 - .attr
 - .bind
 - .children
 - .clone
 - .contents
 - .css
 - .each
 - .end
 - .eq
 - .fadeIn
 - .fadeOut
 - .filter
 - .find
 - .first
 - .get
 - .getScript
 - .hasClass
 - .height
 - .hide
 - .hover
 - .html
 - .index
 - .is
 - .last
 - .off
 - .offset
 - .on
 - .parent
 - .parents
 - .parentsUntil
 - .position
 - .post
 - .ready
 - .remove
 - .removeAttr
 - .removeClass
 - .scrollTop
 - .show
 - .text
 - .toggle
 - .toggleClass
 - .val
 - .width
 - .blur, .change, .click, .error, .focus, .focusin, .focusout, .hover, .keydown, .keyup, .keypress, .load, .mousedown, .mouseenter, .mouseleave, .mousemove, .mouseout, .mouseover, .mouseup, .resize, .scroll, .select, .submit, .unload



Browser Required
----------------
 - IE 10
 - Chrome 27
 - Safari 6
 - Firefox 22


jq-js in the real world
-----------------------
Although jq-js is experimental, I have already been successfully using it for my own projects:

 - [http://nicolasramz.fr](http://nicolasramz.fr)
 
Deferred-js which is part of jq-js has also been used in numerous projects.


Building
--------

You will need to have node and grunt.

~~~ sh
# install needed nodejs modules
$ npm install

# generate the default build containing every modules
grunt
~~~

The resulting built files will be put into build/ directory:

jq.min.js: minified js file, ready to be used
jq.min.js.gz minidefied gzipped file, ready to be served


jq-js modules
-------------

jq-js has been designed in a modular way so that it's possible to include only needed modules.

Here is a list of every jq-js modules:

<table>
    <thead>
        <tr>
            <th>Module Name</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>domready</td>
            <td>Handles DOM Ready methods: jq.holdReady(),...</td>
        </tr>
        <tr>
            <td>utils</td>
            <td>General purpose methods like jq.map, jq.isArray, jq.isFunction,...</td>
        </tr>
        <tr>
            <td>attr</td>
            <td>jq.attr() method</td>
        </tr>
        <tr>
            <td>callbacks</td>
            <td>Provides support for jq.Callback (very incomplete)</td>
        </tr>
        <tr>
            <td>css</td>
            <td>jq.css() method</td>
        </tr>
        <tr>
            <td>animation</td>
            <td>jq.animate, jq.slideUp, jq.slideDown methods</td>
        </tr>
        <tr>
            <td>class</td>
            <td>jq.addClass, jq.removeClass, jq.toggleClass support</td>
        </tr>
        <tr>
            <td>data</td>
            <td>Provides support for jq.data() method</td>
        </tr>
        <tr>
            <td>event</td>
            <td>Provides support for event handling: jq.bind, jq.on, and jq.click,... shortcuts</td>
        </tr>
        <tr>
            <td>filter</td>
            <td>Provides support for filtering jq collections: jq.filter, jq.not,...</td>
        </tr>
        <tr>
            <td>manipulation</td>
            <td>Provides support for manipulating DOM: jq.append, jq.html,...</td>
        </tr>
        <tr>
            <td>misc</td>
            <td>Provides support for jq.promise shortcut</td>
        </tr>
        <tr>
            <td>queue</td>
            <td>Provides support for queues: jq.queue, jq.dequeue,...</td>
        </tr>
        <tr>
            <td>support</td>
            <td>Provides support jq.support (very much incompleted)</td>
        </tr>
        <tr>
            <td>traversing</td>
            <td>Provides support for traversing the DOM: jq.parents, jq.children,...</td>
        </tr>
    </tbody>
</table>


Building your custom jq-js version
----------------------------------

To build a custom version of jq-js, simply include a list of comma-separated module names:

~~~ sh
# generate a build with only event and data modules
grunt custom:event,data
~~~

Note that some modules may depend on other modules so if you omit a required module, it will automatically be added
to the modules list.

To get a list of modules included in your jq build you may use jq.fn.jq.modules

jq defines the special jq.fn.jq hash which shows jq's version and modules included into the build:

~~~ sh
> jq.fn.jq
Object {version: "0.1.0", modules: "event,data"}
~~~

As core is always included, it doesn't appear in the list of modules.

Tests
-----

To run the tests, first build a complete version of jq-js: `grunt build` then simply open the html file that you want to test
in your browser, for example `tests/css/index.html`

Note that only deferred and css modules have been heavily tested and passes almost every tests. Since a lot of modules are incomplete,
lots of tests will fail.

Testing right now is rather rudimentary and uses patched jQuery test files. A lot could been done to ease testing.

If you want to help, don't hesitate! :)

Licence
-------

This software is distributed under an MIT licence.

Copyright 2014-2015 © Nicolas Ramz

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software
> and associated documentation files (the "Software"), to deal in the Software without
> restriction, including without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
> Software is furnished to do so, subject to the following conditions:
> The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software.
> The Software is provided "as is", without warranty of any kind, express or implied, including
> but not limited to the warranties of merchantability, fitness for a particular purpose and
> noninfringement. In no event shall the authors or copyright holders be liable for any claim,
> damages or other liability, whether in an action of contract, tort or otherwise, arising from,
> out of or in connection with the software or the use or other dealings in the Software.
