// Loading gif while page loads
$(window).on('load', function() {
  $(".loading-gif").fadeOut(3000);
})

$(document).ready(function() {
  // Sidebar Toggle
  $('#toggleMenu').click(function() {
    $('#sidebar').sidebar('toggle');
  });
});
