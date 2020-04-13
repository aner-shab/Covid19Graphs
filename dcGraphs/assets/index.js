// Load Data
Promise.all([
  d3.csv('data/total-cases-covid-19.csv'),
  d3.csv('data/daily-cases-covid-19.csv'),
  d3.csv('data/covid-19-total-confirmed-cases-vs-total-confirmed-deaths.csv'),
  d3.csv('data/coronavirus-cfr.csv')
])
.then(([totalCases, dailyCases, casesVsDeaths, fatalityRate]) =>  {
    var ndx = crossfilter(totalCases);
    var dailyCasesndx = crossfilter(dailyCases);
    var casesVsDeathsndx = crossfilter(casesVsDeaths);
    var fatalityRatendx = crossfilter(fatalityRate);
    totalCasesRecorded(ndx, "#totalConfirmedCases");
    countryDropDown(ndx, '#countryDropDown')
    casesPerCountry(ndx, '#casesPerCountry');
    dc.renderAll();
});


var totalCasesRecorded = (ndx, chartID) => {
    var totalCasesNumber = ndx.groupAll().reduce(
        (p, v) => {
            (v.Entity === "World") 
            ? (v.Date === "Apr 5, 2020") 
            ? p.cases = v['Total confirmed cases of COVID-19 (cases)']
            : p
            : p
            return p
        },
        (p, v) => {
            (v.Entity === "World") 
            ? (v.Date === "Apr 5, 2020") 
            ? p.cases = v['Total confirmed cases of COVID-19 (cases)']
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
    var countryDim = ndx.dimension(dc.pluck('Entity'));
    var countryGroup = countryDim.group()
    var casesPerCountry = dc.pieChart(chartID)
    casesPerCountry
    .width(768)
    .height(480)
    .dimension(countryDim)
    .group(countryGroup)
}
