/*globals $ equal module expect myStatechart Statechart*/
var SC;
var runStateChartTests = function(){
  
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
      var docEnter = {
        enterState: function() {
            console.log("Enter State: " + this.name);
        },
        exitState: function() {
            console.log("Enter State: " + this.name);
        }
      };
      sc.addState("#application", docEnter, {
        substatesAreConcurrent: true
      });
      sc.addState("#subapplication", docEnter, { // This state isn't entered
        parentState: "#application",
        substatesAreConcurrent: true
      });
  
      sc.addState("#first", docEnter, {
        parentState: "#subapplication"
      });
  
      sc.addState("#second", docEnter, {
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
  
  module("Module: Test Events", {
    setup: function(){
      var tr = window.TestRunner;
      SC = tr.createDefaultStatechart();
    }
  });
  
  test("Is Event Propigation stops on true return?", function() {
    expect(5);
    
  });
  
  module("Module: Test Transitions");
  // 
  // TODO: Write transition tests 

  module("Module: Miscellaneous");
  // 
  // TODO: Write transition tests
};
