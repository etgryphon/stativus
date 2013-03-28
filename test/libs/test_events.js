/*globals $ equal module expect myStatechart Stativus*/
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
        },
        _nonTrackedEvent: function() {
          stateTransitions.push('EVT: '+this.name+'._nonTrackedEvent');
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
        },
        tracking: function() {
          stateTransitions.push('EVT: '+this.name+'.tracking');
          this.goToState('#first.tracking');
          return true;
        },
        notracking: function() {
          stateTransitions.push('EVT: '+this.name+'.notracking');
          this.goToState('#first.notracking');
          return true;
        }

      });
      
      sc.addState("#first.second", allEnterExit, {
        parentState: "#first"
      });
  
      sc.addState("#second", allEnterExit, {
        parentState: "#subapplication"
      });

      sc.addState('#first.tracking', {
        track: true,
        parentState: '#first'
      });

      sc.addState('#first.notracking', {
        parentState: '#first'
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

  test('Tracks page view in google analytics if it has been configured and track set to true', function() {
    expect(2);
    window._gaq = [];

    SC.sendEvent('tracking');

    equal(window._gaq.length, 1, 'After first event: Should have one page view');
    var evt = window._gaq.pop();
    equal(evt[0], '_trackPageview', 'Event type should be _trackPageview');
  });

  test('Does not track page view in google analytics if it has been configured and track set to false', function() {
    expect(1);
    window._gaq = [];

    SC.sendEvent('notracking');

    equal(window._gaq.length, 0, 'After first event: Should have no page views');
  });

  test('Does not track page view in google analytics if it has not been configured and track set to true', function() {
    expect(1);
    delete window._gaq;

    SC.sendEvent('tracking');

    equal(typeof window._gaq, 'undefined', 'Analytics object should remain undefined');
  });

  test('Logs event to google analytics if it has been configured', function() {
    expect(5);
    window._gaq = [];

    SC.sendEvent('testEvent');

    equal(window._gaq.length, 1, 'After first event: Should have one event activity');
    var evt = window._gaq.pop();
    equal(evt[0], '_trackEvent', 'Event type should be _trackEvent');
    equal(evt[1], 'Event', 'Event should be Event');
    equal(evt[2], '#second:testEvent', 'Event name should be testEvent');
    equal(evt[3], '', 'Arguments should be empty');
  });

  test('Does not log to Google analytics if configured and event name is prefixed with underscore [_]', function() {
    expect(1);
    window._gaq = [];

    SC.sendEvent('_nonTrackedEvent');

    equal(window._gaq.length, 0, 'After first event: Should have zero event activities');
  });

  test('Logs event to google analytics with arguments if it has been configured', function() {
    expect(2);
    window._gaq = [];

    SC.sendEvent('testEvent', 'arg1');
    var evt1 = window._gaq.pop();
    equal(evt1[3], 'arg1', 'Arguments should be populated');

    SC.sendEvent('testEvent', 'arg1', 'arg2');
    var evt2 = window._gaq.pop();
    equal(evt2[3], 'arg1,arg2', 'Arguments should be populated');
  });

  test('Does not throw an exception if google analytics is not configured', function() {
    expect(1);
    delete window._gaq;
    
    SC.sendEvent('testEvent');
    ok(true, 'No exceptions were encountered when analytics is not configured');
  });

  test('Does not throw an exception if google analytics is configured but not an array', function() {
    expect(1);
    window._gaq = {};
    
    SC.sendEvent('testEvent');
    ok(true, 'No exceptions were encountered when analytics not an array');
  });

  test('Does not log event to google analytics if it has not been configured', function() {
    expect(1);
    delete window._gaq;
    
    SC.sendEvent('testEvent');
    equal(typeof window._gaq, 'undefined', 'Analytics object should remain undefined');
  });
};
