/*globals Stativus DEBUG_MODE EVENTABLE COLOR_MODE EVENT_COLOR EXIT_COLOR ENTER_COLOR exports $ createNode*/
/*
@license
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
*/
// #ifdef DEBUG_MODE
if (typeof DEBUG_MODE === "undefined"){
  DEBUG_MODE = true;
  COLOR_MODE = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if (COLOR_MODE) {
    EVENT_COLOR = "#CC00FF";
    ENTER_COLOR = "#009900";
    EXIT_COLOR = "#880000";
  }
}
// #endif
// Pre-processor for eventable code
// #ifdef EVENTABLE
if (typeof EVENTABLE === "undefined"){
  EVENTABLE = true;
}
// #endif
// Helper function for creating prototypical objects...
var creator = function(){
  function F() {}
  F.prototype = this;
  return new F();
};

// helper function for merging in properties
var merge = function(obj, configs){
  var k;
  obj = obj || {};
  configs = configs || [];
  configs.forEach( function(x){
    if (typeof x === 'object'){
      for (k in x){ 
        if(x.hasOwnProperty(k)) obj[k] = x[k];         
      }
    }
  });
  
  return obj;
};

Stativus = { DEFAULT_TREE: 'default', SUBSTATE_DELIM: 'SUBSTATE:', version: '0.10.0' };

