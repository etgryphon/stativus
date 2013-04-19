/*globals $ equal module expect myStatechart Stativus*/
var SC, stateTransitions, mockObject;
var runStatechartTestingTests = function(){
    
  module("Module: Test Statechart Testing", {
    setup: function(){
      mockObject = {
        enterCount: 0,
        exitCount: 0
      };
      var sc = Stativus.createStatechart();
      sc.addState("#application", {
        initialSubstate: '#subapplication',
        enterState: function(){
          console.log("Enter state...");
          mockObject.enterCount = mockObject.enterCount+1;
        },
        exitState: function(){
          console.log('blah...');
          mockObject.exitCount = mockObject.exitCount+1;
        },
        testEvent: function(){
          console.log('Test Event Fired...');
        },
        testEventHandled: function(){
          console.log('Test Event Fired...');
          return true;
        }
      });
      sc.addState("#subapplication1", {
        parentState: "#application",
        transitionEvent: function(){
          this.goToState('#subapplication2');
        },
        cascadeEvent: function(){
          sc.sendEvent('transitionEvent');
        }
      });
      sc.addState("#subapplication2", {
        parentState: "#application",
        enterState: function(){
          this.goToState('#subapplication1');
        }
      });
      SC = sc;
    }
  });
  
  test("Is TestStatechart Created?", function() {
    var state = SC.loadState('#application');
    ok( SC.isTestingStatechart, 'Testing Statechart was created' );
  });
  
  test("Check to see if basic state tests work", function(){
    var state = SC.loadState("#application");
    equal(mockObject.enterCount, 0, 'mockObject.enterCount is 0');
    equal(mockObject.exitCount, 0, 'mockObject.exitCount is 0');
    state.enterState();
    equal(mockObject.enterCount, 1, 'enterState was successfully called');
    SC.sendEvent('testEvent');
    ok(state.wasEvent('testEvent').called(), 'testEvent was called and handled on #application');
    ok(!state.wasEvent('testEvent').handled(),'testEvent will continue to propagate to parent');
    SC.sendEvent('testEventHandled');
    ok(state.wasEvent('testEventHandled').called(), 'testEventHandled was called and handled on #application');
    ok(state.wasEvent('testEventHandled').handled(),'testEventHandled was handled, no propagation to parent');
    state.exitState();
    equal(mockObject.exitCount, 1, 'exitState was successfully called');
  });
  
  test("Check to see if transition tests work", function(){
    var state = SC.loadState("#subapplication1");
    SC.sendEvent('transitionEvent');
    ok(state.wasEvent('transitionEvent').called(), 'transitionEvent was called and handled on #subapplication1');
    ok(state.wasEvent('transitionEvent').transitionedTo('#subapplication2'), 'transitionEvent called transitioned to #subapplication2');
    SC.sendEvent('cascadeEvent');
    ok(state.wasEvent('cascadeEvent').called(), 'cascadeEvent was called and handled on #subapplication1');
    ok(state.wasEvent('transitionEvent').called(2), 'cascadeEvent triggers a 2nd transitionEvent on #subapplication1');
  });
  
  test("Check to see if switch states work", function(){
    var state = SC.loadState("#subapplication2");
    state.enterState();
    ok(state.transitionedTo('#subapplication1'), 'switch state had proper transition');
  });
};
