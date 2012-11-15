interface StateDefinition {
  globalConcurrentState?: String;
  name: String;
  enterState?: () => any;
  exitState?: () => any;
  states?: any;
  // not sure why this does not work for me :)
  // initialSubstate?: String;
}

interface Stativus {
  addState(StateDefinition);
}

interface StativusStatic {
  createStatechart():Stativus;
}

declare var Stativus : StativusStatic
