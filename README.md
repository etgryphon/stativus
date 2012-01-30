# Stativus: Statecharts for the Rest of Us!

`Stativus` is a micro-framework that has full functionality of Statecharts for your application.  It can work in any library such as:

  + [`backbone.js`](http://documentcloud.github.com/backbone/)
  + [`EmberJS`](http://emberjs.com/)
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
    + All Async starts and stops will be outputted to the console.
    + Will warn you if you forgot to return true when using willEnterState()
  + **Minified**: this is the file named `stativus-min.js` and is a minified version for production use (gzipped: <3.5k)

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
  + `getState`
  + `sendEvent`
  + `goToState`
  + `goToHistoryState`
  + `initStates` or `initState`
  + `setData`
  + `getData`
  
Statecharts also have the following functions only in *Debug mode*:

  + `getAllStates`
  + `inState`
  
Basic States should look like this:
	
	myStatechart.addState('loading', {
	  // Configuration
		globalConcurrentState: 'data_states', <= *optional: if you have more than 1 global parallel states, defaults to 'default'
		substatesAreConcurrent: true || false <= *optional: in case you have parallel substates, defaults to <false>
		parentState: 'some_parent', <= If 'null', then defaults to a top level state for the global concurrent state
		initialSubstate: 'really_loading' <= *optional: if you have substates
		
		// Base Events
		willEnterState: function(statechart){ ... }, <= for async coding, trigger statechart to restart with 'statechart.restart()'
		enterState: function(){ ... },
		didEnterState: function(){ ... },
		
		willExitState: function(statechart){ ... }, <= for async coding, trigger statechart to restart with 'statechart.restart()'
		exitState: function(){ ... },
		didExitState: function(){ ... },
		
		// Any other events
		doSomething: function(arg1, arg2, ...){
		    // do stuff
		}
	});
	
More Advanced State can nest substates inside of them like this:
    
	myStatechart.addState("#application", {
	  initialSubstate: '#first',
	  states: [ 
	    { // Type 1: create configuration code as the element
	      name: '#first',
	      initialSubstate: '#first.first',
	      states: [
	        { name: '#first.first'}, // <= Multiple nesting
	        { name: '#first.second'}
	      ]
	    },
	    ['#second', { ... config code ... }] // Type 2:  You can also pass an array where the first argument is the 
	                                         // name, second argument is shared object
	  ]
	});
    
Async Coding can be done like this:
	
	// Morpheus example: https://github.com/ded/morpheus
	myStatechart.addState("#first", {
	  enterState: function(){ ... },
	  testEvent: function(){
	    this.goToState('#second');
	  }
	});

	sc.addState("#second", {
	  willEnterState: function(statechart){
	    $('#content .boosh').animate({
	      left: 911,
	      complete: function () {
	        statechart.restart(); // REQUIRED!!: call this function to 
	                              // restart the statechart transitions
	      }
	    })
	    return true; // REQUIRED!!: return true so Stativus knows to stop the 
	                 // transitions and wait for animation or other async code.
	  },
	  enterState: function(){ ... }
	});
    
## Contributors

+ Architect: Evin Grano
  + twitter: @etgryphon
  + contact: etgryphon@sproutcore.com
+ Beta Tester: Johnny Luu

## License

Stativus is under the MIT license that can be read in license.js  Just remember who brought this to you.

