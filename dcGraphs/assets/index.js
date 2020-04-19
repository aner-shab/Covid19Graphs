const TOTALCASES = 1195548
var formatTime = d3.timeParse("%b %e, %Y");

// Load Data
Promise.all([
  d3.csv('data/total-cases-covid-19.csv'),
  d3.csv('data/daily-cases-covid-19.csv'),
  d3.csv('data/covid-19-total-confirmed-cases-vs-total-confirmed-deaths.csv'),
  d3.csv('data/coronavirus-cfr.csv')
])
.then(([totalCases, dailyCases, casesVsDeaths, fatalityRate]) =>  {
    for (let d of totalCases) {
        d.date = formatTime(d.Date)
    }
    var ndx = crossfilter(totalCases);
    var dailyCasesndx = crossfilter(dailyCases);
    var casesVsDeathsndx = crossfilter(casesVsDeaths);
    var fatalityRatendx = crossfilter(fatalityRate);
    totalCasesRecorded(ndx, "#totalConfirmedCases");
    percentOfCases(ndx, '#countryPercent');
    countryDropDown(ndx, '#countryDropDown')
    casesPerCountry(ndx, '#casesPerCountry');
    dc.renderAll();
});

// Total Cases in an individual country as of 5 April 2020
var totalCasesRecorded = (ndx, chartID) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            (
                !(v.Entity).includes("World") &&
                !(v.Entity).includes("Oceania") &&
                !(v.Entity).includes("North America") &&
                !(v.Entity).includes("Africa") &&
                !(v.Entity).includes("Asia") &&
                !(v.Entity).includes("International") &&
                !(v.Entity).includes("Europe")
            )
                ? (v.Date === "Apr 5, 2020") 
                ? p.cases += parseInt(v['Total confirmed cases of COVID-19 (cases)'])
                : p
                : p
            return p
        },
        (p, v) => {
            (
                !(v.Entity).includes("World") &&
                !(v.Entity).includes("Oceania") &&
                !(v.Entity).includes("North America") &&
                !(v.Entity).includes("Africa") &&
                !(v.Entity).includes("Asia") &&
                !(v.Entity).includes("International") &&
                !(v.Entity).includes("Europe")
            )
            ? (v.Date === "Apr 5, 2020") 
            ? p.cases -= parseInt(v['Total confirmed cases of COVID-19 (cases)'])
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

var percentOfCases = (ndx, chartID) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            (
                !(v.Entity).includes("World") &&
                !(v.Entity).includes("Oceania") &&
                !(v.Entity).includes("North America") &&
                !(v.Entity).includes("Africa") &&
                !(v.Entity).includes("Asia") &&
                !(v.Entity).includes("International") &&
                !(v.Entity).includes("Europe")
            )
                ? (v.Date === "Apr 5, 2020") 
                ? p.cases += parseInt(v['Total confirmed cases of COVID-19 (cases)'])
                : p
                : p
            return p
        },
        (p, v) => {
            (
                !(v.Entity).includes("World") &&
                !(v.Entity).includes("Oceania") &&
                !(v.Entity).includes("North America") &&
                !(v.Entity).includes("Africa") &&
                !(v.Entity).includes("Asia") &&
                !(v.Entity).includes("International") &&
                !(v.Entity).includes("Europe")
            )
            ? (v.Date === "Apr 5, 2020") 
            ? p.cases -= parseInt(v['Total confirmed cases of COVID-19 (cases)'])
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

var countryDropDown = (ndx, chartID) => {
    var countriesDim = ndx.dimension(dc.pluck('Entity'));
    var countrySelect = dc.selectMenu(chartID);
    countrySelect
    .dimension(countriesDim)
    .group(countriesDim.group())
    .multiple(true)
    .numberVisible(10)
    .controlsUseVisibility(true);
}

var casesPerCountry = (ndx, chartID) => {
    var dateDim = ndx.dimension(d => d.date);
    var countryDim = ndx.dimension(d => [d.Entity, d.date]);
    var countryGroup = countryDim.group().reduceSum(d => +d['Total confirmed cases of COVID-19 (cases)']);
    var minDate = dateDim.bottom(1)[0].date;
    var maxDate = dateDim.top(1)[0].date;
    var casesPerCountry = dc.seriesChart(chartID);
    casesPerCountry
    .width(768)
    .height(480)
    .chart(function(c) { return dc.lineChart(c).curve(d3.curveBasis); })
    .seriesSort(d3.descending)
    .x(d3.scaleTime().domain([minDate,maxDate]))
    .yAxisLabel("Confirmed COVID-19 Cases")
    .xAxisLabel("Date")
    .clipPadding(10)
    .elasticY(true)
    .dimension(countryDim)
    .group(countryGroup)
    .seriesAccessor(d =>  "Country: " + d.key[0])
    .keyAccessor(d => d.key[1])
    .valueAccessor(d => +d.value)
    .legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
    casesPerCountry.margins().left += 40;
}
