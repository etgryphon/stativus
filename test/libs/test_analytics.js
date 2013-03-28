/*globals expect, equal*/
var SC;
var runAnalyticsTests = function() {

  module("Module: Google Analytics - Test Tracking Initializations", {
    setup: function(){      
      // statechart with hashs as substates
      SC = Stativus.createStatechart();
      SC.addState("application", {
        initialSubstate: 'untracked',
        states: [ 
          {
            name: 'untracked',
            goToTracked: function() {
              this.goToState('tracked');
            }
          },
          {
            name: 'tracked',
            track: true
          }
        ]
      });
      SC.initStates("application");
    }
  });
  
  test("Test that track defaults to false", function() {
    expect(1);
    var cStates = SC.currentState();
    equal(cStates[0].track, false, 'Tracking should default to false');
  });

  test("Test that track can be set to true", function() {
    expect(1);
    SC.sendEvent('goToTracked');
    var cStates = SC.currentState();
    equal(cStates[0].track, true, 'Tracking should be set to true');
  });

  module("Module: Google Analytics - Events testing", {
    setup: function(){
      var sc = Stativus.createStatechart();

      var allEnterExit = {
        tracking: function() {
          this.goToState('tracking');
        },

        _noTracking: function() {
          this.goToState('notracking');
        }
      };

      sc.addState("application", allEnterExit, {
        initialSubstate: 'notracking'
      });

      sc.addState('tracking', {
        track: true,
        parentState: 'application'
      });

      sc.addState('notracking', {
        parentState: 'application'
      });

      sc.initStates("application");
      SC = sc;
    }
  });

  test('Tracks that a page view and an event are added if Google Analytics has been configured and track is set to true', function() {
    expect(6);
    window._gaq = [];

    SC.sendEvent('tracking');
    equal(window._gaq.length, 2, 'After event: Should have one page view and one event');

    var evt = window._gaq.pop();
    var pageView = window._gaq.pop();

    equal(pageView[0], '_trackPageview', 'Should have _trackPageview event');
    equal(evt[0], '_trackEvent', 'Event type should be _trackEvent');
    equal(evt[1], 'Event', 'Event should be Event');
    equal(evt[2], 'application:tracking', 'Event name should be testEvent');
    equal(evt[3], '', 'Arguments should be empty');
  });

  test('Does not track page view in Google Analytics if it has been configured and track set to false', function() {
    expect(1);
    window._gaq = [];

    SC.sendEvent('_noTracking');

    equal(window._gaq.length, 0, 'After first event: Should have no page views');
  });

  test('Does not track page view in Google Analytics if it has not been configured and track set to true', function() {
    expect(1);
    delete window._gaq;

    SC.sendEvent('tracking');

    equal(typeof window._gaq, 'undefined', 'Analytics object should remain undefined');
  });

  test('Does not log to Google analytics if configured and event name is prefixed with underscore [_]', function() {
    expect(1);
    window._gaq = [];

    SC.sendEvent('_nonTrackedEvent');

    equal(window._gaq.length, 0, 'After first event: Should have zero event activities');
  });

  test('Logs event to Google Analytics with arguments if it has been configured', function() {
    expect(2);
    window._gaq = [];

    SC.sendEvent('tracking', 'arg1');
    var evt1 = window._gaq.pop();
    equal(evt1[3], 'arg1', 'Arguments should be populated');

    SC.sendEvent('tracking', 'arg1', 'arg2');
    var evt2 = window._gaq.pop();
    equal(evt2[3], 'arg1,arg2', 'Arguments should be populated');
  });

  test('Does not throw an exception if google analytics is not configured', function() {
    expect(1);
    delete window._gaq;
    
    SC.sendEvent('tracking');
    ok(true, 'No exceptions were encountered when analytics is not configured');
  });

  test('Does not throw an exception if google analytics is configured but not an array', function() {
    expect(1);
    window._gaq = {};
    
    SC.sendEvent('tracking');
    ok(true, 'No exceptions were encountered when analytics not an array');
  });

  test('Does not log event to google analytics if it has not been configured', function() {
    expect(1);
    delete window._gaq;
    
    SC.sendEvent('tracking');
    equal(typeof window._gaq, 'undefined', 'Analytics object should remain undefined');
  });

};