/*globals Stativus:true, exports, $, createNode*/

/**
  This is the code for creating statecharts in your javascript files

  @author: Evin Grano
*/


var jQueryIsLoaded=false;
try {
  if (jQuery) jQueryIsLoaded=true;
}
catch(err){
  jQueryIsLoaded=false;
}

/** #preserve #license
==========================================================================
Statechart -- A Micro Library
Copyright: ©2011-2017 Evin Grano All rights reserved.
          Portions ©2011-2017 Evin Grano, and contributors

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software and the Software is used
for Good, and not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

For more information about Statechart, visit http://www.itsgotwhatplanscrave.com

==========================================================================
*/
var creator = function(){
  function F() {}
  F.prototype = this;
  return new F();
};

// helper function for merging in properties
var merge = function(obj, configs){
  obj = obj || {};
  configs = configs || [];
  configs.forEach( function(x){
    if (typeof x === 'object'){
      for (var k in x){
        if(x.hasOwnProperty(k)) obj[k] = x[k];
      }
    }
  });

  return obj;
};

Stativus = { DEFAULT_TREE: 'default', SUBSTATE_DELIM: 'SUBSTATE:', version: '1.0.0' };

// This creates the Debug object that is used to output statements
// ******************
// State Object
// ******************
Stativus.State = {

  // walk like a duck
  isState: true,

  _data: null,

  _isNone: function(value){
    return (value === undefined || value === null);
  },

  goToState: function(name, data){
    var sc = this.statechart;
    if (sc){ sc.goToState(name, this.globalConcurrentState, this.localConcurrentState, data); }
  },

  goToHistoryState: function(name, isRecursive){
    var sc = this.statechart;
    if (sc){ sc.goToHistoryState(name, this.globalConcurrentState, this.localConcurrentState, isRecursive); }
  },

  sendEvent: function(evt){
    var sc = this.statechart;
    if (sc){ sc.sendEvent.apply(sc, arguments); }
  },
  sendAction: function(evt){
    return this.sendEvent.apply(this, arguments);
  },

  getData: function(key){
    if (this._isNone(key)) return key;
    var sc = this.statechart, ret = this._data[key];
    if (this._isNone(ret)) ret = sc.getData(key, this.parentState, this.globalConcurrentState);
    return ret;
  },

  setData: function(key, value){
    if (this._isNone(key)) return value;
    this._data[key] = value;
  },

  removeData: function(key){
    if (this._isNone(key)) return key;
    var sc = this.statechart, ret = this._data[key];
    if (this._isNone(ret)) {
      sc.removeData(key, this.parentState, this.globalConcurrentState);
    } else delete this._data[key];
  },

  setHistoryState: function(state){
    this.history = this.substatesAreConcurrent ? this.substates : state.name;
  },

  _parseAndHandleEvents: function(events, remove) {
    var sc = this.statechart, that = this;

    function addEvent(evt, sel, fire) {
      if (sel) {
        jQuery('body').on(evt, sel, function (ev) { sc.sendEvent(fire, ev); });
      }
      else {
        jQuery('body').on(evt, function (ev) { sc.sendEvent(fire, ev); });
      }
    }

    function removeEvent(evt, sel) {
      if (sel) {
        jQuery('body').off(evt, sel);
      }
      else {
        jQuery('body').off(evt);
      }
    }

    for (var key in events) {
      if (events.hasOwnProperty(key)) {
        var split, evt, selector, toFire;
        split    = key.split(' ');
        evt      = split[0];

        // allow for complex paths
        // 'change #foo .bar select'
        selector = key.replace(evt,"");
        toFire   = events[key];
        if(remove) removeEvent(evt, selector);
        else addEvent(evt, selector, toFire);
      }
    }
  },

  _bindEvents: function() {
    var prop = this.events || this.actions;
    if (prop) {
      this._parseAndHandleEvents(prop);
    }
  },

  _unBindEvents: function() {
    var prop = this.events || this.actions;
    if (prop) {
      this._parseAndHandleEvents(prop, true);
    }
  }
};
// Our Maker function:  Thank you D.Crockford.
Stativus.State.create = function (config, sc) {
  var nState, k, i, len, configs = [config],
      key = config.name+'_'+config.globalConcurrentState,
      waitingConfig = sc._configs_in_waiting[key];
  nState = creator.call(this);
  nState._data = {};
  if (waitingConfig) configs.push(waitingConfig);
  return merge(nState, configs);
};

