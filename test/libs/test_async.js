/*globals $ equal module expect myStatechart Stativus stop start asyncTest*/

module("Module: Simple Async", {
  setup: function(){
    this.sc = Stativus.createStatechart();
    this.data = 0;

   var that = this;

   this.sc.addState("#first", {
      enterState: function(){
        that.data += 1;
      },
      testEvent: function(){
        this.goToState('#second');
      }
    });

    this.sc.addState("#second", {
      willEnterState: function(done){
        window.setTimeout(done, 2000);
        return true;
      },
      
      enterState: function(){
        that.data += 1;
        equal(that.data, 2, "Data variable is incremented to 2" );
        var cStates = that.sc.currentState();
        equal(cStates.length, 1, "We have the correct number of current states" );
        equal(cStates[0].name, '#second', "we are currently in '#second'" );
        start();
      }
    });
  
  },

  teardown:function(){
    delete this.sc;
    delete this.sc;
    delete this.data;
  }


});

asyncTest("Check for enterState delay", function() {

  this.sc.initStates("#first");

  var cStates, state = this.sc.getState('#first');
  ok(state, "State exists...");
  equal(this.data, 1, "Current state '#first' has updated value correctly" );
  this.sc.sendEvent('testEvent');
  equal(this.data, 1, "Data variable is the same after exit from '#first'" );

});
  
