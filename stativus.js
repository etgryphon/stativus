/*globals Stativus DEBUG_MODE EVENTABLE COLOR_MODE EVENT_COLOR EXIT_COLOR ENTER_COLOR exports $ */
/*
==========================================================================
Statechart -- A Micro Library
Copyright: ©2011-2013 Evin Grano All rights reserved.
          Portions ©2011-2013 Evin Grano

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

/**
  This is the code for creating statecharts in your javascript files
  
  @author: Evin Grano
  @version: 0.8.0
*/
if (typeof DEBUG_MODE === "undefined"){
  DEBUG_MODE = true;
  COLOR_MODE = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if (COLOR_MODE) {
    EVENT_COLOR = "#CC00FF";
    ENTER_COLOR = "#009900";
    EXIT_COLOR = "#880000";
  }
}

// Pre-processor for eventable code
if (typeof EVENTABLE === "undefined"){
  EVENTABLE = true;
}

// Helper function for creating prototypical objects...
var creator = function(){
  function F() {}
  F.prototype = this;
  return new F();
};

// helper function for merging in properties
var merge = function(obj, configs){
  var config, i, len, k;
  obj = obj || {};
  for (i = 1, len = configs.length || 0; i < len; i++){
    config = configs[i];
    if (typeof config === 'object'){
      for (k in config){ 
        if(config.hasOwnProperty(k)) obj[k] = config[k]; 
      }
    }
  }
  
  return obj;
};

Stativus = { DEFAULT_TREE: 'default', SUBSTATE_DELIM: 'SUBSTATE:', version: '0.8.0' };

// This creates the Debug object that is used to output statements
if(DEBUG_MODE){
  Stativus.DebugMessagingObject = {
    
    level: 0,
    
    _buildOutput: function(type, state, details, tree){
      tree = tree || Stativus.DEFAULT_TREE;
      var msg = "Global::["+tree+"] ";
      msg = msg + "=> State::["+state+"]: ";
      msg = msg + '{'+type+'} > '+details;
      return msg;
    },
    
    sendLog: function(type, state, details, tree){
      if (this.level > 0) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.log(msg);
      return msg;
    },
    
    sendInfo: function(type, state, details, tree){
      if (this.level > 1) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.info(msg);
      return msg;
    },
    
    sendWarn: function(type, state, details, tree){
      if (this.level > 2) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.error(msg);
      return msg;
    },
    
    sendError: function(type, state, details, tree){
      if (this.level > 3) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.error(msg);
      return msg;
    }
  };
}
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
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot goToState cause state doesnt have a statechart'; }
    }
  },
  
  goToHistoryState: function(name, isRecursive){
    var sc = this.statechart;
    if (sc){ sc.goToHistoryState(name, this.globalConcurrentState, this.localConcurrentState, isRecursive); }
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot goToState cause state doesnt have a statechart'; }
    }
  },
  
  sendEvent: function(evt){
    var sc = this.statechart;
    if (sc){ sc.sendEvent.apply(sc, arguments); }
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot sendEvent cause state doesnt have a statechart'; }
    }
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
    this.history = this.history || {};
    if (this.substatesAreConcurrent){
      this.history[this.localConcurrentState] = state.name;
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendLog('HISTORY STATE SET', this.name, ' substree = '+this.localConcurrentState+' => history state set to: '+state.name, this.globalConcurrentState);
      }
    }
    else {
      this.history = state.name;
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendLog('HISTORY STATE SET', this.name, ' history state set to: '+state.name, this.globalConcurrentState);
      }
    }
  }
};
// Our Maker function:  Thank you D.Crockford.
Stativus.State.create = function (configs) {
  var nState, k, config, i, len;
  configs = configs || [];
  nState = creator.call(this);
  nState._data = {};
  // You can have 0...n configuration objects
  for (i = 0, len = configs.length || 0; i < len; i++){
    config = configs[i];
    if (typeof config === 'object'){
      for (k in config){ 
        if(config.hasOwnProperty(k)) nState[k] = config[k]; 
      }
    }
  }
  return nState;
};

