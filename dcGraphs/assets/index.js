const TOTALCASES = 2619872
// var formatTime = d3.timeParse("%b %e, %Y");
var formatTime = d3.timeParse('Y%-%m-%d');
var totalCasesPerCountry = dc.seriesChart('#totalCasesPerCountry');
var dailyCasesPerCountry = dc.seriesChart('#dailyCasesPerCountry');


// Load Data
Promise.all([
  d3.csv('data/total-cases-covid-19.csv'),
  d3.csv('data/daily-cases-covid-19.csv'),
  d3.csv('data/covid-19-total-confirmed-cases-vs-total-confirmed-deaths.csv'),
  d3.csv('data/coronavirus-cfr.csv'), 
  d3.csv('data/owid-covid-data.csv')
])
.then(([totalCases, dailyCases, casesVsDeaths, fatalityRate, allCovid]) =>  {
    for (let d of allCovid) {
        console.log(d);
        d.Date = formatTime(d.date);
        console.log(d.Date);
    }
    var ndx = crossfilter(totalCases);
    var dailyCasesndx = crossfilter(dailyCases);
    var casesVsDeathsndx = crossfilter(casesVsDeaths);
    var fatalityRatendx = crossfilter(fatalityRate);
    var allCovidndx = crossfilter(allCovid);
    totalCasesRecorded(allCovidndx, "#totalConfirmedCases");
    percentOfCases(allCovidndx, '#countryPercent');
    countryDropDown(allCovidndx, '#countryDropDown');
    casesPerCountry(allCovidndx, totalCasesPerCountry, 'total_cases');
    casesPerCountry(allCovidndx, dailyCasesPerCountry, 'new_cases')
    
    dc.renderAll();
});


// Total Cases recorded as of 5 April 2020 Number Display
var totalCasesRecorded = (ndx, chartID) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Asia") &&
                !(v.location).includes("International") &&
                !(v.location).includes("Europe")
            )
                ? (v.date === '2020-04-26') 
                ? p.cases += parseInt(v['total_cases'])
                : p
                : p
            return p
        },
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("Asia") &&
                !(v.location).includes("International") &&
                !(v.location).includes("Europe")
            )
            ? (v.date === "2020-04-26") 
            ? p.cases -= parseInt(v['total_cases'])
            : p
            : p 
            return p;
        },
        () => {
            return {cases: 0};
        },
    )
    var totalCases = dc.numberDisplay(chartID);
    totalCases
    .formatNumber(d3.format('d'))
    .valueAccessor(d => +d.cases)
    .group(totalCasesNumber)
}

// Percent of Cases Number Display
var percentOfCases = (ndx, chartID) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Asia") &&
                !(v.location).includes("International") &&
                !(v.location).includes("Europe")
            )
                ? (v.date === '2020-04-26') 
                ? p.cases += parseInt(v['total_cases'])
                : p
                : p
            return p
        },
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("Asia") &&
                !(v.location).includes("International") &&
                !(v.location).includes("Europe")
            )
            ? (v.date === "2020-04-26") 
            ? p.cases -= parseInt(v['total_cases'])
            : p
            : p 
            return p;
        },
        () => {
            return {cases: 0};
        },
    )
    var percentCases = dc.numberDisplay(chartID);
    percentCases
    .formatNumber(d3.format(".2%"))
    .valueAccessor(d => (d.cases / TOTALCASES))
    .group(totalCasesNumber);
}

var countrySelect = dc.selectMenu('#countryDropDown');
// View Individual Country Dropdown
var countryDropDown = (ndx, chartID) => {
    var countriesDim = ndx.dimension(dc.pluck('location'));
    var countriesGroup = countriesDim.group()
    countrySelect
    .dimension(countriesDim)
    .group(countriesGroup)
    .controlsUseVisibility(true);
}

// Cases Per Country seriesChart
var casesPerCountry = (ndx, chartID, casesCountType) => {
    var dateDim = ndx.dimension(d => d.date);
    var countryDim = ndx.dimension(d => [d.location, d.date]);
    var countryGroup = countryDim.group().reduce(
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("Asia") &&
                !(v.location).includes("International") &&
                !(v.location).includes("Europe")
            )
                ? p.cases += parseInt(v[casesCountType])
                : p
            return p;
        },
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("Asia") &&
                !(v.location).includes("International") &&
                !(v.location).includes("Europe")
            )
                ? p.cases -= parseInt(v[casesCountType])
                : p
            return p;
        },
        () => {
            return {cases: 0};
        },
    )
    var filteredCountryGroup = remove_empty_bins(countryGroup);
    var minDate = formatTime("2020-01-25");
    var maxDate = dateDim.top(1)[0].date;
    console.log(minDate);
    console.log(maxDate);
    chartID
    .width(1200)
    .height(600)
    .chart(c => dc.lineChart(c).curve(d3.curveBasis))
    .seriesSort(d3.descending)
    .x(d3.scaleTime().domain([minDate,maxDate]))
    .brushOn(false)
    .yAxisLabel(casesCountType)
    .xAxisLabel("Date")
    .clipPadding(10)
    // .elasticY(true)
    .dimension(countryDim)
    .group(filteredCountryGroup)
    .seriesAccessor(d =>  "Country: " + d.key[0])
    .keyAccessor(d =>  d.key[1])
    .valueAccessor(d => d.value.cases)
    .title(d => `${d.key[0]}: ${d.value.cases} cases on ${(d.key[1]).toLocaleDateString()}`)
    chartID.margins().left += 40;
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
}


