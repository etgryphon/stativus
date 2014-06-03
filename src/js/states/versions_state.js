/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('versions', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'versions');
      this.sendEvent('renderView', '#versions-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);