# Stativus: Statecharts for the Rest of Us!

`Stativus` is a micro-framework that has full functionality of Statecharts for your application.  It can work in any library such as:

  + [`backbone.js`](http://documentcloud.github.com/backbone/)
  + [`EmberJS`](http://emberjs.com/)
  + [`spine.js`](http://maccman.github.com/spine/)
  + [VUEJS](http://www.vuejs.org/)
  + or any others

Statecharts are a great way to organize your web application and make it more robust and increase code reuse.

## Versions

`Stativus` comes in three versions:

  + **Debug Mode**: This is the file named `stativus.debug.js` and it is more readable and you get the following
    + All `enterState` are documented with 'ENTER: *state_name*'
    + All `exitState` are documented with 'EXIT: *state_name*
    + All events are documented with 'EVENT: *state_name* fired [*event_name*] with *n* argument(s)'
    + Any time your application is configured in such a way that it will break, you will get a console or exception
    + All Async starts and stops will be outputted to the console.
    + Will warn you if you forgot to return true when using willEnterState()
  + **Full**: this is the file named `stativus.js` and is a normal version for production use
  + **Minified**: this is the file named `stativus-min.js` and is a minified version for production use (gzipped: ~3.9k)

## Demo
A list of all demos can be found at [Stativus Demos](http://demo.stativ.us)

You can see a working version using only HTML5 Canvas / JQuery / Stativus called [RedFlix](http://demo.stativ.us/html5-canvas/index.html)
You can see the code at [stativus-demo](https://github.com/etgryphon/stativus-demo)

## Readings and Tutorials on Statecharts

Here are a list of resources for learning about state charts (Thanks: Johnny Luu):

  + (http://www3.informatik.uni-erlangen.de/Lectures/UMLEmbSys/WS2001/slides/Statecharts.pdf)
  + (http://www.agilemodeling.com/artifacts/stateMachineDiagram.htm)
  + (http://santos.cis.ksu.edu/771-Distribution/Reading/uml-section3.73-94.pdf)
  + (http://www.tutorialspoint.com/uml/uml_statechart_diagram.htm)
  + (http://www.developer.com/design/article.php/2238131/State-Diagram-in-UML.htm)
  + (http://www.slideshare.net/erant/uml-statechart-diagrams)
  + (http://www.uml.org.cn/UMLApplication/pdf/bestbook.pdf)
  + (http://www.boost.org/doc/libs/1_41_0/libs/statechart/doc/tutorial.html)

## Usage

Please read the complete API documentation at [Stativ.us](http://stativ.us)

## Development

1. Make sure that you have [UglifyJS](https://github.com/mishoo/UglifyJS) installed
2. Make sure that you have [Metascript](https://github.com/dcodeIO/MetaScript) installed
3. Clone the repository: git clone git://github.com/etgryphon/stativus.git
4. ``` npm install ```
5. ``` grunt -v```

## Contributors

+ Architect: Evin Grano
  + twitter: @etgryphon
  + contact: etgryphon@icloud.com
+ Contributors:
  + __Seth Carney__ :: twitter: @SethCarney :: github: @scarney81
  + __Mike Atkins__ :: github: @apechimp
+ Beta Tester: Johnny Luu

## License

Stativus is under the MIT license that can be read in license.js  Just remember who brought this to you.

## TypeScript declaration file

There is a TypeScript declartion file (stativus.d.ts) available for TypeScript users.
