/*globals $ equal module expect myStatechart Stativus stop start*/
var SC, stateTransitions, data;
var runAsyncTests = function(){  
  module("Module: Simple Async Tests", {
    setup: function(){
      var sc = Stativus.createStatechart();
      data = 0;
      sc.addState("#first", {
        enterState: function(){
          data += 1;
        },
        testEvent: function(){
          this.goToState('#second');
        }
      });
  
      sc.addState("#second", {
        willEnterState: function(statechart){
          var func = function(){
            statechart.restart();
          };
          window.setTimeout(func, 2000);
          return true;
        },
        enterState: function(){
          data += 1;
          equal(data, 2, "Data variable is incremented to 2" );
          var cStates = sc.currentState();
          equal(cStates.length, 1, "We have the correct number of current states" );
          equal(cStates[0].name, '#second', "we are currently in '#second'" );
          start();
        }
      });
      sc.initStates("#first");
      SC = sc;
    }
  });
  
  test("Check for enterState delay", function() {
    // expect(6);
    var cStates, state = SC.getState('#first');
    ok(state, "State exists...");
    equal(data, 1, "Current state '#first' has updated value correctly" );
    SC.sendEvent('testEvent');
    equal(data, 1, "Data variable is the same after exit from '#first'" );
    stop();
  });
  
};
