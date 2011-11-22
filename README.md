# Stativus: Statecharts for the Rest of Us!

`Stativus` is a micro-framework that has full functionality of Statecharts for your application.  It can work in any library such as:

  + [`backbone.js`](http://documentcloud.github.com/backbone/)
  + [`SproutCore 2.0`](http://www.sproutcore.com/) SproutCore 1.x has statecharts built in...
  + [`spine.js`](http://maccman.github.com/spine/)
  + [ExtJS/Sencha](http://www.sencha.com/)
  + or any others

Statecharts are a great way to organize your web application and make it more robust and increase code reuse.

## Versions

`Stativus` comes in two versions:

  + **Debug Mode**: This is the file named `stativus.js` and it is more readable and you get the following
    + All `enterState` are documented with 'ENTER: *state_name*' 
    + All `exitState` are documented with 'EXIT: *state_name*
    + All events are documented with 'EVENT: *state_name* fired [*event_name*] with *n* argument(s)'
    + Any time your application is configured in such a way that it will break, you will get a console or exception
  + **Minified**: this is the file named `stativus-min.js` and is a minified version for production use

## Demo

You can see a working version (chrome only!) using only HTML5 Canvas and Stativus called [RedFlix](http://aperture-0672911f.strobeapp.com/)
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

To Create a Statechart, do this:

  `var myStatechart = Stativus.createStatechart();`

Statecharts have the following functions:

  + `addState`
  + `currentState`
  + `sendEvent`
  + `goToState`
  + `initState` or `initStates`
  + `setData`
  + `getData`
  
States should look like this:
	
	myStatechart.addState('loading', {
	  // Configuration
		globalConcurrentState: 'data_states', <= *optional: if you have more than 1 global parallel states, defaults to 'default'
		substatesAreConcurrent: true || false <= *optional: in case you have parallel substates, defaults to <false>
		parentState: 'some_parent', <= If 'null', then defaults to a top level state for the global concurrent state
		initialSubstate: 'really_loading' <= *optional: if you have substates
		
		// Base Events
		willEnterState: function(){ ... },
		enterState: function(){ ... },
		didEnterState: function(){ ... },
		
		willExitState: function(){ ... },
		exitState: function(){ ... },
		didExitState: function(){ ... },
		
		// Any other events
		doSomething: function(arg1, arg2, ...){
		    // do stuff
		}
	});

## Contributors

+ Architect: Evin Grano
  + twitter: @etgryphon
  + contact: etgryphon@sproutcore.com
+ Beta Tester: Johnny Luu

## License

Stativus is under the MIT license that can be read in license.js  Just remember who brought this to you

