/*globals equal, module, expect, Stativus*/
var SC, stateTransitions;
var runEventTests = function(){
    
  module("Module: Test Events", {
    setup: function(){
      var sc = Stativus.createStatechart();
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
    equal( stateTransitions.length, 4, "After first event: There should be 4 transitions" );
    SC.sendEvent('testEvent');
    equal( stateTransitions.length, 9, "After second event: There should be 9 transitions" );
    stateTransitions.forEach( function(x, i){
      ok( x.indexOf(expectedEvents[i]) > -1, "The ["+i+"] transition is => "+x );
    });
  });

};
