/*globals $ equal module expect myStatechart Stativus*/

module("Module: Concurrency", {

  setup: function(){
    
    var that = this;

    this.sc = Stativus.createStatechart();
    
    this.sc.addState('#main', {
      substatesAreConcurrent: true
    });
    
    // First parallel state & substates
    this.sc.addState('#first', {
      parentState: '#main',
      initialSubstate: '#a'
    });
    
    this.sc.addState('#a', {
      parentState: '#first',
      
      testEvent: function(){
        this.goToState('#i');
      }
    });
    
    this.sc.addState('#b', {
      parentState: '#first'
    });
    
    // Second parallel state & substates
    this.sc.addState('#second', {
      parentState: '#main',
      initialSubstate: '#c'
    });
    
    this.sc.addState('#c', {
      parentState: '#second'
    });
    
    this.sc.addState('#d', {
      parentState: '#second'
    });
    
    this.sc.addState('#e', {
      parentState: '#second'
    });
    
    // Third parallel state & substates
    this.sc.addState('#third', {
      parentState: '#main',
      initialSubstate: '#f'
    });
    
    this.sc.addState('#f', {
      parentState: '#third'
    });
    
    this.sc.addState('#g', {
      parentState: '#third'
    });
    
    this.sc.addState('#h', {
      parentState: '#third'
    });
    
    
    // Other state that is NOT concurrent
    this.sc.addState('#other', {
      initialSubstate: '#i'
    });
    
    this.sc.addState('#i', {
      parentState: '#other',
      testEvent: function(){
        this.goToState({'#first': '#b', '#second': '#e'});
      }
    });
    
    this.sc.addState('#j', {
      parentState: '#other'
    });
    
    this.sc.initStates('#main');
  }
});

test("Is Initial State Correct?", function() {
  ok(this.sc.inState('#main'), "correctly in #main");
  ok(this.sc.inState('#first'), "correctly in #first");
  ok(this.sc.inState('#a'), "correctly in #a");
  ok(this.sc.inState('#second'), "correctly in #second");
  ok(this.sc.inState('#c'), "correctly in #c");
  ok(this.sc.inState('#third'), "correctly in #third");
  ok(this.sc.inState('#f'), "correctly in #f");
  // Testing the history states
  var state = this.sc.getState('#main');
  ok(typeof state.history !== 'string', "#main's history is an array");
  equal(state.history.length, 3, "#main's history has three states");
});

test("multi-state transition", function(){
  this.sc.sendEvent('testEvent');
  debugger;
  ok(this.sc.inState('#other'), "correctly in #other");
  ok(this.sc.inState('#i'), "correctly in #i");
  console.log('RIGHT BEFORE:');
  this.sc.sendEvent('testEvent');
  ok(this.sc.inState('#main'), "correctly in #main");
  ok(this.sc.inState('#first'), "correctly in #first");
  ok(this.sc.inState('#b'), "correctly in #b");
  debugger;
  ok(this.sc.inState('#second'), "correctly in #second");
  ok(this.sc.inState('#e'), "correctly in #e");
  ok(this.sc.inState('#third'), "correctly in #third");
  ok(this.sc.inState('#f'), "correctly in #f");
});