// This creates the Debug object that is used to output statements
// #ifdef DEBUG_MODE
if(DEBUG_MODE){
  Stativus.DebugMessagingObject = {
    
    level: 1,
    
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
      console.warn(msg);
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
// #endif
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
    // #ifdef DEBUG_MODE
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot goToState cause state doesnt have a statechart'; }
    }
    // #endif
  },
  
  goToHistoryState: function(name, isRecursive){
    var sc = this.statechart;
    if (sc){ sc.goToHistoryState(name, this.globalConcurrentState, this.localConcurrentState, isRecursive); }
    // #ifdef DEBUG_MODE
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot goToState cause state doesnt have a statechart'; }
    }
    // #endif
  },
  
  sendEvent: function(evt){
    var sc = this.statechart;
    if (sc){ sc.sendEvent.apply(sc, arguments); }
    // #ifdef DEBUG_MODE
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot sendEvent cause state doesnt have a statechart'; }
    }
    // #endif
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
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendLog('HISTORY STATE SET', this.name, ' history state set to: '+state.name, this.globalConcurrentState);
    }
    // #endif
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
		
    // #ifdef DEBUG_MODE
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
		// #endif
		return sc;
	},
  
  addState: function(name){
	  var tree, obj, hasConcurrentSubstates = false, pState, pName, states,
	      cTree, nState, config, configs = [], len, i, that = this, key;
	  
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
	    pState = this._all_states[tree][pName];
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
    // #ifdef DEBUG_MODE
	  if (DEBUG_MODE){
	    if (obj[name]) throw ['Trying to add state', name, 'to state tree', tree, 'and it already exists'].join(' ');
	  }
	  // #endif
	  obj[name] = nState;
	  this._all_states[tree] = obj;
	  nState._beenAdded = true;
	  
    // Code to get the substates and add them.
    states = nState.states || [];
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE){
      if(states.length === 1 && nState.substatesAreConcurrent){ // weird format for UglifyJS preprocessing
        throw ['Trying to add substates in property \'states\' to '+nState.name+', but must have more than ONE substate'];
      }
    }
    // #endif
    states.forEach( function(x, idx){
      var args = [], good = false, last;
      if(typeof x === 'object' && x.length > 0){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE){
          if (typeof x[0] !== 'string'){
            throw '#addState: invalid substate array...Must have the name at index=0'; 
          }
        }
        // #endif
        args = args.concat(x);
        good = true;
      }
      else if(typeof x === 'string'){
        args.push(x);
        good = true;
      }
      else if (typeof x === 'object'){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE){
          if (typeof x.name !== 'string') throw '#addState: invalid substate hash...Must have a \'name\' property'; 
        }
        // #endif
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
      // #ifdef DEBUG_MODE 
      else {
        if (DEBUG_MODE) throw '#addState: invalid substate at index='+idx; 
      }
      // #endif
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
    
    // #ifdef DEBUG_MODE    
    if (DEBUG_MODE){
      if (!tree) throw '#goToState: invalid global parallel state';
    }
    // #endif

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
    
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      if (!reqState) throw '#goToState: Could not find requested state: '+requestedState;
    } 
    // #endif

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
            // #ifdef DEBUG_MODE
            if (DEBUG_MODE){
              Stativus.DebugMessagingObject.sendError('TRANSITION:', ret.name, 'Invalid Transition to '+curr.name+' because of no suitable common ancestor', ret.globalConcurrentState);
            }
            // #endif
            continue;
          }
          
          // check to see if the common ancestor has concurrent substates because 
          // we need to pause transition on the parent state
          pivot = currStates[indexes.second];
          if (!pivot.substatesAreConcurrent){
            // #ifdef DEBUG_MODE
            if (DEBUG_MODE){
              Stativus.DebugMessagingObject.sendError('TRANSITION:', ret.name, 'Invalid Transition to '+curr.name+' because of common ancestor is NOT have concurrent Substates', ret.globalConcurrentState);
            }
            // #endif
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
          // #ifdef DEBUG_MODE
          else if (DEBUG_MODE){
            Stativus.DebugMessagingObject.sendError('TRANSITION:', ret.name, 'Invalid Transition to '+curr.name+' because of common ancestor is NOT have concurrent Substates', ret.globalConcurrentState);
          }
          // #endif
        }
        
      }
    }
    return ret;
  },
    
  goToHistoryState: function(requestedState, tree, localConcurrentState, isRecursive){
    var allStatesForTree = this._all_states[tree],
        pState, realHistoryState;
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE){
      if (!tree || !allStatesForTree) throw '#goToHistoryState: State requesting does not have a valid global parallel tree';
    }
    // #endif
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
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendLog('SETTING DATA FOR TRANSITION FOR => '+state.name);
      }
      // #endif
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
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) found = tmp[1];
        // #endif
      }
      if (!handled) {
        tmp = this[func](evt, args, responder, allStates, null);  
        handled = tmp[0];
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE){ 
          if (!found) found = tmp[1];
        }
        // #endif
      }
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE){
        if(!found) {
          Stativus.DebugMessagingObject.sendLog('EVENT', this.name, 'Fired {'+evt+'} with '+(args.length || 0)+' argument(s) found NO state to handle this', this.globalConcurrentState);
        }
      }
      // #endif
    }
  },
  
  /**
    @private
    name: _cascadeEvents
  */
  _cascadeEvents: function(evt, args, responder, allStates, tree){
    var handled, ssName, found = false;
    
    // substate prep work...
    ssName = this._splitConcurrencyKey(tree);
    
    while(!handled && responder){
      if (responder[evt]){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          Stativus.DebugMessagingObject.sendInfo('EVENT', responder.name, 'Fired \''+evt+'\' with '+(args.length || 0)+' argument(s)', responder.globalConcurrentState);
        }
        // #endif
        try {
          handled = responder[evt].apply(responder, args);
        } catch(e){
          // #ifdef DEBUG_MODE
          if (DEBUG_MODE) {
            Stativus.DebugMessagingObject.sendError('EVENT', responder.name, 'Fired \''+evt+'\': Exception: '+e, responder.globalConcurrentState);
          }
          // #endif
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
    } catch(e){
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendError('ENTER STATE', state.name, 'EXECEPTION ['+e+']', state.globalConcurrentState);
      }
      // #endif
    }
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendInfo('ENTER STATE', state.name, 'Completed', state.globalConcurrentState);
    }
    // #endif
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
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendError('EXIT STATE', state.name, 'EXECEPTION ['+e+']', state.globalConcurrentState);
      }
      // #endif
    }
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendInfo('EXIT STATE', state.name, 'Completed', state.globalConcurrentState);
    }
    // #endif
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
    var stateToExit, delayForAsync = false, stateRestart,
        sc = this;
    this._exitStateStack = this._exitStateStack || [];
    stateToExit = this._exitStateStack.shift();
    if(stateToExit){
      if (stateToExit.willExitState) {
        // Now for some amazing encapsulation magic with closures
        // We are going to create a temporary object that gets passed
        // into the willExitState call that will restart the state
        // exit for this path as needed
        stateRestart = function(){
          var sc = this._statechart;
          // #ifdef DEBUG_MODE
          if (DEBUG_MODE) {
            Stativus.DebugMessagingObject.sendLog('ASYNC', stateToExit.name, 'willExitState() completed!', stateToExit.globalConcurrentState);
          }
          // #endif
          if (sc) sc._fullExit(stateToExit);
        };
        delayForAsync = stateToExit.willExitState(stateRestart);
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          if (delayForAsync) { Stativus.DebugMessagingObject.sendLog('ASYNC', stateToExit.name, 'exitState() delayed', stateToExit.globalConcurrentState); }
          else { Stativus.DebugMessagingObject.sendWarn('ASYNC', stateToExit.name, 'Didn\'t return \'true\' willExitState() which is needed if you want async', stateToExit.globalConcurrentState); }
        }
        // #endif
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
          // #ifdef DEBUG_MODE
          if (DEBUG_MODE) {
            Stativus.DebugMessagingObject.sendLog('ASYNC', stateToEnter.name, 'willEnterState() completed!', stateToEnter.globalConcurrentState);
          }
          // #endif
          if (that) that._fullEnter(stateToEnter);
        };
        delayForAsync = stateToEnter.willEnterState(stateRestart);
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          if (delayForAsync) { Stativus.DebugMessagingObject.sendLog('ASYNC', stateToEnter.name, 'enterState() delayed', stateToEnter.globalConcurrentState); }
          else { Stativus.DebugMessagingObject.sendWarn('ASYNC', stateToEnter.name, 'Didn\'t return \'true\' willEnterState() which is needed if you want async', stateToEnter.globalConcurrentState); }
        }
        // #endif
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
// #ifdef DEBUG_MODE
if (DEBUG_MODE){
  Stativus.Statechart.createStateTree = function() {

    var unprocessedStates = [];

    var addToTree = function(name, state, rootTree) {

      function addSubstateToTree(parentState, stateName, state, tree) {
        if(tree.name === parentState) {
          tree.substates.push(createNode(state, stateName, tree));
          return true;
        }
        return tree.substates.some(function(subtree) {
          return addSubstateToTree(parentState, stateName, state, subtree);
        });
      }

      function addStateToTree(name, state){
        if(!state.parentState) {
          rootTree.substates.push(createNode(state, name, rootTree));
          return true;
        }
        return addSubstateToTree(state.parentState, name, state, rootTree);
      }

      return addStateToTree(name, state);

    };

    function getTransitions(func) {
      var pattern = 
        "goToState\\s*\\(\\s*['\"]([a-zA-Z\\\-_0-9]+)['\"]\\s*\\)";
      var globalRegEx = new RegExp(pattern, 'g');
      var regExp = new RegExp(pattern);
      var matches = func.toString().match(globalRegEx);
      if(matches) return matches.map(function(m){
        return m.match(regExp)[1];
      });
      else return [];
    }

    function createNode(state, name, parentTree) {
      var events =  Object.keys(state).filter(function(key) {
        return key.slice(0,1) !== '_' && 
          state[key] && 
          ['name', 'gotoState', 'sendAction', 'parentState', 'states',
            'globalConcurrentState', 'history', 'statechart',
            'localConcurrentState', 'initialSubstate', 'actions',
            'substatesAreConcurrent', 'hasConcurrentSubstates']
          .every(function(excludedKey) { return key !== excludedKey;});
      }).map(function(key) {
        return {
          name: key, 
          content: state[key].toString(),
          transitions: getTransitions(state[key])
        };
      });

      return { 
        substates: [],
        name: name,
        initialSubstate: state.initialSubstate,
        hasConcurrentSubstates: state.hasConcurrentSubstates ||
          !!state.substatesAreConcurrent,
        isConcurrentSubstate:
          parentTree && parentTree.hasConcurrentSubstates,
        isInitialSubstate: parentTree && parentTree.initialSubstate === name,
        events: events
      };
    }

    var allStatesTree = createNode({hasConcurrentSubstates: true }, "global");

    function processState(stateHash, stateTree) {
      return function(state) {
        return !addToTree(state, stateHash[state], stateTree);
      };
    }

    function processFailedState(stateHash, stateTree) {
      return function(invalidStateName) {
        var invalidState = createNode(stateHash[invalidStateName],
                                   invalidStateName);
        invalidState.isInvalidState = true;
        stateTree.substates.push(invalidState);
      };
    }

    for (var globalStateName in this._all_states) {
      if (this._all_states.hasOwnProperty(globalStateName)) {
        var globalStateTree = createNode({}, globalStateName, allStatesTree),
            globalState = this._all_states[globalStateName];

        allStatesTree.substates.push(globalStateTree);

        unprocessedStates = Object.keys(globalState);
        do {
          var statesToProcess = unprocessedStates.length;
          unprocessedStates = unprocessedStates.filter(
            processState(globalState, globalStateTree));

          if (statesToProcess === unprocessedStates.length) {
            unprocessedStates.forEach(
              processFailedState(globalState, globalStateTree));
            break;
          }
        } while(unprocessedStates.length > 0);
      }
    }
    return allStatesTree;
  };
}
// #endif
// #ifdef DEBUG_MODE
if (DEBUG_MODE){
  Stativus.TestStateObject = {
    
    _eventsCalled: null,
    _eventHandled: null,
    
    create: function(statechart){
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
    
    this.goToState = function(requestedState, tree, concurrentTree){
      var currTestObj = this._current_test_state_object,
          evt = this._current_testing_event;
      currTestObj._setTransitionState(evt, requestedState);
    };
  };
}
// #endif
// All this code will add some awesome eventing structure that looks like backbone.js
// 
// #ifdef EVENTABLE
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
    var handled, ssName, found = false, evt;
    
    // substate prep work...
    ssName = this._splitConcurrencyKey(tree);
    
    while(!handled && responder){
      evt = responder.actions ? responder.actions[lookup] : null;
      if (evt){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          Stativus.DebugMessagingObject.sendLog('EVENT LOOKUP', responder.name, ['Will fire [',evt,'] for','['+lookup+']', 'with', args.length || 0, 'argument(s)'].join(' '), responder.globalConcurrentState);
        }
        // #endif
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
// #endif
// TODO:  Work on AMD Loading...
if (typeof window !== "undefined") {
  window.Stativus = Stativus;
} else if (typeof exports !== "undefined") {
  module.exports = Stativus;
}