/**
  Statechart functionality...
  TODO: Document more...
*/
Stativus.Statechart = {
  
  
  isStatechart: true,
  
  create: function(config){
		var sc = creator.call(this);
		
		// config all the internal information 
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
		
		if(DEBUG_MODE){
		  sc.inState = function(name, tree){
		    var ret = false, cStates = this.currentState(tree);
		    if (!cStates) throw "Doesn't appear that you are in any states, perhaps you forgot to 'initStates'?";
        cStates.forEach( function(x){
          if(x.name === name) ret = true;
        });
        return ret;
		  };
		  sc.getActiveStates = sc.currentState;
		}
		
		return sc;
	},
  
  addState: function(name){
	  var tree, obj, hasConcurrentSubstates = false, pState, states,
	      cTree, nState, config, configs = [], len, i, that = this;
	  
    for(i = 1, len = arguments.length; i < len; i++){
      configs[i-1] = config = arguments[i];
      hasConcurrentSubstates = hasConcurrentSubstates || !!config.substatesAreConcurrent;
      pState = pState || config.parentState;
    }
    if (len === 1) configs[0] = config = {};
	  // primary config is always the last config
	  config.name = name;
	  config.statechart = this;
	  config.history = null;
	  
	  tree = config.globalConcurrentState || Stativus.DEFAULT_TREE;
	  config.globalConcurrentState = tree;
	  
	  // Concurrent Substate checks: 
	  // Do i have substates?
    cTree = this._states_with_concurrent_substates[tree];
	  if (hasConcurrentSubstates){
	    obj = this._states_with_concurrent_substates[tree] || {};
	    obj[name] = true;
	    this._states_with_concurrent_substates[tree] = obj;
	  } 
	  // Am I a Concurrent State of any parent State?
	  if (pState && cTree && cTree[pState]){
	    pState = this._all_states[tree][pState];
	    if(pState) {
	      pState.substates = pState.substates || [];
	      pState.substates.push(name);
      }
	  }
	  
	  nState = Stativus.State.create(configs);
	  
	  // Actually add the state to our statechart
	  obj = this._all_states[tree] || {}; 
	  if (DEBUG_MODE){
	    if (obj[name]) throw ['Trying to add state', name, 'to state tree', tree, 'and it already exists'].join(' ');
	  }
	  
	  obj[name] = nState;
	  this._all_states[tree] = obj;
	  nState._beenAdded = true;
	  
    // Code to get the substates and add them.
    states = nState.states || [];
    if (DEBUG_MODE){
      if(states.length === 1 && nState.substatesAreConcurrent){ // weird format for UglifyJS preprocessing
        throw ['Trying to add substates in property \'states\' to '+nState.name+', but must have more than ONE substate'];
      }
    }
    
    states.forEach( function(x, idx){
      var args = [], good = false, last;
      if(typeof x === 'object' && x.length > 0){
        if (DEBUG_MODE){
          if (typeof x[0] !== 'string'){
            throw '#addState: invalid substate array...Must have the name at index=0'; 
          }
        }
        args = args.concat(x);
        good = true;
      }
      else if(typeof x === 'string'){
        args.push(x);
        good = true;
      }
      else if (typeof x === 'object'){
        if (typeof x.name !== 'string'){
          if (DEBUG_MODE) throw '#addState: invalid substate hash...Must have a \'name\' property'; 
        }
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
      } else {
        if (DEBUG_MODE) throw '#addState: invalid substate at index='+idx; 
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
  
  goToState: function(requestedStateName, tree, concurrentTree, data){
    var cState, allStates = this._all_states[tree], idx, len,
        enterStates = [], exitStates = [], haveExited,
        enterMatchIndex, exitMatchIndex, that,
        reqState, pState, i, substateTree,
        enterStateHandled, exitStateHandled, substates;
        
    if (DEBUG_MODE){
      if (!tree) throw '#goToState: invalid global parallel state';
    }

    // First, find the current tree off of the concurrentTree, then the main tree
    cState = concurrentTree ? this._current_state[concurrentTree] : this._current_state[tree];
    
    reqState = allStates[requestedStateName];
    
    if (DEBUG_MODE) {
      if (!reqState) throw '#goToState: Could not find requested state: '+requestedStateName;
    } 

    // if the current state is the same as the requested state do nothing
    if (this._checkAllCurrentStates(reqState, concurrentTree || tree)) return;

    if (typeof data !== 'undefined' && data !== null) {
      Stativus.DebugMessagingObject.sendLog('SETTING DATA FOR TRANSITION FOR => '+requestedStateName);
      if (typeof data === 'string') reqState.setData(data, data);
      if (typeof data === 'object') {
        for (var key in data) {
          if(data.hasOwnProperty(key)) reqState.setData(key, data[key]);
        }
      }
    }
    
    if (this._goToStateLocked){
      // There is a state transition currently happening. Add this requested
      // state transition to the queue of pending state transitions. The req
      // will be invoked after the current state transition is finished
      this._pendingStateTransitions.push({
        requestedState: requestedStateName,
        tree: tree
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
    
    // continue by finding the common parent state for the current and 
    // requested states:
    //
    // At most, this takes O(m^2) time, where m is the maximum depth from the 
    // root of the tree to either the requested state or the current state.
    // Will always be less than or equal to O(n^2), where n is the number
    // of states in the tree
    enterMatchIndex = -1;
    for (idx = 0, len = exitStates.length; idx < len; idx++){
      exitMatchIndex = idx;
      enterMatchIndex = enterStates.indexOf(exitStates[idx]);
      if(enterMatchIndex >= 0) break;
    }
    
    // In the case where we don't find a common parent state, we 
    // must enter from the root state
    if (enterMatchIndex < 0) enterMatchIndex = enterStates.length - 1;
    
    // Setup for the enter state sequence
    this._enterStates = enterStates;
    this._enterStateMatchIndex = enterMatchIndex;
    this._enterStateConcurrentTree = concurrentTree;
    this._enterStateTree = tree;
    
    // Now, we will exit all the underlying states till we reach the common
    // parent state. We do not exit the parent state because we transition
    // within it.
    this._exitStateStack = [];
    if (cState && cState.substatesAreConcurrent) this._fullExitFromSubstates(tree, cState);
    for (i = 0; i < exitMatchIndex; i+=1){
      cState = exitStates[i];
      this._exitStateStack.push(cState);
    }
    
    // Now, that we have the full stack of states to exit
    // We can exit them in an orderly fashion.
    this._unwindExitStateStack();
  },
    
  goToHistoryState: function(requestedState, tree, concurrentTree, isRecursive){
    var allStateForTree = this._all_states[tree],
        pState, realHistoryState;
    
    if (DEBUG_MODE){
      if (!tree || !allStateForTree) throw '#goToHistoryState: State requesting does not have a valid global parallel tree';
    }
  
    pState = allStateForTree[requestedState];
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
      if(!currentStates.hasOwnProperty(tree)) continue;
    
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
        if (DEBUG_MODE) found = tmp[1];
      }
      if (!handled) {
        tmp = this[func](evt, args, responder, allStates, null);  
        handled = tmp[0];
        if (DEBUG_MODE){ 
          if (!found) found = tmp[1];
        }
      }
      if (DEBUG_MODE){
        if(!found) {
          Stativus.DebugMessagingObject.sendLog('EVENT', this.name, 'Fired {'+evt+'} with '+(args.length || 0)+' argument(s) found NO state to handle this', this.globalConcurrentState);
        }
      }
    }
  },
  
  /**
    @private
    name: _cascadeEvents
  */
  _cascadeEvents: function(evt, args, responder, allStates, tree){
    var handled, trees, len, ssName, found = false;
    
    // substate prep work...
    if (tree){
      trees = tree.split('=>');
      len = trees.length || 0;
      ssName = trees[len-1];
    }
    
    while(!handled && responder){
      if (responder[evt]){
        if (DEBUG_MODE) {
          var msg = Stativus.DebugMessagingObject.sendInfo('EVENT', responder.name, 'Fired \''+evt+'\' with '+(args.length || 0)+' argument(s)', responder.globalConcurrentState);
        }
        handled = responder[evt].apply(responder, args);
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
    this.goToState(pending.requestedState, pending.tree);
    return true;
  },
  
  _parentStateObject: function(name, tree){
    if(name && tree && this._all_states[tree] && this._all_states[tree][name]){
      return this._all_states[tree][name];
    }
  },
  
  _fullEnter: function(state){
    var pState, enterStateHandled = false;
    if (!state) return;
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendInfo('ENTER STATE', state.name, 'Completed', state.globalConcurrentState);
    }
    if (state.enterState) state.enterState();
    if (state.didEnterState) state.didEnterState();
    if (state.parentState) {
      pState = state.statechart.getState(state.parentState, state.globalConcurrentState);
      pState.setHistoryState(state);
    }
    this._unwindEnterStateStack();
  },
  
  _fullExit: function(state){
    var pState;
    if (!state) return;
    var exitStateHandled = false;
    if (state.exitState) state.exitState();
    if (state.didExitState) state.didExitState();
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendInfo('EXIT STATE', state.name, 'Completed', state.globalConcurrentState);
    }
    this._unwindExitStateStack();
  },
  
  _initiateEnterStateSequence: function(){
    var enterStates, enterMatchIndex, concurrentTree, tree,
        allStates, i, cState;
    
    enterStates = this._enterStates;
    enterMatchIndex = this._enterStateMatchIndex;
    concurrentTree = this._enterStateConcurrentTree;
    tree = this._enterStateTree;
    allStates = this._all_states[tree];
    
    // Initialize the Enter State Stack
    this._enterStateStack = this._enterStateStack || [];
    
    // Finally, from the common parent state, but not including the parent state,
    // enter the sub states down to the requested state. If the requested state
    // has an initial sub state, then we must enter it too
    i = enterMatchIndex-1;
    cState = enterStates[i];
    if (cState) this._cascadeEnterSubstates(cState, enterStates, (i-1), concurrentTree || tree, allStates);
    
    // once, we have fully hydrated the Enter State Stack, we must actually async unwind it 
    this._unwindEnterStateStack();
    
    // Cleanup
    enterStates = null;
    enterMatchIndex = null;
    concurrentTree = null;
    tree = null;
    
    delete this._enterStates;
    delete this._enterStateMatchIndex;
    delete this._enterStateConcurrentTree;
    delete this._enterStateTree;
  },
  
  _cascadeEnterSubstates: function(start, requiredStates, index, tree, allStates){
    var cState, len = requiredStates.length, pState, subStates,
        that = this, nTree, bTree, name, currStates, aTrees, nTreeBase;
        
    if (!start) return;
        
    name = start.name;
    this._enterStateStack.push(start);
    this._current_state[tree] = start;
    start.localConcurrentState = tree;
    if (start.substatesAreConcurrent){
      tree = start.globalConcurrentState || Stativus.DEFAULT_TREE;
      nTreeBase = [Stativus.SUBSTATE_DELIM,tree,name].join('=>');
      start.history = start.history || {};
      subStates = start.substates || [];
      subStates.forEach( function(x){
        nTree = nTreeBase+'=>'+x;
        cState = allStates[x];

        // Now, we have to push the item onto the active subtrees for
        // the base tree for later use of the events.
        bTree = cState.globalConcurrentState || Stativus.DEFAULT_TREE;
        aTrees = that._active_subtrees[bTree] || [];
        aTrees.unshift(nTree);
        that._active_subtrees[bTree] = aTrees;

        if (index > -1 && requiredStates[index] === cState) index -= 1;
        that._cascadeEnterSubstates(cState, requiredStates, index, nTree, allStates);
	    });
	    return;        
    }
    else {
      // now we can trigger the lower levels of the state
      cState = requiredStates[index];
      if (cState){ 
        if (index > -1 && requiredStates[index] === cState) index -= 1;
        this._cascadeEnterSubstates( cState, requiredStates, index, tree, allStates);
      }
      // now we will go into the initial substates of this state
      else {
        cState = allStates[start.initialSubstate];
        this._cascadeEnterSubstates( cState, requiredStates, index, tree, allStates);
      }
    }
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
	      
	      that._exitStateStack.unshift(currState);

	      // check to see if it has substates
	      if(currState.substatesAreConcurrent) that._fullExitFromSubstates(tree, currState);
        
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
    var stateToExit, delayForAsync = false, stateRestart;
    this._exitStateStack = this._exitStateStack || [];
    stateToExit = this._exitStateStack.shift();
    if(stateToExit){
      if (stateToExit.willExitState) {
        // Now for some amazing encapsulation magic with closures
        // We are going to create a temporary object that gets passed
        // into the willExitState call that will restart the state
        // exit for this path as needed
        stateRestart = {
          _statechart: this,
          _start: stateToExit,
          restart: function(){
            var sc = this._statechart;
            if (DEBUG_MODE) {
              Stativus.DebugMessagingObject.sendLog('ASYNC', this._start.name, 'willExitState() completed!', this._start.globalConcurrentState);
            }
            if (sc) sc._fullExit(this._start);
          }
        };
        delayForAsync = stateToExit.willExitState(stateRestart);
        if (DEBUG_MODE) {
          if (delayForAsync) { Stativus.DebugMessagingObject.sendLog('ASYNC', stateToExit.name, 'exitState() delayed', stateToExit.globalConcurrentState); }
          else { Stativus.DebugMessagingObject.sendWarn('ASYNC', stateToExit.name, 'Didn\'t return \'true\' willExitState() which is needed if you want async', stateToExit.globalConcurrentState); }
        }
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
    var stateToEnter, delayForAsync = false, stateRestart, more, that = this;
    this._exitStateStack = this._exitStateStack || [];
    stateToEnter = this._enterStateStack.shift();
    if(stateToEnter){
      if (stateToEnter.willEnterState) {
        // Now for some amazing encapsulation magic with closures
        // We are going to create a temporary object that gets passed
        // into the willExitState call that will restart the state
        // exit for this path as needed
        stateRestart = function(){
          if (DEBUG_MODE) {
            Stativus.DebugMessagingObject.sendLog('ASYNC', this._start.name, 'willEnterState() completed!', this._start.globalConcurrentState);
          }
          if (that) that._fullEnter(stateToEnter);
        };
        delayForAsync = stateToEnter.willEnterState(stateRestart);
        if (DEBUG_MODE) {
          if (delayForAsync) { Stativus.DebugMessagingObject.sendLog('ASYNC', stateToEnter.name, 'enterState() delayed', stateToEnter.globalConcurrentState); }
          else { Stativus.DebugMessagingObject.sendWarn('ASYNC', stateToEnter.name, 'Didn\'t return \'true\' willEnterState() which is needed if you want async', stateToEnter.globalConcurrentState); }
        }
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
  }
	
};

Stativus.createStatechart = function(){ return this.Statechart.create(); };

if (DEBUG_MODE){
  Stativus.TestStateObject = {
    
    _eventsCalled: null,
    _eventHandled: null,
    
    create: function(statechart){
      console.log("Creating TestStateObject...");
      var tso = creator.call(this);
      
      tso._eventsCalled = {};
      tso._eventHandled = {};
      tso._eventTransition = {};
      tso._statechart = statechart;
      
      return tso;
    },
    
    enterState: function(){
      this._statechart.sendEvent('enterState');
    },
    
    willEnterState: function(done){
      var that = this, innerDone = function(){
        that._willEnterStateDone = true;
        done();
      };
      this._statechart.sendEvent('willEnterState', innerDone);
    },
    
    willExitState: function(done){
      var that = this, innerDone = function(){
        that._willExitStateDone = true;
        done();
      };
      this._statechart.sendEvent('willExitState', innerDone);
    },
    
    exitState: function(){
      this._statechart.sendEvent('exitState');
    },
    
    // **********************
    // TESTING API
    // **********************
    wasEvent: function(name){
      var ret, eventCount = this._eventsCalled[name] || 0,
          evtHandled = this._eventHandled[name] || false,
          evtTrans = this._eventTransition[name];
      
      ret = { 
        called: function(count) { 
          return count ? count === eventCount : eventCount;
        },
        handled: function(){
          return evtHandled;
        },
        transitionedTo: function(name){
          return name === evtTrans;
        }
      };
      return ret;
    },
    
    transitionedTo: function(name){
      return name === this._transitionTo;
    },
    
    willEnterCompleted: function(){
      return !!this._willEnterStateDone;
    },
    
    willExitCompleted: function(){
      return !!this._willExitStateDone;
    },
    
    reset: function(){
      delete this._eventsCalled;
      delete this._eventHandled;
      delete this._eventTransition;
      
      this._eventsCalled = {};
      this._eventHandled = {};
      this._eventTransition = {};
    },
    
    // protected functions only used by new statechart functions: sendEvent, goToState
    _eventCalled: function(evt, handled){
      var cnt = this._eventsCalled[evt] || 0;
      this._eventsCalled[evt] = cnt+1;
      this._eventHandled[evt] = handled;
    },
    
    _setTransitionState: function(evt, stateName){
      this._eventTransition[evt] = stateName;
      this._transitionTo = stateName;
    }
  };
  
  
  // Code to convert the Statechart to a Testing Statechart
  Stativus.Statechart.loadState = function(name, tree){
    var key, state, allStates;
    tree = tree || Stativus.DEFAULT_TREE;
    
    this._overloadFunctionsForTesting();
    this.isTestingStatechart = true;
    
    this._test_stateObjects = this._test_stateObjects || {};
    key = name+'_'+tree;
    allStates = this._all_states[tree];
    
    state = this._test_stateObjects[key] || Stativus.TestStateObject.create(this);
    
    this._current_test_state_object = state;
    this._current_loaded_state = allStates[name];
    
    return state;
  };
  
  Stativus.Statechart._overloadFunctionsForTesting = function(){
    if (this.isTestingStatechart) return;
    
    this._processEvent = function(evt, args){
      var handled = false,
          currState = this._current_loaded_state,
          currTestObj = this._current_test_state_object;

      if (currState[evt]){
        this._current_testing_event = evt;
        handled = currState[evt].apply(currState, args);
        currTestObj._eventCalled(evt, handled);
        delete this._current_testing_event;
      }
    };
    
    this.goToState = function(requestedStateName, tree, concurrentTree){
      var currTestObj = this._current_test_state_object,
          evt = this._current_testing_event;
      currTestObj._setTransitionState(evt, requestedStateName);
    };
  };
}

// All this code will add some awesome eventing structure that looks like backbone.js
// 
if (EVENTABLE){
  Stativus.Statechart._internalTryToPerform = function(node, evt, args){
    var that = this, lookup, selectors;
    
    if (!node || !node.className) return;
    selectors = node.className.split(/\s+/).map( function(x){ return '.'+x; });
    if (node.id) selectors.push('#'+node.id);
    selectors.forEach( function(x){
      lookup = (x+' '+evt).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      that._structureCrawl('_cascadeActionHandler', lookup, args);
    });
  };
  
  Stativus.Statechart._cascadeActionHandler = function(lookup, args, responder, allStates, tree){
    var handled, trees, len, ssName, found = false, evt;
    
    // substate prep work...
    if (tree){
      trees = tree.split('=>');
      len = trees.length || 0;
      ssName = trees[len-1];
    }
    
    while(!handled && responder){
      evt = responder.actions ? responder.actions[lookup] : null;
      if (evt){
        if (DEBUG_MODE) {
          Stativus.DebugMessagingObject.sendLog('EVENT LOOKUP', responder.name, ['Will fire [',evt,'] for','['+lookup+']', 'with', args.length || 0, 'argument(s)'].join(' '), responder.globalConcurrentState);
        }
        args.unshift(evt);
        this.sendEvent.apply(this, args);
        return [true, true];
      }
      // check to see if we have reached the end of this tree
      if (tree && ssName === responder.name) return [handled, found];
      responder = !handled && responder.parentState ? allStates[responder.parentState] : null ;
    }
    
    return [handled, found];
  };
  
  // Special sauce when you have jQuery Loaded
  var jQueryIsLoaded=false;
  try {
    if (jQuery) jQueryIsLoaded=true;
  }
  catch(err){
    jQueryIsLoaded=false;
  }

  if(jQueryIsLoaded){
    
    var findEventableNodeData = function(start){
      var parents, evt, evts, args,
          node = $(start), found, ret;
      if (node.hasClass('eventable')) found = node;

      if (!found){
        parents = node.parents('.eventable');
        if (parents && parents.length > 0) found = parents;
      }

      if (found){
        args = found.attr('data');
        args = args ? args.split('::') : [];
        found = found[0];
      }
      return [found, args];
    };
  
    Stativus.Statechart.tryToPerform = function(evt){   
      if (!evt) return;   
      var args, selectors = [], 
          tuple = findEventableNodeData(evt.target);
      if (!tuple[0]) return;
      tuple[1].push(evt); // Add the evt to the last argument
      this._internalTryToPerform(tuple[0], evt.type, tuple[1]);
    };
  }  
  else {
    
    // When you don't have JQuery you can still fire off the tryToPerform, but
    // you are responsible for converting the selectors
    Stativus.Statechart.tryToPerform = function(evt){
      if (!evt) return;
      var args = [], len = arguments.length, i, lookup;
      if (len < 2) return;
      for(i = 2; i < len; i++){
        args[i-2] = arguments[i];
      }
      args.push(evt);
      this._internalTryToPerform(evt.target, evt.type, args);
    };
  }
}

// TODO:  Work on AMD Loading...
if (typeof window !== "undefined") {
  window.Stativus = Stativus;
} else if (typeof exports !== "undefined") {
  module.exports = Stativus;
}
