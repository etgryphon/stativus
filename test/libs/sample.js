/*globals Statechart */
var TestRunner = {  
  createDefaultStatechart: function(){
    var sc = Statechart.create();
    sc.addState('first', {
      substatesAreConcurrent: true,
    	// Base Events
    	testEvent: function(){
        this.goToState('second');
    	}
    });
    sc.addState('first.first', {
      parentState: 'first',
      initialSubstate: 'first.first.first',
    	testEvent: function(){ }
    });
    sc.addState('first.second', {
      parentState: 'first',
      initialSubstate: 'first.second.first',
    	// Base Events
    	testEvent: function(){ }
    });
    sc.addState('first.first.first', {
      parentState: 'first.first',
    	// Base Events
    	testEvent: function(){
    	  this.goToState('first.first.second');
    	  return true;
    	}
    });
    sc.addState('first.first.second', {
      parentState: 'first.first',
    	// Base Events
    	testEvent: function(){ }
    });
    sc.addState('first.second.first', {
      parentState: 'first.second',
    	// Base Events
    	testEvent: function(){ }
    });
    sc.addState('first.second.second', {
      parentState: 'first.second',
    	// Base Events
    	testEvent: function(){ }
    });
    sc.addState('second', {
      initialSubstate: 'second.first',
    	// Base Events
    	testEvent: function(){ }
    });
    sc.addState('second.first', {
      parentState: 'second',
    	// Base Events
    	testEvent: function(){ }
    });
    sc.addState('second.second', {
      parentState: 'second',
    	// Base Events
    	testEvent: function(){ }
    });
    sc.initStates('first');
    return sc;
  }
};
window.TestRunner = TestRunner;