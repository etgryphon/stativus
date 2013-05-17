/*globals $ equal module expect myStatechart Stativus*/

  module("Events", {

    setup: function(){
      
      var that = this;

      this.sc = Stativus.createStatechart();
      this.stateTransitions = [];
      
      var allEnterExit = {
        enterState: function() {
          that.stateTransitions.push('ENT: '+this.name);
        },
        exitState: function() {
          that.stateTransitions.push('EXT: '+this.name);
        },
        testEvent: function(){
          that.stateTransitions.push('EVT: '+this.name+'.testEvent');
        }
      };
      
      this.sc.addState("#application", allEnterExit, {
        initialSubstate: '#subapplication'
      });

      this.sc.addState("#subapplication", allEnterExit, {
        parentState: "#application",
        substatesAreConcurrent: true
      });
  
      this.sc.addState("#first", allEnterExit, {
        parentState: "#subapplication",
        initialSubstate: '#first.first'
      });
      
      this.sc.addState("#first.first", allEnterExit, {
        parentState: "#first",
        testEvent: function(){
          that.stateTransitions.push('EVT: '+this.name+'.testEvent');
          this.goToState('#first.second');
          return true;
        },
        setDataAndTransition: function(data) {
          this.goToState('#dataTransition', data);
        }
      });
      
      this.sc.addState("#first.second", allEnterExit, {
        parentState: "#first"
      });
  
      this.sc.addState("#second", allEnterExit, {
        parentState: "#subapplication"
      });

      this.sc.addState('#dataTransition', {
        parentState: "#subapplication",
        enterState: function() { console.log('DATA FOOLS: '+this.getData('foo')); }
      });

      this.sc.initStates("#application");
    }
  });
  
  test("Is Event Propigation stops on true return?", function() {
    expect(11);
    var expectedEvents = ['EVT','EVT', 'EXT', 'ENT', 'EVT', 'EVT', 'EVT', 'EVT', 'EVT'];
    this.stateTransitions = [];
    expect(11);
    this.sc.sendEvent('testEvent');
    equal( this.stateTransitions.length, 4, "After first event: There should be 4 transitions" );
    this.sc.sendEvent('testEvent');
    equal( this.stateTransitions.length, 9, "After second event: There should be 9 transitions" );
    this.stateTransitions.forEach( function(x, i){
      ok( x.indexOf(expectedEvents[i]) > -1, "The ["+i+"] transition is => "+x );
    });
  });

  test("Is object data saved to state on transition", function() {
    expect(1);
    this.sc.sendEvent('setDataAndTransition', { foo: 'bar' });

    var data = this.sc.getState('#dataTransition').getData('foo');
    equal(data, 'bar');
  });

  test("Is string data saved to state on transition", function() {
    expect(1);
    this.sc.sendEvent('setDataAndTransition', 'foo');

    var data = this.sc.getState('#dataTransition').getData('foo');
    equal(data, 'foo');
  });
