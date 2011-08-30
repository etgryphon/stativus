To Create a Statechart, do this:

  var myStatechart = new Statechart();

Statecharts have the following functions: 
  addState, 
  sendEvent, 
  goToState, 
  initStates
  
	States should look like this:
	
	myStatechart.addState('loading', {
		globalConcurrentState: 'data_states', <= *optional: if you have more than 1 global parallel states
		subStatesAreConcurrent: true || false <= *optional: in case you have parallel substates, defaults to <false>
		parentState: 'some_parent',
		initialSubState: 'really_loading' <= *optional: if you have substates
		
		// Base Events
		initState: function(){ ... },
		
		willEnterState: function(enterStateFunction){ ... },
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
