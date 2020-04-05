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
    totalCasesRecorded(ndx, "#totalConfirmedCases")
    casesPerCountry(ndx, '#casesPerCountry')
});


var totalCasesRecorded = (ndx, chartID) => {
    var totalCasesDim = ndx.dimension(dc.pluck('Total confirmed cases of COVID-19 (cases)'));
    var totalCasesGroup = totalCasesDim.groupAll();
    var totalCases = dc.numberDisplay(chartID);
    totalCases
    .formatNumber(d3.format('d'))
    .valueAccessor(function(d) {
        return +d.value;
    })
    .group(totalCasesGroup)
}

function casesPerCountry(ndx, chartID) {
    var countryDim = ndx.dimension(dc.pluck('Entity'));
    var countryGroup = countryDim.group()
    var casesPerCountry = dc.pieChart(chartID)
    casesPerCountry
    .width(768)
    .height(480)
    .dimension(countryDim)
    .group(countryGroup)
}
