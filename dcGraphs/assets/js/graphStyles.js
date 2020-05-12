// Loading gif while page loads
$(window).on('load', function() {
    $(".loading-gif").fadeOut(3000);
})

$(document).ready(function() {
	// Sidebar Toggle
    $('#toggleMenu').click(function() {
        $('#sidebar').sidebar('toggle');
	});

	// Data Table Tabs
	$('.menu .item').tab();

});

// DC Chart Helper Functions
var calculateRecoveries = (total_cases, total_deaths) => {
    return total_cases - total_deaths;
};
