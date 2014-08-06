module("Module: Test Statechart History", {
  setup: function(){
    
    this.sc = Stativus.createStatechart();
    this.sc.addState("parent", {
      initialSubstate: 'childA'
    });

    this.sc.addState("childA", {
      parentState:"parent",
      initialSubstate: 'childA1',
        states:[
          {name:"childA1"},
          {name:"childA2",
            enterState:function(){
              ok(true, 'Entered childA2');
            }
          }
        ]
    });

    this.sc.addState("childB", {
      parentState:"parent",

      exitState: function(){
          ok(true, 'Exited childB');
          start();
      }
    });
  }
});

asyncTest("Test to see if history state is calling exitState", function(){
  this.sc.initStates('parent');
  var state = this.sc.currentState()[0];
  state.goToState("childA2");
  state.goToState("childB");
  state.goToHistoryState("childA");

});