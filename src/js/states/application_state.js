/*globals StativusDocs, SyntaxHighlighter, Path, _gaq*/

(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('application', {

    enterState: function() {
      this.sendEvent('enableRouting');
      this.sendEvent('configureSyntaxHighlighter');
    },

    configureSyntaxHighlighter: function() {
      // set syntaxhighlighter defaults
      SyntaxHighlighter.defaults['toolbar'] = false;
      SyntaxHighlighter.defaults['smart-tabs'] = false;
    },

    enableRouting: function() {
      var that = this;

      var goToState = function(route) {
        return function() {
          that.sendEvent('trackEvent', 'Navigation', route, route);
          that.goToState(route);
        };
      };

      Path.map('#/api').to(goToState('api'));
      Path.map('#/faq').to(goToState('faq'));
      Path.map('#/gists').to(goToState('gists'));
      Path.map('#/guide').to(goToState('guide'));
      Path.map('#/samples').to(goToState('samples'));
      Path.map('#/versions').to(goToState('versions'));
      Path.map('#/').to(goToState('home'));

      Path.root('#/');

      Path.listen();
    },

    activateNavigation: function(id) {
      $('li#'+id).addClass('active');
    },

    deactivateNavigation: function() {
      $('.navbar li').removeClass('active');
    },

    renderView: function(selector) {
      var html = $(selector).html();
      $('#content-container').html(html);
    },

    clearContentContainer: function() {
      $('#content-container').html('');
    },

    scrollTop: function() {
      window.scrollTo(0,0);
    },

    trackEvent: function(category, evt, label) {
      if (!_gaq) return;
      _gaq.push(['_trackEvent', category, evt, label]);      
    },

    highlightSyntax: function() {
      SyntaxHighlighter.highlight();
    }

  });

})(StativusDocs);