/*globals $ equal module expect myStatechart*/
var runStateChartTests = function(){
  
  test("Is Statechart Initialization Correct?", function() {
    var cStates, sc = window.myStatechart, testNames = 'first.first.first,first.second.first';
    expect(3);
    cStates = sc.currentState();
    ok( cStates.length === 2, "In the Default State: there are 2 current states" );
    cStates.forEach( function(x){
      ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
    });
  });

  module("Module: Test Events");
  // 
  // TODO: write event code... 
  
  module("Module: Test Transitions");
  // 
  // TODO: Write transition tests 

  module("Module: Miscellaneous");
  // 
  // TODO: Write transition tests
};
