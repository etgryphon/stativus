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
};
