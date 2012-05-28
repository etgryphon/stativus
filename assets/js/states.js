/*globals $ Stativus _trackEvent*/
var statechart = Stativus.createStatechart();
// *********************************
// DEFAULT STATES
// *********************************
statechart.addState("#home", {
  
  enterState: function(){
    $('.home-page').show('fast');
  },
  
  exitState: function(){
    $('.home-page').hide('fast');
  }
});

// *********************************
// MODAL STATES
// *********************************
statechart.addState("#modal_ready", {
  globalConcurrentState: 'modal_states',
  
  // events
  underConstruction: function(id){
    _trackEvent('UnderConstruction', id, id);
    this.goToState('#underConstruction');
  }
});

statechart.addState("#underConstruction", {
  globalConcurrentState: 'modal_states',
  actions: {
    '.close-action click': 'closeModal'
  },
  enterState: function(){
    $('#info-modal .modal-header').html('<h2>Under Construction!</h2>');
    $('#info-modal .modal-body').html('Page is under construction.  Anything with a \'*\' hasn\'t been completed');
    $('#info-modal').modal('show');
  },
  exitState: function(){
    $('#info-modal').modal('hide');
  },
  
  // Events
  closeModal: function(){
    this.goToState('#modal_ready');
  }
});

// *********************************
// JQuery Startup functions
// *********************************
$(document).ready(function() {
  // Handler for .ready() called.
  statechart.initStates({'default': '#home', 'modal_states': '#underConstruction'});
});

$(document).bind('click', function(evt){
  statechart.tryToPerform(evt);
});
this.statechart = statechart;


