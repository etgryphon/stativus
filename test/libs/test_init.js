/*globals $ equal module expect myStatechart Statechart*/
var SC, stateTransitions;
var runInitTests = function(){
  
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
      sc.addState("#application", {
        substatesAreConcurrent: true
      });
      sc.addState("#subapplication", {
        parentState: "#application",
        substatesAreConcurrent: true
      });
  
      sc.addState("#first", {
        parentState: "#subapplication"
      });
  
      sc.addState("#second", {
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
  
  module("Module: Test Nested Initializations", {
    setup: function(){
      // Statechart with strings as substates
      var sc1 = Statechart.create();
      sc1.addState("#application", {
        initialSubstate: '#first',
        states: [ '#first', '#second' ]
      });
      sc1.initStates("#application");
      SC = [sc1];
      
      // statechart with hashs as substates
      var sc2 = Statechart.create();
      sc2.addState("#application", {
        initialSubstate: '#first',
        states: [ 
          { name: '#first'},
          { name: '#second'}
        ]
      });
      sc2.initStates("#application");
      SC.push(sc2);
      
      // statechart with arrays as substates
      var sameCode = {
        testEvent: function(){
          this.goToState({'#first': '#second', '#second': '#first'}[this.name]);
        }
      };
      var sc3 = Statechart.create();
      sc3.addState("#application", {
        initialSubstate: '#first',
        states: [ 
          ['#first', sameCode],
          ['#second', sameCode]
        ]
      });
      sc3.initStates("#application");
      SC.push(sc3);
    }
  });
  
  test("Test the state with string substates?", function() {
    var cStates, sc = SC[0], testNames = '#application,#first';
    cStates = sc.currentState();
    equals( cStates.length, 2, "In the Default State: there are 2 current states" );
    cStates.forEach( function(x){
      ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
    });
  });
  
  test("Test the state with object substates?", function() {
    var cStates, sc = SC[1], testNames = '#application,#first';
    cStates = sc.currentState();
    equals( cStates.length, 2, "In the Default State: there are 2 current states" );
    cStates.forEach( function(x){
      ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
    });
  });
  
  test("Test the state with array substates?", function() {
    var cStates, sc = SC[2], testNames = '#application,#first', testNames2 = '#application,#second';
    cStates = sc.currentState();
    equals( cStates.length, 2, "In the Default State: there are 2 current states" );
    cStates.forEach( function(x){
      ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
    });
    sc.sendEvent('testEvent');
    equals( cStates.length, 2, "In the Transitioned State: there are 2 current states" );
    cStates = sc.currentState();
    cStates.forEach( function(x){
      ok( testNames2.indexOf(x.name) > -1, "In the Transitioned State: there is current state named: "+x.name );
    });
  });
  
  
};
