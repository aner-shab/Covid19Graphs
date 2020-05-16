const TOTALCASES = 2624252;
const TOTALDEATHS = 178784;
const TOTALRECOVER = 2445468;
var formatTime = d3.timeParse("%Y-%m-%d");
var formatNumber = d3.format(",");
var totalCasesRecorded = dc.numberDisplay('#totalConfirmedCases');
var totalDeathsRecorded = dc.numberDisplay('#totalDeaths');
var totalRecoveries = dc.numberDisplay('#totalRecoveries');
var percentageOfCases = dc.numberDisplay('#countryCasePercent');
var percentageOfDeaths = dc.numberDisplay('#countryDeathPercent');
var percentageOfRecoveries = dc.numberDisplay('#countryRecoveryPercent');
var totalStatsTable = dc.dataTable('#topCountries');
var statsPerMillion = dc.dataTable('#topCountriesPerMillion');
var testingTotalAvailability = dc.rowChart('#testingAvailability1-row');
var testingThousandAvailability = dc.rowChart('#testingThousandAvailability1-row');
var dailyCasesPerCountry = dc.seriesChart('#dailyCasesPerCountry');
var totalDeathsPerCountry = dc.seriesChart('#fatalityRatePerCountry');


// Load Data
Promise.all([
  d3.csv('data/owid-covid-data.csv')
])
.then(([allCovid]) =>  {
    for (let d of allCovid) {
        d.Date = formatTime(d.date);
        d.recoveries = calculateRecoveries(d['Total Cases'], d['Total Deaths']);
        d.total_cases_per_million = removeNaN(d['total_cases_per_million']);
        d.total_deaths_per_million = removeNaN(d['total_deaths_per_million']);
        d.recoveries_per_million = calculateRecoveries(d['total_cases_per_million'], d['total_deaths_per_million']);
        d.total_tests = removeNaN(d['total_tests']);
        d.total_tests_per_thousand = removeNaN(d['total_tests_per_thousand'])
    }
    var allCovidndx = crossfilter(allCovid);
    aggregateNumber(allCovidndx, totalCasesRecorded, 'Total Cases');
    aggregateNumber(allCovidndx, totalDeathsRecorded, 'Total Deaths');
    aggregateNumber(allCovidndx, totalRecoveries, 'recoveries');
    aggregatePercentage(allCovidndx, percentageOfCases, 'Total Cases', TOTALCASES);
    aggregatePercentage(allCovidndx, percentageOfDeaths, 'Total Deaths', TOTALDEATHS);
    aggregatePercentage(allCovidndx, percentageOfRecoveries, 'recoveries', TOTALRECOVER);
    countryDropDown(allCovidndx, '#countryDropDown');
    searchByCountry(allCovidndx, '#search');
    highestCasesPerCountry(allCovidndx, totalStatsTable, 'Total Cases', 'Total Deaths', 'recoveries', 'select-direction-cases');
    highestCasesPerCountry(allCovidndx, statsPerMillion, 'total_cases_per_million', 'total_deaths_per_million', 'recoveries_per_million', 'select-direction-mill');
    testingAvailability(allCovidndx, testingTotalAvailability, 'total_tests', 'testingAvailability');
    testingAvailability(allCovidndx, testingThousandAvailability, 'total_tests_per_thousand', 'testingThousandAvailability');
    casesPerCountry(allCovidndx, dailyCasesPerCountry, '#dailyCasesPerCountryOverview', 'New Cases');
    casesPerCountry(allCovidndx, totalDeathsPerCountry, '#fatalityRatePerCountryOverview', 'New Deaths');
    
    dc.renderAll();

});


var removeNaN = (value) => {
    if (value != "") {
        return value;
    } else {
        return 0;
    }
};


// Table Responsiveness
var tableStyling = () => {
    $("td.dc-table-column._2").addClass('right aligned');
    $("td.dc-table-column._3").addClass('right aligned');
    $("td.dc-table-column._4").addClass('right aligned');
};

// Total Cases recorded as of 5 April 2020 Number Display
var aggregateNumber = (ndx, chartID, column) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            (
                v.date === "2020-04-26"
            )
                ? p.cases += parseInt(v[column])
                : p
            return p
        },
        (p, v) => {
            (
                v.date === "2020-04-26"
            )
            ? p.cases -= parseInt(v[column])
            : p

            return p;
        },
        () => {
            return {cases: 0};
        },
    )
    chartID
    .formatNumber(d3.format(','))
    .valueAccessor(d => +d.cases)
    .group(totalCasesNumber)
};

// Percent of Cases Number Display
var aggregatePercentage = (ndx, chartID, column, TOTAL) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            (
                v.date === '2020-04-26'
            )
                ? p.cases += parseInt(v[column])
                : p
            return p
        },
        (p, v) => {
            (
                v.date === "2020-04-26"
            )
            ? p.cases -= parseInt(v[column])
            : p
            return p;
        },
        () => {
            return {cases: 0};
        },
    )
    chartID
    .formatNumber(d3.format(".2%"))
    .valueAccessor(d => (d.cases / TOTAL))
    .group(totalCasesNumber);
};


// View Individual Country Dropdown
var countryDropDown = (ndx, chartID) => {
    var countriesDim = ndx.dimension(dc.pluck('location'));
    var countriesGroup = countriesDim.group();
    var countrySelect = dc.selectMenu(chartID);
    countrySelect
    .dimension(countriesDim)
    .group(countriesGroup)
    .controlsUseVisibility(true);

    countrySelect.on('pretransition', function(countrySelect){
        countrySelect.select('select').classed('ui selection dropdown', true);
    });
};

