// All DC Graphs
var totalCasesRecorded = dc.numberDisplay('#totalConfirmedCases');
var totalDeathsRecorded = dc.numberDisplay('#totalDeaths');
var totalRecoveries = dc.numberDisplay('#totalRecoveries');
var percentageOfCases = dc.numberDisplay('#countryCasePercent');
var percentageOfDeaths = dc.numberDisplay('#countryDeathPercent');
var percentageOfRecoveries = dc.numberDisplay('#countryRecoveryPercent');
var countryFilterDropdown = dc.selectMenu('#countryDropDown');
var searchCountryWidget = dc.textFilterWidget('#search');
var totalStatsTable = dc.dataTable('#topCountries');
var statsPerMillion = dc.dataTable('#topCountriesPerMillion');
var testingTotalAvailability = dc.rowChart('#testingAvailability1-row');
var testingThousandAvailability = dc.rowChart('#testingThousandAvailability1-row');
var dailyCasesPerCountry = dc.seriesChart('#dailyCasesPerCountry');
var totalDeathsPerCountry = dc.seriesChart('#fatalityRatePerCountry');

// Chart Divs for Dynamic Resizing
var rowDiv = $('#testingAvailability1-row').width();
var seriesDiv = $('#dailyCasesPerCountry').width();
var seriesRangeDiv = $('#dailyCasesPerCountryOverview').width();

// Load and Process Data; Render Charts
Promise.all([
    d3.csv('dcGraphs/data/owid-covid-data.csv')
])
.then(([allCovid]) =>  {

    for (let d of allCovid) {
        d.Date = formatTime(d.date);
        d.recoveries = calculateRecoveries(d['New Cases'], d['New Deaths']);
        d.total_cases_per_million = removeNaN(d['new_cases_per_million']);
        d.total_deaths_per_million = removeNaN(d['new_deaths_per_million']);
        d.recoveries_per_million = calculateRecoveries(d['new_cases_per_million'], d['new_deaths_per_million']);
        d.total_tests = removeNaN(d['new_tests']);
        d.total_tests_per_thousand = removeNaN(d['new_tests_per_thousand']);
    }

    var allCovidndx = crossfilter(allCovid);

    aggregateNumber(allCovidndx, totalCasesRecorded, 'New Cases');
    aggregateNumber(allCovidndx, totalDeathsRecorded, 'New Deaths');
    aggregateNumber(allCovidndx, totalRecoveries, 'recoveries');
    aggregatePercentage(allCovidndx, percentageOfCases, 'New Cases');
    aggregatePercentage(allCovidndx, percentageOfDeaths, 'New Deaths');
    aggregatePercentage(allCovidndx, percentageOfRecoveries, 'recoveries');
    countryDropDown(allCovidndx, countryFilterDropdown);
    searchByCountry(allCovidndx, searchCountryWidget);
    highestCasesPerCountry(allCovidndx, totalStatsTable, 'New Cases', 'New Deaths', 'recoveries', 'select-direction-cases');
    highestCasesPerCountry(allCovidndx, statsPerMillion, 'total_cases_per_million', 'total_deaths_per_million', 'recoveries_per_million', 'select-direction-mill');
    testingAvailability(allCovidndx, testingTotalAvailability, 'total_tests', 'testingAvailability');
    testingAvailability(allCovidndx, testingThousandAvailability, 'total_tests_per_thousand', 'testingThousandAvailability');
    casesPerCountry(allCovidndx, dailyCasesPerCountry, '#dailyCasesPerCountryOverview', 'New Cases');
    casesPerCountry(allCovidndx, totalDeathsPerCountry, '#fatalityRatePerCountryOverview', 'New Deaths');

    // Apply dynamic resizing to Testing Row Chart
    apply_resizing([testingTotalAvailability, testingThousandAvailability]);

    dc.renderAll();
});


// Total Cases recorded as of 5 April 2020 Number Display
var aggregateNumber = (ndx, chartID, column) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            p.cases += parseInt(v[column]);
            return p;
        },
        (p, v) => {
            p.cases -= parseInt(v[column]);
            return p;
        },
        () => {
            return {cases: 0};
        },
    );
    chartID
    .formatNumber(d3.format(','))
    .valueAccessor(d => +d.cases)
    .group(totalCasesNumber)
};

