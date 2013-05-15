/*globals $ equal module expect myStatechart Stativus*/
var SC, activeState = {};
var runGoToStateTests = function(){

  module("Module: Test historyState", {
    setup: function() {
      function createState(hash) {
        hash.enterState = function() {
          activeState[this.name] = true;
        };
        hash.exitState - function() {
          activeState[this.name] = false;
        };
        return hash;
      }

      var sc = Stativus.createStatechart();
      sc.addState("A", createState({
        initialSubstate: "B",
        states: [
          createState({ name: "B"}),
          createState({ name: "C"})
        ]
      }));
      sc.addState("D", createState({
        substatesAreConcurrent: true,
        states: [
          createState({ 
            name: "E",
            initialSubstate: "F",
            states: [
              createState({ name: "F" }),
              createState({ name: "G" })
            ]
          }),
          createState({
            name: "H",
            initialSubstate: "I",
            states: [
              createState({ name: "I" }),
              createState({ name: "J" })
            ]
          })
        ]
      }));
      sc.initStates('A');
      SC = sc;
    }
  });

  test("Is current state B?", function() {
    ok(activeState.B, "one of the states is state B");
  });

  test("Does return to C after changing to D?", function() {
    SC.goToState('C', Stativus.DEFAULT_TREE);
    SC.goToState('D', Stativus.DEFAULT_TREE);
    SC.goToHistoryState('A', Stativus.DEFAULT_TREE, true);
    ok(activeState.C, "one of the states is state C");
  });

  test("Does return to J, G after changing to A?", function() {
    SC.goToState('J', Stativus.DEFAULT_TREE);
    SC.goToState('G', Stativus.DEFAULT_TREE);
    SC.goToState('A', Stativus.DEFAULT_TREE);
    SC.goToHistoryState('D', Stativus.DEFAULT_TREE, true);
    ok(activeState.J, "one of the states is state J");
    ok(activeState.G, "one of the states is state G");
  });
};
