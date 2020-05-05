$(document).ready(function ($) {
  // Get current url
  // Select an a element that has the matching href and apply a class of 'active'. Also prepend a - to the content of the link
  var url = window.location.href;
  $('.nav a').filter(function() {
    return this.href == url;
  }).addClass('better-active');
});
