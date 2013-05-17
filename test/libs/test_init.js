/*globals $ equal module expect myStatechart Stativus*/

module("Module: Test Initialization", {
  setup: function(){
    this.sc = window.TestRunner.createDefaultStatechart();
  }
});

test("Is Statechart Initialization Correct?", function() {
  var cStates, testNames = 'first,first.first.first,first.second.first';
  expect(6);
  cStates = this.sc.currentState();
  equal( cStates.length, 5, "In the Default State: there are 5 current states" );
  cStates.forEach( function(x){
    ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
  });
});

module("Module: Test most basic initializations", {
  setup: function(){
    this.sc = Stativus.createStatechart();
    this.sc.addState('#application');
    this.sc.initStates("#application");
  }
});

test("Is Statechart Initialization Correct for single state w/ only a name?", function() {
  var cStates, testNames = '#application';
  expect(2);
  cStates = this.sc.currentState();
  equal( cStates.length, 1, "In the Default State: there are 1 current states" );
  cStates.forEach( function(x){
    ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
  });
});
  
module("Module: Test Edge Initializations", {
  setup: function(){
    this.sc = Stativus.createStatechart();
    this.sc.addState("#application", {
      substatesAreConcurrent: true
    });
    this.sc.addState("#subapplication", {
      parentState: "#application",
      substatesAreConcurrent: true
    });

    this.sc.addState("#first", {
      parentState: "#subapplication"
    });

    this.sc.addState("#second", {
      parentState: "#subapplication"
    });
    this.sc.initStates("#application");
  }
});

test("Is Statechart Initialization Correct for Single parallel concurrent substate?", function() {
  var cStates, testNames = '#application,#subapplication,#first,#second';
  expect(5);
  cStates = this.sc.currentState();
  equal( cStates.length, 4, "In the Default State: there are 4 current states" );
  cStates.forEach( function(x){
    ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
  });
});  

module("Module: Test Nested Initializations", {
  setup: function(){    
    this.statecharts = [];  
    // statechart with hashs as substates
    var sc1 = Stativus.createStatechart();
    sc1.addState("#application", {
      initialSubstate: '#first',
      states: [ 
        { name: '#first'},
        { name: '#second'}
      ]
    });

    sc1.initStates("#application");
    this.statecharts.push(sc1);
    
    // statechart with arrays as substates
    var sameCode = {
      testEvent: function(){
        this.goToState({'#first': '#second', '#second': '#first'}[this.name]);
      }
    };
    var sc2 = Stativus.createStatechart();
    sc2.addState("#application", {
      initialSubstate: '#first',
      states: [ 
        ['#first', sameCode],
        ['#second', sameCode]
      ]
    });
    sc2.initStates("#application");
    this.statecharts.push(sc2);
  }
});
  
test("Test the state with object substates?", function() {
  var cStates, sc = this.statecharts[0], testNames = '#application,#first';
  cStates = sc.currentState();
  equal( cStates.length, 2, "In the Default State: there are 2 current states" );
  cStates.forEach( function(x){
    ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
  });
});

test("Test the state with array substates?", function() {
  var cStates, sc = this.statecharts[1], testNames = '#application,#first', testNames2 = '#application,#second';
  cStates = sc.currentState();
  equal( cStates.length, 2, "In the Default State: there are 2 current states" );
  cStates.forEach( function(x){
    ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
  });
  sc.sendEvent('testEvent');
  equal( cStates.length, 2, "In the Transitioned State: there are 2 current states" );
  cStates = sc.currentState();
  cStates.forEach( function(x){
    ok( testNames2.indexOf(x.name) > -1, "In the Transitioned State: there is current state named: "+x.name );
  });
});

module("Module: Test Advanced Nested Initializations", {
  setup: function(){      
    // statechart with hashs as substates
    this.sc = Stativus.createStatechart();
    this.sc.addState("#application", {
      initialSubstate: '#first',
      states: [ 
        { 
          name: '#first',
          initialSubstate: '#first.first',
          states: [
            { name: '#first.first'},
            { name: '#first.second'}
          ]
        },
        { name: '#second'}
      ]
    });
    this.sc.initStates("#application");
  }
});

test("Test the state with advanced object substates?", function() {
  var cStates, testNames = '#application,#first,#first.first';
  expect(4);
  cStates = this.sc.currentState();
  equal( cStates.length, 3, "In the Default State: there are 3 current states" );
  cStates.forEach( function(x){
    ok( testNames.indexOf(x.name) > -1, "In the Default State: there is current state named: "+x.name );
  });
});

