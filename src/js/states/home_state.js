/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('home', {

    parentState: 'application',

    // events: {
    //   'click .download': 'download'
    // },

    enterState: function() {
      var that = this;
      $(document).on('click', '.download', function() { that.sendEvent('download'); }); // remove after new eventable version added

      this.sendEvent('renderView', '#home-template');
    },

    exitState: function() {
      $(document).off('click', '.download'); // remove after new eventable version added
      this.sendEvent('scrollTop');
      this.sendEvent('clearContentContainer');
    },

    download: function() {
      $('.callout').removeClass('hidden');
    }

  });
})(StativusDocs);