/*globals StativusDocs, SyntaxHighlighter*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('gists', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'gists');
      this.sendEvent('renderView', '#gists-template');
      this.sendEvent('highlightSyntax');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);