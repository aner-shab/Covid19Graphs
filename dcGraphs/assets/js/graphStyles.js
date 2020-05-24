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

    // Dropdown Functionality
    $('.ui.dropdown')
    .dropdown({
        clearable: true
        });

});


// DC Chart Helper Functions

// Calculate Recoveries based on Cases and Deaths
var calculateRecoveries = (total_cases, total_deaths) => {
    return total_cases - total_deaths;
};


// Remove NaN values from column
var removeNaN = (value) => {
    if (value != "") {
        return value;
    } else {
        return 0;
    }
};


// Size SVG based on size of parent div or given minimum size
var svgSize = (svgWidth, smallestWidth) => {
    if (svgWidth > smallestWidth) {
        return svgWidth;
    } else {
        return smallestWidth;
    }
}


// Format Helper Functions
var formatTime = d3.timeParse("%Y-%m-%d");
var formatNumber = d3.format(",");


// Table Responsiveness
var tableStyling = () => {
    $("td.dc-table-column._2").addClass('right aligned');
    $("td.dc-table-column._3").addClass('right aligned');
    $("td.dc-table-column._4").addClass('right aligned');
};


// Fake Dimension to Wrap the Group to toggle sorting and hide rows with zero cases
//  Modified From: https://github.com/dc-js/dc.js/blob/develop/web-src/examples/table-on-aggregated-data.html
function reversible_group(source_group) {
    function non_zero_pred(d) {
        return d.value.cases != 0;
    }
    return {
        all: function () {
            return source_group.all().filter(non_zero_pred);
        },
        top: function(N) {
            return source_group.top(N)
                .filter(non_zero_pred)
        },
          bottom: function(N) {
            return source_group.top(Infinity)
                .filter(non_zero_pred)
                .slice(-N).reverse();
        }
    };
};


// Remove Empty Rows for Rowchart keeping RowCap
function remove_empty_bins_row(source_group) {
    function non_zero_pred(d) {
        return d.value.tests != 0;
    }
    return {
        all: function () {
            return source_group.all().filter(non_zero_pred)
        },
        top: function(n) {
            return source_group.top(Infinity)
                .filter(non_zero_pred)
                .slice(0, n);
        }
    };
};


// Modified from basic SVG gradient using CSS: https://stackoverflow.com/questions/14051351/svg-gradient-using-css
function renderGradients(svg, id) {
    let gradient = `<svg width="0" height="0" version="1.1">
                        <linearGradient id="${id}">
                            <stop class="one-stop" offset="0%"/>
                            <stop class="two-stop" offset="25%"/>
                            <stop class="three-stop" offset="75%"/>
                            <stop class="four-stop" offset="100%"/>
                        </linearGradient>
                        <rect width="0" height="0" fill="url(#${id})"/>
                    </svg>`;
    svg.prepend(gradient);
};


// Remove Empty Groups - Taken from: 
// https://github.com/dc-js/dc.js/wiki/FAQ#how-do-i-filter-the-data-before-its-charted
function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value !== 0;
            });
        }
    };
};


//   Both series charts zooming on rangeChart filter - Modified from: https://github.com/dc-js/dc.js/blob/develop/web-src/examples/multi-focus.html

function rangesEqual(range1, range2) {
    if (!range1 && !range2) {
        return true;
    }
    else if (!range1 || !range2) {
        return false;
    }
    else if (range1.length === 0 && range2.length === 0) {
        return true;
    }
    else if (range1[0].valueOf() === range2[0].valueOf() &&
        range1[1].valueOf() === range2[1].valueOf()) {
        return true;
    }
    return false;
};
