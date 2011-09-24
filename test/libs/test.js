/*globals $ equal module expect myStatechart Statechart*/
var SC, stateTransitions;
var runStateChartTests = function(){
  
  module("Module: Test Initialization", {
    setup: function(){
      var tr = window.TestRunner;
      SC = tr.createDefaultStatechart();
    }
  });
  
  test("Is Statechart Initialization Correct?", function() {
    var cStates, testNames = 'first,first.first.first,first.second.first';
    expect(6);
    cStates = SC.currentState();
    equals( cStates.length, 5, "In the Default State: there are 5 current states" );
    cStates.forEach( function(x){
      ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
    });
  });
    
  module("Module: Test Edge Initializations", {
    setup: function(){
      var sc = Statechart.create();
      var docEnter = {
        enterState: function() {
            console.log("Enter State: " + this.name);
        },
        exitState: function() {
            console.log("Enter State: " + this.name);
        }
      };
      sc.addState("#application", docEnter, {
        substatesAreConcurrent: true
      });
      sc.addState("#subapplication", docEnter, { // This state isn't entered
        parentState: "#application",
        substatesAreConcurrent: true
      });
  
      sc.addState("#first", docEnter, {
        parentState: "#subapplication"
      });
  
      sc.addState("#second", docEnter, {
        parentState: "#subapplication"
      });
      sc.initStates("#application");
      SC = sc;
    }
  });
  
  test("Is Statechart Initialization Correct for Single parallel concurrent substate?", function() {
    var cStates, testNames = '#application,#subapplication,#first,#second';
    expect(5);
    cStates = SC.currentState();
    equals( cStates.length, 4, "In the Default State: there are 4 current states" );
    cStates.forEach( function(x){
      ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
    });
  });
  
  module("Module: Test Events", {
    setup: function(){
      var sc = Statechart.create();
      stateTransitions = [];
      var allEnterExit = {
        enterState: function() {
          stateTransitions.push('ENT: '+this.name);
        },
        exitState: function() {
          stateTransitions.push('EXT: '+this.name);
        },
        
        testEvent: function(){
          stateTransitions.push('EVT: '+this.name+'.testEvent');
        }
      };
      sc.addState("#application", allEnterExit, {
        initialSubstate: '#subapplication'
      });
      sc.addState("#subapplication", allEnterExit, {
        parentState: "#application",
        substatesAreConcurrent: true
      });
  
      sc.addState("#first", allEnterExit, {
        parentState: "#subapplication",
        initialSubstate: '#first.first'
      });
      
      sc.addState("#first.first", allEnterExit, {
        parentState: "#first",
        testEvent: function(){
          stateTransitions.push('EVT: '+this.name+'.testEvent');
          this.goToState('#first.second');
          return true;
        }
      });
      
      sc.addState("#first.second", allEnterExit, {
        parentState: "#first"
      });
  
      sc.addState("#second", allEnterExit, {
        parentState: "#subapplication"
      });
      sc.initStates("#application");
      SC = sc;
    }
  });
  
  test("Is Event Propigation stops on true return?", function() {
    expect(11);
    var expectedEvents = ['EVT','EVT', 'EXT', 'ENT', 'EVT', 'EVT', 'EVT', 'EVT', 'EVT'];
    stateTransitions = [];
    expect(11);
    SC.sendEvent('testEvent');
    equals( stateTransitions.length, 4, "After first event: There should be 4 transitions" );
    SC.sendEvent('testEvent');
    equals( stateTransitions.length, 9, "After second event: There should be 9 transitions" );
    stateTransitions.forEach( function(x, i){
      ok( x.indexOf(expectedEvents[i]) > -1, "The ["+i+"] transition is => "+x );
    });
  });
  
  module("Module: Test Transitions");
  // 
  // TODO: Write transition tests 

  module("Module: Miscellaneous");
  // 
  // TODO: Write transition tests
};
