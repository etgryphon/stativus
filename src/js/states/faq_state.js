/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('faq', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'faq');
      this.sendEvent('renderView', '#faq-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);