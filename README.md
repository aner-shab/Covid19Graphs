## Covid-19 Statistics Shown in Data Dashboards Using Various Charting Libraries

This COVID-19 Mini Dashboard highlights countries across the globe have been affected by the COVID-19 pandemic and how those countries have responded to it.

#### UX and Features

- As a user, I would like to gather information about testing availability in affected countries.
  - Row chart showing total tests available in specific countries, and tests available per thousand people in each country.
  - The chart is displayed in two separate tabs, allowing users to toggle between the two.

- As a user, I would like to derive insights on how affected countries have flattened the curve.
  - SeriesChart displaying the number of new cases each day over the duration of January 2020 to April 2020.
  - Ability to filter on a specific date range with the RangeChart to get a closer look at a specific time frame.

- As a user, I would like to see the total statistics around how many fatalities have been caused by COVID-19.
  - Statistics card showing total fatalities and percentage of global fatalities that the dashboard is currently displaying. 
  - Percentage of Global Fatalities card displaying the percentage of fatalities the current filter(s) covers.
  - Total number of fatalities card also displaying the number of fatalities the current filter(s) covers.

- As a user, I would like to see the countries with the highest number of cases and the lowest number of cases.
  - Table showing the top 15 and bottom 15 affected countries, ordered by case number. Total recoveries and total fatalities for these countries is also included.
  - Table showing the the top 15 and bottom 15 affected countries, ordered by cases per million people in that country. Total recoveries per million and total fatalities per million for these countries is also included.
  - Both tables presented in a single card, allowing the user to toggle between. 
  - Ability to toggle between ascending and descending for both tables.

- As a user, I would like to see how one country's case total over the current elapsed period of the pandemic compares to another country's case totals. 
- As a user, I would like to see how one country's death toll over the current elapsed period of the pandemic compares to another country's case totals.
  - The seriesChart shows each individual country's case and fatality data, allowing the user to compare one country against others. 


#### Technologies 
- [DC.js v3.2.1](http://dc-js.github.io/dc.js/)
- [D3.js v5.15.1](https://d3js.org)
- [Semantic UI v2.4.2](http://www.semantic-ui.com/)


#### Deployment
- This site is hosted on GitHub Pages, deployed from the Master Branch

#### Acknowledgements
Data Aquired from [Our World In Data](https://ourworldindata.org/coronavirus)

CSV Used:
- owid-covid-data.csv

##### For Educational Use Only