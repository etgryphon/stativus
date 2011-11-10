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
    + Any time your application is configured in such a way that it will break, an exception will be thrown
  + **Minified**: this is the file named `stativus-min.js` and is a minified version for production use

## Demo

You can see a working version using only HTML5 Canvas and Stativus called (chrome only!)[RedFlix](http://aperture-0672911f.strobeapp.com/)
You can see the code at [stativus-demo](https://github.com/etgryphon/stativus-demo)

## Usage

To Create a Statechart, do this:

  `var myStatechart = Statechart.create();`

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



