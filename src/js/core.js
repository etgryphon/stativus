/*globals StativusDocs*/

StativusDocs = {};
StativusDocs.Statechart = Stativus.createStatechart();

$(document).ready(function() {
  StativusDocs.Statechart.initStates({ 'default': 'application' });
});

// Adjust for fixed navbar
$('body').on('click.scroll-adjust', '[href^="#"]', function (e) {
  var adjustScrollForNavbar = function() { window.scrollBy(0, -50); };

  if (e && e.isDefaultPrevented()) return;
  $(window).one('scroll', adjustScrollForNavbar);
});