// Percent of Cases Number Display
var aggregatePercentage = (ndx, chartID, column) => {
    var allInstances = ndx.groupAll().reduceSum(d => d[column]).value();
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            p.cases += parseInt(v[column]);
            return p;
        },
        (p, v) => {
            p.cases -= parseInt(v[column]);
            return p;
        },
        () => {
            return {cases: 0};
        },
    );
    chartID
    .formatNumber(d3.format(".2%"))
    .valueAccessor(d => d.cases / allInstances)
    .group(totalCasesNumber);
};


// View Individual Country Dropdown
var countryDropDown = (ndx, chartID) => {
    var countriesDim = ndx.dimension(dc.pluck('location'));
    var countriesGroup = countriesDim.group();
    chartID
    .dimension(countriesDim)
    .group(countriesGroup)
    .title(d=> `${d.key}`)
    .controlsUseVisibility(true);

    chartID.on('pretransition', function(chartID){
        chartID.select('select').classed('ui selection dropdown', true);
    });
};

// Text search for country data
var searchByCountry = (ndx, chartID) => {
    var countryDim = ndx.dimension(d => d.location);
    chartID
        .dimension(countryDim)
        .placeHolder('Search Countries...');
};


// Table Showing the Countries with the highest case count
var highestCasesPerCountry = (ndx, chartID, cases, deaths, recoveries, button) => {
    var countryDim = ndx.dimension(d => d.location);
    var countryGroup = countryDim.group().reduce(
        (p, v) => {
                p.cases += parseInt(v[cases]);
                p.deaths += parseInt(v[deaths]);
                p.recoveries += parseInt(v[recoveries]);
            return p;
        },
        (p, v) => {
                p.cases -= parseInt(v[cases]);
                p.deaths -= parseInt(v[deaths]);
                p.recoveries -= parseInt(v[recoveries]);
            return p;
        },
        () => {
            return {cases: 0, deaths: 0, recoveries: 0};
        },
    );
    
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
          chartID.order(d3[this.value]).redraw();
          tableStyling();
      });
};


// Testing Availability Row chart
var testingAvailability = (ndx, chartID, column, id) => {
    var testingDim = ndx.dimension(d => d.location);
    var testingGroup = testingDim.group().reduce(
        (p, v) => {
                p.tests += parseInt(v[column]);
            return p;
        },
        (p, v) => {
                p.tests -= parseInt(v[column]);
            return p;
        },
        () => {
            return {tests: 0};
        },
    );
    var rowChartWidth = svgSize(rowDiv, 210);
    var heightRowChart = testingGroup.all().length;
    chartID
    .width(rowChartWidth * 0.90)
    .height(heightRowChart * 3)
    .margins({top: heightRowChart/10, right: (rowChartWidth * 0.02), bottom: (heightRowChart/10), left: (rowChartWidth * 0.02)})
    .transitionDuration(500)
    .ordering(d => -d.value.tests)
    .dimension(testingDim)
    .group(remove_empty_bins_row(testingGroup))
    .valueAccessor(d => d.value.tests)
    .elasticX(true)
    .x(d3.scaleBand())
    .othersGrouper(false)
    .title(d => `${d.key}: ${formatNumber(d.value.tests)} tests`)
    .label(d => `${d.key} - ${formatNumber(d.value.tests)} tests`)
    .rowsCap(15)
    .fixedBarHeight(33)
    .xAxis().ticks(rowChartWidth/75).scale(chartID.x());


    // Add LinearGradient 
    chartID.on('postRender', function(){
        renderGradients($(`#${id}1-row svg`), `${id}1`);
    });

    // Auto adjust height of rowchart based on number of rows in filter
    chartID.on('preRedraw', function(){
        var allrows = chartID.group().all().length;
        if (allrows > 14 || allrows == 0) {
            $(`#${id}1-row svg`).height(615);
            chartID.height(615)
                .margins({top: heightRowChart/10, right: (rowChartWidth * 0.02), bottom: (heightRowChart/10), left: (rowChartWidth * 0.02)});
                $(`#${id}1-row .nothing`).hide();
        } else {
            chartID.height((allrows * 50) + 40);
            $(`#${id}1-row`).css('height','-webkit-fill-available');
            $(`#${id}1-row svg`).show();
            $(`#${id}1-row .nothing`).hide();
        }
    });

    // If no testing data available, show notification message
    chartID.on('postRedraw', function() {
        var finalrowcount = chartID.group().all().length;
        if (finalrowcount == 0) {
            var finalrowcount = chartID.group().all().length;
            $(`#${id}1-row svg`).hide();
            $(`#${id}1-row`).prepend(
                `<div class="ui placeholder segment nothing middle aligned">
                    <div class="ui icon large header">
                        <i class="purple icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </i>
                        No Data Available
                    </div>
                </div>`
                ).show().fadeIn(2000).css('height','-webkit-fill-available');
            $('i.fa-exclamation-triangle').transition('jiggle');
        }
        else {
            $(`#${id}1-row .nothing`).hide();
            $(`#${id}1-row svg`).show();
        }
    })
};


