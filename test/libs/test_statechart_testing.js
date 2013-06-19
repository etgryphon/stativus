/*globals $ equal module expect myStatechart Stativus start stop asyncTest*/
var mockObject;
module("Module: Test Statechart Testing", {
  setup: function(){
    mockObject = {
      willEnterCount: 0,
      enterCount: 0,
      exitCount: 0,
      willExitCount: 0
    };
    
    this.sc = Stativus.createStatechart();
    this.sc.addState("#application", {
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

    this.sc.addState("#subapplication1", {
      parentState: "#application",
      transitionEvent: function(){
        this.goToState('#subapplication2');
      },
      cascadeEvent: function(){
        this.sendEvent('transitionEvent');
      }
    });

    this.sc.addState("#subapplication2", {
      parentState: "#application",
      enterState: function(){
        this.goToState('#subapplication1');
      }
    });

    this.sc.addState("#async", {
      willEnterState: function(done){
        var foo = function(){
          mockObject.willEnterCount = mockObject.willEnterCount+1;
          done();
        };
        window.setTimeout(foo, 2000);
        return true;
      },
      willExitState: function(done){
        var foo = function(){
          mockObject.willExitCount = mockObject.willExitCount+1;
          done();
        };
        window.setTimeout(foo, 2000);
        return true;
      }
    });
  }
});

test("Is TestStatechart Created?", function() {
  var state = this.sc.loadState('#application');
  ok( this.sc.isTestingStatechart, 'Testing Statechart was created' );
});

test("Check to see if basic state tests work", function(){
  var state = this.sc.loadState("#application");
  equal(mockObject.enterCount, 0, 'mockObject.enterCount is 0');
  equal(mockObject.exitCount, 0, 'mockObject.exitCount is 0');
  state.enterState();
  equal(mockObject.enterCount, 1, 'enterState was successfully called');
  this.sc.sendEvent('testEvent');
  ok(state.wasEvent('testEvent').called(), 'testEvent was called and handled on #application');
  ok(!state.wasEvent('testEvent').handled(),'testEvent will continue to propagate to parent');
  this.sc.sendEvent('testEventHandled');
  ok(state.wasEvent('testEventHandled').called(), 'testEventHandled was called and handled on #application');
  ok(state.wasEvent('testEventHandled').handled(),'testEventHandled was handled, no propagation to parent');
  state.exitState();
  equal(mockObject.exitCount, 1, 'exitState was successfully called');
});

test("Check to see if transition tests work", function(){
  var state = this.sc.loadState("#subapplication1");
  this.sc.sendEvent('transitionEvent');
  ok(state.wasEvent('transitionEvent').called(), 'transitionEvent was called and handled on #subapplication1');
  ok(state.wasEvent('transitionEvent').transitionedTo('#subapplication2'), 'transitionEvent called transitioned to #subapplication2');
  this.sc.sendEvent('cascadeEvent');
  ok(state.wasEvent('cascadeEvent').called(), 'cascadeEvent was called and handled on #subapplication1');
  ok(state.wasEvent('transitionEvent').called(2), 'cascadeEvent triggers a 2nd transitionEvent on #subapplication1');
});

test("Check to see if switch states work", function(){
  var state = this.sc.loadState("#subapplication2");
  state.enterState();
  ok(state.transitionedTo('#subapplication1'), 'switch state had proper transition');
});

asyncTest("Check to see if async enter calls work", function(){
  var state = this.sc.loadState("#async");
  state.willEnterState(function(){
    start();
    ok(state.willEnterCompleted(), 'Will enter async call was completed');
    equal(mockObject.willEnterCount, 1, 'willEnterCount was successfully called');
  });
});

asyncTest("Check to see if async exit calls work", function(){
  var state = this.sc.loadState("#async");
  state.willExitState(function(){
    start();
    ok(state.willExitCompleted(), 'Will exit async call was completed');
    equal(mockObject.willExitCount, 1, 'willExitCount was successfully called');
  });
});

