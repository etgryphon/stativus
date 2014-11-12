module("Module: Test Statechart History", {
  setup: function(){
    
    this.sc = Stativus.createStatechart();
    this.sc.addState("parent", {
      substatesAreConcurrent: true
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
      initialSubstate: 'childB1',
      events:{
        "click #testButton":"gotoA2",
      },
        states:[
          {name:"childB1"},
          {name:"childB2",
            enterState:function(){
              ok(true, 'Entered childB2');
            },

            exitState: function(){
              ok(true, 'Exited childB2');
            }
          }
        ],

      exitState: function(){
          ok(true, 'Exited childB');
          start();
      }, 

      gotoA2:function(){
        this.goToHistoryState("childA2");
      }

    });
  }
});

asyncTest("Test to see if history state is calling exitState", function(){
  this.sc.initStates('parent');
  var state = this.sc.currentState()[0];
  state.goToState("childA2");
  state.goToState("childB2");
  state.goToHistoryState("childA");

});


asyncTest("Test to see if history state works inside an click event", function(){
  this.sc.initStates("default",'parent');
  var state = this.sc.currentState()[0];
  state.goToState("childA2");
  state.goToState("childB2");
  $("#testButton").click();

});