// Cases Per Country seriesChart
var casesPerCountry = (ndx, chartID1, chart2ID, casesCountType) => {
    var seriesDivWidth = svgSize(seriesDiv, 670);
    var seriesRangeDivWidth = svgSize(seriesRangeDiv, 670)
    var dailyCasesPerCountryOverview = dc.seriesChart(chart2ID);
    var dateDim = ndx.dimension(d => d.Date);
    var countriesDim = ndx.dimension(d => [d.location, d.Date]);
    var countryGroup = countriesDim.group().reduce(
        (p, v) => {
            p.cases += parseInt(v[casesCountType]);
            return p;
        },
        (p, v) => {
            p.cases -= parseInt(v[casesCountType]);
            return p;
        },
        () => {
            return {cases: 0};
        },
    );
    var filteredCountryGroup = remove_empty_bins(countryGroup);
    var minDate = formatTime("2020-01-25");
    var maxDate = dateDim.top(1)[0].Date;
    chartID1
    .width(seriesDivWidth)
    .height(500)
    .chart(c => dc.lineChart(c).curve(d3.curveBasis).evadeDomainFilter(true).filterHandler(filterHandler))
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
    chartID1.margins().left += seriesDivWidth * 0.065;
    chartID1.filterHandler(filterHandler);

    // Range Chart Associated With Above Series Chart
    dailyCasesPerCountryOverview
    .width(seriesRangeDivWidth)
    .height(100)
    .chart(c => dc.lineChart(c).curve(d3.curveBasis).filterHandler(filterHandler))
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
    dailyCasesPerCountryOverview.margins().left += seriesRangeDivWidth * 0.045;
    dailyCasesPerCountryOverview.filterHandler(filterHandler);

    // Multi Chart Filter Handler - Modified From: https://stackoverflow.com/questions/55438591/dc-js-multichart-interaction-with-range-chart-pie-chart-goes-empty-when-filter
    function filterHandler(dimensions, filters) {
        if (filters.length === 0) {
        countriesDim.filter(null);
        } else {
        var filter = dc.filters.RangedFilter(filters[0][0], filters[0][1]);
        countriesDim.filterFunction(k => filter.isFiltered(k[1]));
        };
        return filters;
    };
};

dailyCasesPerCountry.focusCharts = function (chartlist) {
    if (!arguments.length) {
        return this._focusCharts;
    }
    this._focusCharts = chartlist; // only needed to support the getter above
    this.on('filtered', function (range_chart) {
        chartlist.forEach(function(focus_chart) {
            if (!rangesEqual(range_chart.filter(), focus_chart.filter())) {
                dc.events.trigger(function () {
                    focus_chart.focus(range_chart.filter());
                });
            }
        });
    });
    return this;
};

dailyCasesPerCountry.focusCharts([totalDeathsPerCountry]);

totalDeathsPerCountry.focusCharts = function (chartlist) {
    if (!arguments.length) {
        return this._focusCharts;
    }
    this._focusCharts = chartlist; // only needed to support the getter above
    this.on('filtered', function (range_chart) {
        chartlist.forEach(function(focus_chart) {
            if (!rangesEqual(range_chart.filter(), focus_chart.filter())) {
                dc.events.trigger(function () {
                    focus_chart.focus(range_chart.filter());
                });
            }
        });
    });
    return this;
};
totalDeathsPerCountry.focusCharts([dailyCasesPerCountry]);