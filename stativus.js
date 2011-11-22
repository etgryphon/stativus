/*globals Stativus Statechart State DEBUG_MODE*/

/**
  This is the code for creating statecharts in your javascript files
  
  @author: Evin Grano
  @version: 0.1
  @since: 0.1
*/
if (typeof DEBUG_MODE === "undefined"){
  DEBUG_MODE = true;
}
Stativus = window.Stativus || { DEFAULT_TREE: 'default', SUBSTATE_DELIM: 'SUBSTATE:', version: '0.1' };
Stativus.State = {
  
  // walk like a duck
  isState: true,
  
  _data: null,
  
  _isNone: function(value){
    return (value === undefined || value === null);
  },
  
  goToState: function(name){
    var sc = this.statechart;
    if (sc){ sc.goToState(name, this.globalConcurrentState, this.localConcurrentState); }
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
  
  getData: function(key){
    if (this._isNone(key)) return key;
    var sc = this.statechart, ret = this._data[key];
    if (this._isNone(ret)) ret = sc.getData(key, this.parentState, this.globalConcurrentState);
    return ret;
  },
  
  setData: function(key, value){
    if (this._isNone(key)) return value;
    this._data[key] = value;
  }
};
// Our Maker function:  Thank you D.Crockford.
Stativus.State.create = function (configs) {
  var nState, k, config, i, len;
  configs = configs || [];
  function F() {}
  F.prototype = this;
  nState = new F();
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
		var sc;
		
		function F() {}
    F.prototype = this;
    sc = new F();
		
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
	  var tree, obj, hasConcurrentSubstates, pState, states,
	      cTree, nState, config, configs = [], len, i, that = this;
	  
    for(i = 1, len = arguments.length; i < len; i++){
      configs[i-1] = config = arguments[i];
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
	  hasConcurrentSubstates = config.substatesAreConcurrent;
	  pState = config.parentState;
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
	  nState.sendAction = nState.sendEvent;
	  
	  // Actually add the state to our statechart
	  obj = this._all_states[tree]; 
	  if (!obj) obj = {};
	  if (obj[name]){ // weird format for UglifyJS preprocessing
	    if (DEBUG_MODE) throw ['Trying to add state', name, 'to state tree', tree, 'and it already exists'].join(' ');
	  } 
	  obj[name] = nState;
	  this._all_states[tree] = obj;
	  nState._beenAdded = true;
	  
    // Code to get the substates and add them.
    states = nState.states || [];
    if(states.length === 1 && nState.substatesAreConcurrent){ // weird format for UglifyJS preprocessing
      if (DEBUG_MODE) throw ['Trying to add substates in property \'states\' to '+nState.name+', but must have more than ONE substate'];
    }
    states.forEach( function(x, idx){
      var args = [], good = false, last;
      if(typeof x === 'object' && x.length > 0){
        if (typeof x[0] !== 'string'){
          if (DEBUG_MODE) throw '#addState: invalid substate array...Must have the name at index=0'; 
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
  
  goToState: function(requestedStateName, tree, concurrentTree){
    var cState, allStates = this._all_states[tree], idx, len,
        enterStates = [], exitStates = [], haveExited,
        enterMatchIndex, exitMatchIndex, that,
        reqState, pState, i, substateTree,
        enterStateHandled, exitStateHandled, substates;
        
    if (!tree){ // weird format for UglifyJS preprocessing
      if (DEBUG_MODE) throw '#goToState: invalid global parallel state';
    } 
    
    // First, find the current tree off of the concurrentTree, then the main tree
    cState = concurrentTree ? this._current_state[concurrentTree] : this._current_state[tree];
    
    reqState = allStates[requestedStateName];
    
    // if the current state is the same as the requested state do nothing
    if (this._checkAllCurrentStates(reqState, concurrentTree || tree)) return;
    
    if (!reqState){ // weird format for UglifyJS preprocessing
      if (DEBUG_MODE) throw '#goToState: Could not find requested state: '+requestedStateName;
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
    
    // Now, we will exit all the underlying states till we reach the common
    // parent state. We do not exit the parent state because we transition
    // within it.
    if (cState && cState.substatesAreConcurrent) this._fullExitFromSubstates(tree, cState);
    for (i = 0; i < exitMatchIndex; i+=1){
      cState = exitStates[i];
      this._fullExit(cState);
    }
    
    // Finally, from the common parent state, but not including the parent state,
    // enter the sub states down to the requested state. If the requested state
    // has an initial sub state, then we must enter it too
    i = enterMatchIndex-1;
    cState = enterStates[i];
    if (cState) this._cascadeEnterSubstates(cState, enterStates, (i-1), concurrentTree || tree, allStates);
    
    // Ok, we're done with the current state transition. Make sure to unlock
    // the goToState and let other pending state transitions
    this._goToStateLocked = false;
    this._flushPendingStateTransitions();
    
    // Once pending state transitions are flushed then go ahead and start flush
    // pending actions
    if (!this._inInitialSetup) this._flushPendingEvents();
  },
  
  goToHistoryState: function(requestedState, tree, concurrentTree, isRecursive){
    var allStateForTree = this._all_states[tree],
        pState, realHistoryState;
    if(!tree || !allStateForTree) { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE) throw '#goToHistoryState: State requesting does not have a valid global parallel tree';
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
    var handled = false, currentStates = this._current_state, responder,
        args = [], tree, len = arguments.length, i, allStates, sTree,
        ss = Stativus.SUBSTATE_DELIM, aTrees, sResponder;
    if (len < 1) return;
    for(i = 1; i < len; i++){
      args[i-1] = arguments[i];
    }
    
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
        handled = handled || this._cascadeEvents(evt, args, sResponder, allStates, sTree);
      }
      if (!handled) handled = this._cascadeEvents(evt, args, responder, allStates, null);  
      if(!handled) { // weird format for UglifyJS preprocessing
        if (DEBUG_MODE) console.log(['EVENT:',evt,'with', args.length || 0, 'argument(s)','found NO state to handle the event'].join(' '));
      } 
    }

    // Now, that the states have a chance to process the first action
    // we can go ahead and flush the queued events
    this._sendEventLocked = false;
    if (!this._inInitialSetup) this._flushPendingEvents();
  },
  
  getData: function(key, stateName, tree){
    var allStates = this._all_states[tree], state;
    if (!allStates) return null;
    state = allStates[stateName];
    if (state && state.isState) return state.getData(key);
  },
  
  /**
    @private
    name: _cascadeEvents
  */
  _cascadeEvents: function(evt, args, responder, allStates, tree){
    var handled, trees, len, ssName;
    
    // substate prep work...
    if (tree){
      trees = tree.split('=>');
      len = trees.length || 0;
      ssName = trees[len-1];
    }
    
    while(!handled && responder){
      if (responder[evt]){
        if (DEBUG_MODE) console.log(['EVENT:',responder.name,'fires','['+evt+']', 'with', args.length || 0, 'argument(s)'].join(' '));
        handled = responder[evt].apply(responder, args);
      }
      // check to see if we have reached the end of this tree
      if (tree && ssName === responder.name) return handled;
      responder = !handled && responder.parentState ? allStates[responder.parentState] : null ;
    }
    
    return handled;
  },
  
  _checkAllCurrentStates: function(reqState, tree){
    var currentStates = this.currentState(tree) || [];
    if (currentStates === reqState) return true
    else if (typeof currentStates === 'string' && reqState === this._all_states[tree][currentStates]) return true
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
    if (!pending) return;
    this.goToState(pending.requestedState, pending.tree);
  },
  
  _parentStateObject: function(name, tree){
    if(name && tree && this._all_states[tree] && this._all_states[tree][name]){
      return this._all_states[tree][name];
    }
  },
  
  _fullEnter: function(state){
    if (!state) return;
    // run all the enter state functions
    var enterStateHandled = false;
    if (DEBUG_MODE) console.log('ENTER: '+state.name);
    if (state.willEnterState) enterStateHandled = state.willEnterState();
    if (!enterStateHandled && state.enterState) state.enterState();
    if (state.didEnterState) state.didEnterState();
  },
  
  _fullExit: function(state){
    if (!state) return;
    var exitStateHandled = false;
    if (state.willExitState) exitStateHandled = state.willExitState();
    if (!exitStateHandled && state.exitState) state.exitState();
    if (state.didExitState) state.didExitState();
    if (DEBUG_MODE) console.log('EXIT: '+state.name);
  },
  
  _cascadeEnterSubstates: function(start, requiredStates, index, tree, allStates){
    var cState, len = requiredStates.length, pState, 
        that = this, nTree, bTree, name, currStates, aTrees;
    // console.log('SC: #_cascadeEnterSubstates called');
    // TODO: might be able to kill the array, and do it below...save a stack call.
    if (typeof start === 'object' && start.length > 0 ){ // we have an array
      start.forEach( function(x){
        nTree = tree+'=>'+x;
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
    else if ( typeof start === 'string' ){
      start = allStates[start];
    }
    
    // This is where the hard work is...
    if ( start && !!start.isState ){
      name = start.name;
      this._fullEnter(start);
      this._current_state[tree] = start;
      start.localConcurrentState = tree;
      if (start.substatesAreConcurrent){
        tree = start.globalConcurrentState || Stativus.DEFAULT_TREE;
        nTree = [Stativus.SUBSTATE_DELIM,tree,name].join('=>');
        start.history = start.substates;
        this._cascadeEnterSubstates( start.substates || [], requiredStates, index, nTree, allStates);
      }
      else {
        // now we can trigger the lower levels of the state
        cState = requiredStates[index];
        if (cState){
          pState = allStates[cState.parentState];
	        if (pState) pState.history = cState.name;
	        index -= 1;
	        if (index > -1) this._cascadeEnterSubstates( cState, requiredStates, index, tree, allStates);
        }
        // now we will go into the initial substates of this state
        else {
          this._cascadeEnterSubstates( start.initialSubstate, requiredStates, index, tree, allStates);
        }
      }
    }
  },
  
  _fullExitFromSubstates: function(tree, stopState){
    var cStates, allStates, func, that = this;
    if (!tree || !stopState || !tree || !stopState.substates) return;
    
    allStates = this._all_states[tree];
    cStates = this._current_state;
    
    stopState.substates.forEach( function(state){
      var substateTree, currState, curr, exitStateHandled, aTrees;
      substateTree = [Stativus.SUBSTATE_DELIM, tree, stopState.name, state].join('=>');
	    currState = cStates[substateTree];
	    while(currState && currState !== stopState){
	      exitStateHandled = false;
	      if (!currState) continue;

	      // check to see if it has substates
	      if(currState.substatesAreConcurrent) that._fullExitFromSubstates(tree, currState);

        that._fullExit(currState);
        
	      curr = currState.parentState;
	      currState = allStates[curr];
	    }
	    
	    // Now, remove this from the active substate tree
	    that._active_subtrees[tree] = that._removeFromActiveTree(tree, substateTree);
    });
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
window.Stativus = Stativus;