// Text search for country data
var searchByCountry = (ndx, chartID) => {
    var countryDim = ndx.dimension(d => d.location);
    var searchCountry = dc.textFilterWidget(chartID);
    searchCountry
        .dimension(countryDim);
};


// Table Showing the Countries with the highest case count
var highestCasesPerCountry = (ndx, chartID, cases, deaths, recoveries, button) => {
    var countryDim = ndx.dimension(d => d.location);
    var countryGroup = countryDim.group().reduce(
        (p, v) => {
            if (v.date === '2020-04-25') {
                p.cases += parseInt(v[cases]);
                p.deaths += parseInt(v[deaths]);
                p.recoveries += parseInt(v[recoveries]);
            } else {
                p
            }
            return p
        },
        (p, v) => {
            if (v.date === '2020-04-25') {
                p.cases -= parseInt(v[cases]);
                p.deaths -= parseInt(v[deaths]);
                p.recoveries -= parseInt(v[recoveries])
            } else {
                p
            }
            return p
        },
        () => {
            return {cases: 0, deaths: 0, recoveries: 0};
        },
    )
    
    var i = 0;
    chartID
    .width(600)
    .height(400)
    .dimension(reversible_group(countryGroup))
    .columns([d => {i = i + 1; return i;},
              d => d.key,
              d => formatNumber(d.value.cases),
              d => formatNumber(d.value.deaths),
              d => formatNumber(d.value.recoveries)])
    .sortBy(d => d.value.cases)
    .showSections(false)
    .order(d3.descending)
    .size(Infinity)
    .endSlice(15)
    .on('renderlet', function(c) {
        i = 0;
        tableStyling();
    });

    d3.selectAll(`#${button} button`)
      .on('click', function() {
          // this.value is 'ascending' or 'descending'
          chartID.order(d3[this.value]).redraw()
          tableStyling();
      });
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

// Testing Availability Row chart
var testingAvailability = (ndx, chartID, column, id) => {
    var testingDim = ndx.dimension(d => d.location);
    var testingGroup = testingDim.group().reduce(
        (p, v) => {
            if (v.date === '2020-04-25') {
                p.tests += parseInt(v[column]);
            } else {
                p;
            }
            return p;
        },
        (p, v) => {
            if (v.date === '2020-04-25') {
                p.tests -= parseInt(v[column]);
            } else {
                p;
            }
            return p;
        },
        () => {
            return {tests: 0};
        },
    )
    
    chartID
    .width(650)
    .height(615)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .transitionDuration(500)
    .dimension(testingDim)
    .group(remove_empty_bins(testingGroup))
    .valueAccessor(d => d.value.tests)
    .elasticX(true)
    .x(d3.scaleBand())
    .ordering(d => -d.value.tests)
    .othersGrouper(false)
    .title(d => `${d.key}: ${formatNumber(d.value.tests)} tests`)
    .rowsCap(15)
    .xAxis().ticks(8);

    chartID.on('postRender', function(){
        renderGradients($(`#${id}1-row svg`), `${id}1`)
    });
}

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
}

// Cases Per Country seriesChart
var casesPerCountry = (ndx, chartID1, chart2ID, casesCountType) => {
    var dailyCasesPerCountryOverview = dc.seriesChart(chart2ID);
    var dateDim = ndx.dimension(d => d.Date);
    var countriesDim = ndx.dimension(d => [d.location, d.Date]);
    var countryGroup = countriesDim.group().reduce(
        (p, v) => {
            p.cases += parseInt(v[casesCountType])
            return p;
        },
        (p, v) => {
            p.cases -= parseInt(v[casesCountType])
            return p;
        },
        () => {
            return {cases: 0};
        },
    )
    var filteredCountryGroup = remove_empty_bins(countryGroup);
    var minDate = formatTime("2020-01-25");
    var maxDate = dateDim.top(1)[0].Date;
    chartID1
    .width(1200)
    .height(500)
    .chart(c => dc.lineChart(c).curve(d3.curveBasis).evadeDomainFilter(true))
    .seriesSort(d3.descending)
    .x(d3.scaleTime().domain([minDate,maxDate]))
    .brushOn(false)
    .yAxisLabel(casesCountType)
    .xAxisLabel("Date")
    .yAxisPadding("5%")
    .clipPadding(10)
    .elasticY(true)
    .dimension(countriesDim)
    .group(filteredCountryGroup)
    .rangeChart(dailyCasesPerCountryOverview)
    .seriesAccessor(d =>  `Country: ${d.key[0]}`)
    .keyAccessor(d =>  d.key[1])
    .valueAccessor(d => d.value.cases)
    .title(d => `${d.key[0]}: ${formatNumber(d.value.cases)} cases on ${(d.key[1]).toLocaleDateString()}`);
    chartID1.margins().left += 40;

    dailyCasesPerCountryOverview
    .width(1200)
    .height(100)
    .chart(c => dc.lineChart(c).curve(d3.curveBasis))
    .seriesSort(d3.descending)
    .x(d3.scaleTime().domain([minDate,maxDate]))
    .brushOn(true)
    .clipPadding(10)
    .dimension(countriesDim)
    .group(filteredCountryGroup)
    .seriesAccessor(d =>  `Country: ${d.key[0]}`)
    .keyAccessor(d =>  d.key[1])
    .valueAccessor(d => d.value.cases)
    .yAxis().ticks(3)
    dailyCasesPerCountryOverview.margins().left += 15;

}

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
