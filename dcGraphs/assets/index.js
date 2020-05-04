const TOTALCASES = 2619872;
var formatTime = d3.timeParse("%Y-%m-%d");
var totalCasesPerCountry = dc.seriesChart('#totalCasesPerCountry');
var dailyCasesPerCountry = dc.seriesChart('#dailyCasesPerCountry');
var totalDeathsPerCountry = dc.seriesChart('#fatalityRatePerCountry');


// Load Data
Promise.all([
  d3.csv('data/owid-covid-data.csv')
])
.then(([allCovid]) =>  {
    for (let d of allCovid) {
        d.Date = formatTime(d.date);
    }
    var allCovidndx = crossfilter(allCovid);
    totalCasesRecorded(allCovidndx, "#totalConfirmedCases");
    percentOfCases(allCovidndx, '#countryPercent');
    countryDropDown(allCovidndx, '#countryDropDown');
    highestCasesPerCountry(allCovidndx, '#topCountries');
    casesPerCountry(allCovidndx, totalCasesPerCountry, 'Total Cases');
    casesPerCountry(allCovidndx, dailyCasesPerCountry, 'New Cases');
    casesPerCountry(allCovidndx, totalDeathsPerCountry, 'Total Deaths');
    
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
                !(v.location).includes("Europe")
            )
                ? (v.date === '2020-04-26') 
                ? p.cases += parseInt(v['Total Cases'])
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
                !(v.location).includes("Europe")
            )
            ? (v.date === "2020-04-26") 
            ? p.cases -= parseInt(v['Total Cases'])
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
                !(v.location).includes("Europe")
            )
                ? (v.date === '2020-04-26') 
                ? p.cases += parseInt(v['Total Cases'])
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
                !(v.location).includes("Europe")
            )
            ? (v.date === "2020-04-26") 
            ? p.cases -= parseInt(v['Total Cases'])
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


// View Individual Country Dropdown
var countryDropDown = (ndx, chartID) => {
    var countriesDim = ndx.dimension(dc.pluck('location'));
    var countriesGroup = countriesDim.group();
    var countrySelect = dc.selectMenu(chartID);
    countrySelect
    .dimension(countriesDim)
    .group(countriesGroup)
    .controlsUseVisibility(true);
}


// Table Showing the Countries with the highest case count
var highestCasesPerCountry = (ndx, chartID) => {
    var countryDim = ndx.dimension(d => d.location);
    var countryGroup = countryDim.group().reduce(
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Asia") &&
                !(v.location).includes("Europe") &&
                v.date === '2020-04-26'
            )
                ? p.cases += parseInt(v['Total Cases'])
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
                !(v.location).includes("Europe") &&
                v.date === '2020-04-26'
            )
            ? p.cases -= parseInt(v['Total Cases'])
            : p
            return p;
        },
        () => {
            return {cases: 0};
        },
    )
    var countryTable = dc.dataTable(chartID)
    countryTable
    .width(768)
    .height(480)
    .dimension(reversible_group(countryGroup))
    .columns([d => d.key,
              d => d.value.cases])
    .sortBy(d => d.value.cases)
    .order(d3.descending)
    .size(Infinity)
    .endSlice(15)
    .showSections(true)
    countryTable.render();

    d3.selectAll('#select-direction input')
      .on('click', function() {
          // this.value is 'ascending' or 'descending'
          countryTable.order(d3[this.value]).redraw()
      });
}

  function reversible_group(group) {
      return {
          top: function(N) {
              return group.top(N);
          },
          bottom: function(N) {
              return group.top(Infinity).slice(-N).reverse();
          }
      };
  }


// Cases Per Country seriesChart
var casesPerCountry = (ndx, chartID, casesCountType) => {
    var dateDim = ndx.dimension(d => d.Date);
    var countryDim = ndx.dimension(d => [d.location, d.Date]);
    var countryGroup = countryDim.group().reduce(
        (p, v) => {
            (
                !(v.location).includes("World") &&
                !(v.location).includes("Oceania") &&
                !(v.location).includes("North America") &&
                !(v.location).includes("Africa") &&
                !(v.location).includes("Asia") &&
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
    var maxDate = dateDim.top(1)[0].Date;
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
    .elasticY(true)
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

