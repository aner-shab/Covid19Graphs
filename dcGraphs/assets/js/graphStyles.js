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

  // Table Responsiveness
var tableStyling = () => {
    $("td.dc-table-column._2").addClass('right aligned');
    $("td.dc-table-column._3").addClass('right aligned');
    $("td.dc-table-column._4").addClass('right aligned');
};