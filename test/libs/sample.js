/*globals Statechart */
var TestRunner = {  
  createDefaultStatechart: function(){
    var sc = Statechart.create();
    var allEnterExit = {
      enterState: function(){
    	  console.log('Enter State: ', this.name);
    	},
    	exitState: function(){ 
    	  console.log('Exit State: ', this.name);
    	}
    };
    sc.addState('first', allEnterExit, {
      substatesAreConcurrent: true,
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
        this.goToState('second');
    	}
    });
    sc.addState('first.first', allEnterExit, {
      parentState: 'first',
      initialSubstate: 'first.first.first',
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.addState('first.second', allEnterExit, {
      parentState: 'first',
      initialSubstate: 'first.second.first',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.addState('first.first.first', allEnterExit, {
      parentState: 'first.first',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	  this.goToState('first.first.second');
    	  return true;
    	}
    });
    sc.addState('first.first.second', allEnterExit, {
      parentState: 'first.first',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.addState('first.second.first', allEnterExit, {
      parentState: 'first.second',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.addState('first.second.second', allEnterExit, {
      parentState: 'first.second',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.addState('second', allEnterExit, {
      initialSubstate: 'second.first',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.addState('second.first', allEnterExit, {
      parentState: 'second',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.addState('second.second', allEnterExit, {
      parentState: 'second',
    	// Base Events
    	testEvent: function(){
    	  console.log('In ', this.name, ' firing event: testEvent');
    	}
    });
    sc.initStates('first');
    return sc;
  }
};
window.TestRunner = TestRunner;