/**
  Statechart functionality...
  TODO: Document more...
*/
Stativus.Statechart = {

  create: function(config){
    var sc = creator.call(this);

    // config all the internal information
    sc.isStatechart = true;
    sc._all_states = {};
    sc._all_states[Stativus.DEFAULT_TREE] = {};
    sc._states_with_concurrent_substates = {};
    sc._current_subtrees = {};
    sc._current_state = {};
    sc._current_state[Stativus.DEFAULT_TREE] = null;
    sc._goToStateLocked = false;
    sc._sendEventLocked = false;
    sc._pendingStateTransitions = [];
    sc._pendingEvents = [];
    sc._active_subtrees = {};
    sc._configs_in_waiting = {};
    sc._paused_transition_states = {};

    return sc;
  },

  addState: function(name){
    var tree, obj, hasConcurrentSubstates = false, pState, pName, states,
        cTree, nState, config, configs = [], len, i, that = this, key, treeObj;

    for(i = 1, len = arguments.length; i < len; i++){
      configs[i-1] = config = arguments[i];
      hasConcurrentSubstates = hasConcurrentSubstates || !!config.substatesAreConcurrent;
      tree = tree || config.globalConcurrentState;
      pName = pName || config.parentState;
    }
    tree = tree || Stativus.DEFAULT_TREE;
    config = len === 1 ? {} : merge(null, configs);
    // primary config is always the last config
    config.name = name;
    config.statechart = this;

    config.globalConcurrentState = tree;

    // Concurrent Substate checks:
    // Do i have substates?
    cTree = this._states_with_concurrent_substates[tree];
    if (hasConcurrentSubstates){
      obj = this._states_with_concurrent_substates[tree] || {};
      obj[name] = true;
      this._states_with_concurrent_substates[tree] = obj;
    }
    // Am I a substate of any parent State?
    if (pName){
      treeObj = this._all_states[tree];
      pState = treeObj && treeObj[pName];
      if(!pState) {
        key = pName+'_'+tree;
        this._configs_in_waiting[key] = pState = this._configs_in_waiting[key] || {};
      }
      pState.substates = pState.substates || [];
      pState.substates.push(name);
    }

    nState = Stativus.State.create(config, this);

    // Actually add the state to our statechart
    obj = this._all_states[tree] || {};
    obj[name] = nState;
    this._all_states[tree] = obj;
    nState._beenAdded = true;

    // Code to get the substates and add them.
    states = nState.states || [];
    states.forEach( function(x, idx){
      var args = [], good = false, last;
      if(typeof x === 'object' && x.length > 0){
        args = args.concat(x);
        good = true;
      }
      else if(typeof x === 'string'){
        args.push(x);
        good = true;
      }
      else if (typeof x === 'object'){
        args.push(x.name);
        args.push(x);
        good = true;
      }
      if (good){
        // add missing config parts to the last element.
        last = args.length-1;
        args[last].parentState = name;
        args[last].globalConcurrentState = tree;
        that.addState.apply(that, args);
      }
    });

    return this;
  },

  initStates: function(init){
    var x, state;
    this._inInitialSetup = true;
    if ( typeof init === 'string'){
      this.goToState(init, Stativus.DEFAULT_TREE);
    }
    else if ( typeof init === 'object'){
      for( x in init){
        if (init.hasOwnProperty(x)){
          state = init[x];
          this.goToState(state, x);
        }
      }
    }
    this._inInitialSetup = false;
    this._flushPendingEvents();

    return this;
  },

  goToState: function(requestedState, tree, localConcurrentState, data){
    var cState, allStates = this._all_states[tree], idx, len,
        enterStates = [], exitStates = [], haveExited, indexes, that,
        reqState, pState, i, substateTree, t,
        enterStateHandled, exitStateHandled, substates;


    // First, find the current tree off of the localConcurrentState, then the main tree
    cState = (localConcurrentState && this._current_state[localConcurrentState]) || this._current_state[tree];
    t = typeof requestedState;
    if (t === 'object'){
      reqState = this._compileStateTransitions(requestedState, allStates);
    } else if (t === 'string'){
      reqState = allStates[requestedState];
    } else {
      return;
    }


    // if the current state is the same as the requested state do nothing
    if (this._checkAllCurrentStates(reqState, localConcurrentState || tree)) return;

    this._setDataOnState(reqState, data);

    if (this._goToStateLocked){
      // There is a state transition currently happening. Add this requested
      // state transition to the queue of pending state transitions. The req
      // will be invoked after the current state transition is finished
      this._pendingStateTransitions.push({
        requestedState: requestedState,
        tree: tree,
        localConcurrentState: localConcurrentState
      });

      return;
    }

    // Lock for the current state transition, so that it all gets sorted out
    // in the right order
    this._goToStateLocked = true;

    // Get the parent states for the current state and the registered state.
    // we will use them to find the commen parent state
    enterStates = this._parentStatesWithRoot(reqState);
    exitStates = cState ? this._parentStatesWithRoot(cState) : [];
    indexes = this._findCommonAncestor(exitStates, enterStates);

    // Setup for the enter state sequence
    this._enterStates = enterStates;
    this._enterStateMatchIndex = indexes.second;
    this._enterStateTree = tree;

    // Now, we will exit all the underlying states till we reach the common
    // parent state. We do not exit the parent state because we transition
    // within it.
    this._exitStateStack = [];
    for (i = 0; i < indexes.first; i+=1){
      cState = exitStates[i];
      if (cState.substatesAreConcurrent) this._fullExitFromSubstates(tree, cState);
      this._exitStateStack.push(cState);
    }

    // Now, that we have the full stack of states to exit
    // We can exit them in an orderly fashion.
    this._unwindExitStateStack();
  },

  // Common Ancestor function:
  // continue by finding the common parent state for the current and
  // requested states:
  //
  // At most, this takes O(m^2) time, where m is the maximum depth from the
  // root of the tree to either the requested state or the current state.
  // Will always be less than or equal to O(n^2), where n is the number
  // of states in the tree
  _findCommonAncestor: function(set1, set2){
    var idx, len, set1Idx, set2Idx = -1;

    for (idx = 0, len = set1.length; idx < len; idx++){
      set1Idx = idx;
      set2Idx = set2.indexOf(set1[idx]);
      if(set2Idx >= 0) break;
    }

    // In the case where we don't find a common parent state, we
    // must enter from the root state
    if (set2Idx < 0) set2Idx = set2.length - 1;

    return {first: set1Idx, second: set2Idx};
  },

  _compileStateTransitions: function(stateTransitionObj, allStates){
    var key, curr, ret, indexes,
        retStates, currStates, pivot,
        firstTime = true;
    for(key in stateTransitionObj){
      if (stateTransitionObj.hasOwnProperty(key)){
        curr = stateTransitionObj[key];
        if (firstTime){
          ret = allStates[curr];
          retStates = this._parentStates(ret);
          firstTime = false;
        } else {
          currStates = this._parentStates(allStates[curr]);
          indexes = this._findCommonAncestor(retStates, currStates);

          // if we can't find a common ancestor then we have a violation of the statechart
          if (indexes.second < 0){
            continue;
          }

          // check to see if the common ancestor has concurrent substates because
          // we need to pause transition on the parent state
          pivot = currStates[indexes.second];
          if (!pivot.substatesAreConcurrent){
            continue;
          }
          pivot = currStates[indexes.second-1];
          // now we take the top most concurrent substate and pause it in transition
          // we will catch it on the next round of transition...
          if(pivot){
            this._paused_transition_states = this._paused_transition_states || {};
            this._paused_transition_states[pivot.name] = (this._paused_transition_states[pivot.name] || 0) + 1;
            this._pendingStateTransitions.push({
              requestedState: curr,
              tree: pivot.globalConcurrentState,
              localConcurrentState: pivot.localConcurrentState
            });
          }
        }

      }
    }
    return ret;
  },

  goToHistoryState: function(requestedState, tree, localConcurrentState, isRecursive){
    var allStatesForTree = this._all_states[tree],
        pState, realHistoryState;
    pState = allStatesForTree[requestedState];
    if (pState) realHistoryState = pState.history || pState.initialSubstate;

    if(!realHistoryState){
      realHistoryState = requestedState;
    }
    else if (isRecursive){
      this.goToHistoryState(realHistoryState, tree, isRecursive);
      return;
    }
    this.goToState(realHistoryState, tree);
  },

  currentState: function(tree){
    var ret, tmp, sTree, aTrees, bTree, cStates = this._current_state,
        cState, i, len, state, ps, aStates;
    tree = tree || 'default';
    cState = cStates[tree];
    aStates = this._all_states[tree];

    // now add all the parents of the current state...
    if (cState && cState.isState){
      ret = this._parentStates(cState);
    }

    // Now see if it has substates...
    if (cState && cState.substatesAreConcurrent){
      aTrees = this._active_subtrees[tree] || [];
      for(i = 0, len = aTrees.length; i < len; i++){
        sTree = aTrees[i];
        state = cStates[sTree];
        if(state) ps = aStates[state.parentState];
        if (ps && ret.indexOf(ps) < 0) ret.unshift(ps);
        if (state && ret.indexOf(state) < 0) ret.unshift(state);
      }
    }
    return ret;
  },

  sendEvent: function(evt){
    var args = [], len = arguments.length, i;

    if (len < 1) return;
    for(i = 1; i < len; i++){
      args[i-1] = arguments[i];
    }

    try {
      if (this._inInitialSetup || this._sendEventLocked || this._goToStateLocked){
        // We want to prevent any events from occurring until
        // we have completed the state transitions and events
        this._pendingEvents.push({
          evt: evt,
          args: args
        });

        return;
      }
      this._sendEventLocked = true;

      // function that processes the event, diff for testing v. production
      this._processEvent(evt, args);

    } catch(err) {
      this._restartEvents();
      throw err;
    }

    this._restartEvents();
  },

  _setDataOnState: function(state, data){
    if (state && typeof data !== 'undefined' && data !== null) {
      if (typeof data === 'string') state.setData(data, data);
      if (typeof data === 'object') {
        for (var key in data) {
          if(data.hasOwnProperty(key)) state.setData(key, data[key]);
        }
      }
    }
  },

  _processEvent: function(evt, args){
    this._structureCrawl('_cascadeEvents', evt, args);
  },

  getData: function(key, stateName, tree){
    var allStates = this._all_states[tree], state;
    if (!allStates) return null;
    state = allStates[stateName];
    if (state && state.isState) return state.getData(key);
  },

  removeData: function(key, statename, tree){
    var allStates = this._all_states[tree], state;
    if (!allStates) return null;
    state = allStates[statename];
    if (state && state.isState) return state.removeData(key);
  },

  getState: function(name, tree){
    var allStates, ret;
    tree = tree || Stativus.DEFAULT_TREE;
    allStates = this._all_states[tree];
    if (!allStates) return null;
    ret = allStates[name];
    return ret;
  },

  _restartEvents: function(){
    // Now, that the states have a chance to process the first action
    // we can go ahead and flush the queued events
    this._sendEventLocked = false;
    if (!this._inInitialSetup) this._flushPendingEvents();
  },

  _structureCrawl: function(func, evt, args){
    var tree, currentStates = this._current_state, i, len, sResponder, tmp,
        allStates, responder, aTrees, sTree, handled, found, ss = Stativus.SUBSTATE_DELIM;
    for(tree in currentStates){
      if(currentStates.hasOwnProperty(tree)) {

        handled = false;
        sTree = null;
        responder = currentStates[tree];
        if (!responder || tree.slice(0, ss.length) === ss) continue;
        // if we don't have an all state tree then we know that this is a substate tree
        allStates = this._all_states[tree];
        if(!allStates) continue;
        aTrees = this._active_subtrees[tree] || [];
        for(i = 0, len = aTrees.length; i < len; i++){
          sTree = aTrees[i];
          sResponder = currentStates[sTree];
          tmp = handled ? [true, true] : this[func](evt, args, sResponder, allStates, sTree);
          handled = tmp[0];
        }
        if (!handled) {
          tmp = this[func](evt, args, responder, allStates, null);
          handled = tmp[0];
        }
      }
    }
  },

  /**
    @private
    name: _cascadeEvents
  */
  _cascadeEvents: function(evt, args, responder, allStates, tree){
    var handled, ssName, found = false, func;

    // substate prep work...
    ssName = this._splitConcurrencyKey(tree);

    while(!handled && responder){
      func = responder[evt];
      if (func){
        try {
          handled = func.apply(responder, args);
        } catch(e){
        }
        found = true;
      }
      // check to see if we have reached the end of this tree
      if (tree && ssName === responder.name) return [handled, found];
      responder = !handled && responder.parentState ? allStates[responder.parentState] : null ;
    }

    return [handled, found];
  },

  _checkAllCurrentStates: function(reqState, tree){
    var currentStates = this.currentState(tree) || [];
    if (currentStates === reqState) return true;
    else if (typeof currentStates === 'string' && reqState === this._all_states[tree][currentStates]) return true;
    else if (currentStates.indexOf && currentStates.indexOf(reqState) > -1) return true;
    else return false;
  },

  _flushPendingEvents: function(){
    var args, pa = this._pendingEvents.shift();
    if(!pa) return;
    args = pa.args;
    args.unshift(pa.evt);
    this.sendEvent.apply(this, args);
  },

  _flushPendingStateTransitions: function(){
    var pending = this._pendingStateTransitions.shift(), msg;
    if (!pending) return false;
    this.goToState(pending.requestedState, pending.tree, pending.localConcurrentState);
    return true;
  },

  _fullEnter: function(state){
    var pState, tree, enterStateHandled = false;
    if (!state) return;
    this._addActiveConcurrentSubstate(state, state.localConcurrentState);
    tree = state.localConcurrentState || state.globalConcurrentState;
    this._current_state[tree] = state;
    try {
      if (state.enterState) state.enterState();
      if (state.didEnterState) state.didEnterState();
      if (jQueryIsLoaded && (state.actions || state.events)) state._bindEvents();
    } catch(e){
    }
    if (state.parentState) {
      pState = state.statechart.getState(state.parentState, state.globalConcurrentState);
      pState.setHistoryState(state);
    }
    this._unwindEnterStateStack();
  },


  _fullExit: function(state){
    var pState, tree, key;
    if (!state) return;
    var exitStateHandled = false;
    try {
      if (jQueryIsLoaded && (state.actions || state.events)) state._unBindEvents();
      if (state.exitState) state.exitState();
      if (state.didExitState) state.didExitState();

      // check to see if we are in a concurrent substate and if we are the defined
      // state then delete the item else set the parent to the current state
      // debugger;
      tree = state.localConcurrentState || state.globalConcurrentState;
      key = this._splitConcurrencyKey(tree);
      if (key === state.name) {
        delete this._current_state[tree];
      } else {
        this._current_state[tree] = this._all_states[state.globalConcurrentState][state.parentState];
      }
    } catch (e){
    }
    this._unwindExitStateStack();
  },

  _initiateEnterStateSequence: function(){
    var enterStates, enterMatchIndex, concurrentTree, tree,
        allStates, i, cState;

    enterStates = this._enterStates;
    enterMatchIndex = this._enterStateMatchIndex;
    tree = this._enterStateTree;
    allStates = this._all_states[tree];

    // Initialize the Enter State Stack
    this._enterStateStack = this._enterStateStack || [];

    // Finally, from the common parent state, but not including the parent state,
    // enter the sub states down to the requested state. If the requested state
    // has an initial sub state, then we must enter it too
    i = enterMatchIndex-1;
    cState = enterStates[i];
    tree = this._getValidLocalConcurrentState(cState) || tree;
    if (cState) this._cascadeEnterSubstates(cState, enterStates.slice(0, enterMatchIndex), i-1, tree, allStates);

    // once, we have fully hydrated the Enter State Stack, we must actually async unwind it
    this._unwindEnterStateStack();

    // Cleanup
    enterStates = null;
    enterMatchIndex = null;
    concurrentTree = null;
    tree = null;

    delete this._enterStates;
    delete this._enterStateMatchIndex;
    delete this._enterStateTree;
  },

  _cascadeEnterSubstates: function(start, requiredStates, index, tree, allStates){
    var cState, pState, subStates, that = this, newReqStates,
        nTree, bTree, name, currStates, aTrees, nTreeBase;

    if (!start || that._checkIfPausedState(start)) return;

    name = start.name;
    this._enterStateStack.push(start);
    start.localConcurrentState = tree;
    if (start.substatesAreConcurrent){
      tree = start.globalConcurrentState || Stativus.DEFAULT_TREE;
      nTreeBase = [Stativus.SUBSTATE_DELIM,tree,name].join('=>');
      subStates = start.substates || [];
      subStates.forEach( function(x){
        cState = allStates[x];

        // check to see if this state is on the paused list
        // if, yes, then decrement the list count
        if(that._checkIfPausedState(cState)) return;

        // Now, we have to push the item onto the active subtrees for
        // the base tree for later use of the events.
        nTree = nTreeBase+'=>'+x;
        // that._addActiveConcurrentSubstate(cState, nTree);

        // If we have required states and we are in the middle of them
        // check to see if we are on the required list and decrement the
        // index and use the required list of states
        if (index > -1 && requiredStates[index] === cState){
          index = index - 1;
          newReqStates = requiredStates;
        // if we are in one of the other substates we *don't* have any
        // required states so we must zero it out and just flow naturally
        // through the initialSubstates.
        } else {
          newReqStates = [];
        }
        that._cascadeEnterSubstates(cState, newReqStates, index, nTree, allStates);
      });
      return;
    }
    else {
      // now we can trigger the lower levels of the state
      cState = requiredStates[index];
      if (cState){
        if (index > -1 && requiredStates[index] === cState) index = index - 1;
        this._cascadeEnterSubstates( cState, requiredStates, index, tree, allStates);
      }
      // now we will go into the initial substates of this state
      else {
        cState = allStates[start.initialSubstate];
        this._cascadeEnterSubstates( cState, requiredStates, index, tree, allStates);
      }
    }
  },

  _addActiveConcurrentSubstate: function(state, localConcurrentKey){
    var gTree, aTrees;
    if(!localConcurrentKey || state.globalConcurrentState === localConcurrentKey) return;
    gTree = state.globalConcurrentState || Stativus.DEFAULT_TREE;
    aTrees = this._active_subtrees[gTree] || [];
    if (aTrees.indexOf(localConcurrentKey) < 0){
      aTrees.unshift(localConcurrentKey);
      this._active_subtrees[gTree] = aTrees;
    }
  },

  _checkIfPausedState: function(state){
    // check to see if this state is on the paused list
    // if, yes, then decrement the list count
    if(this._paused_transition_states[state.name]){
      this._paused_transition_states[state.name] = this._paused_transition_states[state.name]-1;
      return true;
    }
    return false;
  },

  _fullExitFromSubstates: function(tree, stopState){
    var cStates, allStates, func, that = this;
    if (!tree || !stopState || !tree || !stopState.substates) return;

    allStates = this._all_states[tree];
    cStates = this._current_state;
    this._exitStateStack = this._exitStateStack || [];

    stopState.substates.forEach( function(state){
      var substateTree, currState, curr, exitStateHandled, aTrees;
      substateTree = [Stativus.SUBSTATE_DELIM, tree, stopState.name, state].join('=>');
      currState = cStates[substateTree];
      while(currState && currState !== stopState){
        exitStateHandled = false;
        if (!currState) continue;
        if (that._exitStateStack.indexOf(currState) < 0){
          that._exitStateStack.push(currState);

          // check to see if it has substates
          if(currState.substatesAreConcurrent) that._fullExitFromSubstates(tree, currState);
        }
        curr = currState.parentState;
        currState = allStates[curr];
      }

      // Now, remove this from the active substate tree
      that._active_subtrees[tree] = that._removeFromActiveTree(tree, substateTree);
    });
  },

  // @private
  // this function unwinds the next item on the exitStateStack...
  _unwindExitStateStack: function(){
    var stateToExit, delayForAsync = false, stateRestart, sc = this;
    this._exitStateStack = this._exitStateStack || [];
    stateToExit = this._exitStateStack.shift();
    if(stateToExit){
      if (stateToExit.willExitState) {
        // Now for some amazing encapsulation magic with closures
        // We are going to create a temporary object that gets passed
        // into the willExitState call that will restart the state
        // exit for this path as needed
        stateRestart = function(){
          if (sc) sc._fullExit(stateToExit);
        };
        delayForAsync = stateToExit.willExitState(stateRestart);
      }
      if (!delayForAsync) this._fullExit(stateToExit);
    }
    else {
      delete this._exitStateStack;
      this._initiateEnterStateSequence();
    }
  },

  // @private
  // this function unwinds the next item on the enterStateStack...
  _unwindEnterStateStack: function(){
    this._exitStateStack = this._exitStateStack || [];
    var stateToEnter, delayForAsync = false, stateRestart, more, sc = this;
    stateToEnter = this._enterStateStack.shift();
    if(stateToEnter){
      if (stateToEnter.willEnterState) {
        // Now for some amazing encapsulation magic with closures
        // We are going to create a temporary object that gets passed
        // into the willExitState call that will restart the state
        // exit for this path as needed
        stateRestart = function(){
          if (sc) sc._fullEnter(stateToEnter);
        };
        delayForAsync = stateToEnter.willEnterState(stateRestart);
      }
      if (!delayForAsync) this._fullEnter(stateToEnter);
    }
    else {
      delete this._enterStateStack;

      // Ok, we're done with the current state transition. Make sure to unlock
      // the goToState and let other pending state transitions
      this._goToStateLocked = false;
      more = this._flushPendingStateTransitions();
      if (!more && !this._inInitialSetup) {
        // Once pending state transitions are flushed then go ahead and start flush
        // pending actions
        this._flushPendingEvents();
      }
    }
  },

  // TODO: make this more efficient
  _removeFromActiveTree: function(baseTree, tree){
    var nArray = [], aTrees = this._active_subtrees[baseTree];
    if (!aTrees) return [];
    if (!tree) return aTrees;

    aTrees.forEach( function(x){
      if(x !== tree) nArray.push(x);
    });

    return nArray;
  },

  _parentStateObject: function(name, tree){
    if(name && tree && this._all_states[tree]){
      return this._all_states[tree][name];
    }
  },

  _parentStates: function(state){
    var ret = [], curr = state;
    // always add first state
    ret.push(curr);
    curr = this._parentStateObject(curr.parentState, curr.globalConcurrentState);

    while(curr){
      ret.push(curr);
      curr = this._parentStateObject(curr.parentState, curr.globalConcurrentState);
    }
    return ret;
  },

  _parentStatesWithRoot: function(state){
    var ret = this._parentStates(state);
    ret.push('root');
    return ret;
  },

  _splitConcurrencyKey: function(key){
    var ret, len, keys;
    if (key){
      keys = key.split('=>');
      len = keys.length || 0;
      ret = keys[len-1];
    }
    return ret;
  },

  _getValidLocalConcurrentState: function(state, allStates){
    if (!state) return;
    allStates = allStates || this._all_states[state.globalConcurrentState];
    return state.localConcurrentState || this._getValidLocalConcurrentState(allStates[state.parentState], allStates);
  }

};

Stativus.createStatechart = function(){ return this.Statechart.create(); };

// TODO:  Work on AMD Loading...
if (typeof window !== "undefined") {
  window.Stativus = Stativus;
} else if (typeof exports !== "undefined") {
  module.exports = Stativus;
}
