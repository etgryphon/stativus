/*globals StativusDocs, SyntaxHighlighter*/
(function(app) {
  
  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('api', {

    parentState: 'application',

    substatesAreConcurrent: true,

    enterState: function() {
      this.sendEvent('activateNavigation', 'api');
      this.sendEvent('renderView', '#api-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    },

    states: [
      {
        name: 'api-navigation',

        enterState: function() {
          this.sendEvent('renderSidebarNavigation');
        },

        renderSidebarNavigation: function() {
          var html = $('#api-nav-template').html();
          $('#api-nav').html(html);

          this.sendEvent('affixSidebar');
        },

        affixSidebar: function() {
          $('.bs-sidebar').each(function() { $(this).affix({ offset: { top: 100 } }); });
        }
      },
      {
        name: 'api-documentation',

        enterState: function() {
          this.sendEvent('renderDocumentation');
        },

        renderDocumentation: function() {
          $('#api-doc').html($('#api-doc-template').html());
          this.sendEvent('highlightScript');
          this.sendEvent('wireNavigation');
        },

        wireNavigation: function() {
          $('.bs-sidenav a').each(function() {
            $(this).click(function(evt) {
              evt.preventDefault();

              var id = $(this).attr('href');
              var top = $(id).offset().top-50;
              $('html, body').animate({ scrollTop: top }, 1);
            });
          });
        },

        highlightScript: function() {
          var that = this;
          var spy = function() { that.sendEvent('setScrollSpy'); };

          SyntaxHighlighter.highlight();
          setTimeout(spy, 500);
        },

        setScrollSpy: function() {
          $('body').each(function () {
            var $this = $(this);
            $this.scrollspy($this.data());
          });
        }
      }
    ]

  });

})(StativusDocs);