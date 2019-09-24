# DuPont Model-visualization
Live Site: https://maxbildner.github.io/roe-visualization


### Summary: 
This project is a visualization of ROE (Return on Equity) for publicly listed US firms, inspired by Piet Mondrian paintings and the DuPont analysis.

The generated painting is a proportional area chart where each rectangle corresponds to a financial ratio.
The larger a rectangle's area, the larger the impact of that ratio on ROE.


### DuPont Analysis Background Info: 
The DuPont Analysis attempts to explain where the profitabiltiy (measured in Return on Equity ROE)
of a firm comes from. 

The 5-Component Model says that there are 5 factors that explain profitability:
ROE = 
1. How leveraged a company is (to what extent is the firm funded by debt)
	- Measured by the Equity Multiplier
	- Total Assets / Total Equity
2. How efficient a company is at usting its assets to generate revenue
	- measured by Asset Turnover Ratio
	- Revenues / Total Assets
3. Profitability from operations (Operating Efficiency)
	- Measured by Operating Margin
	- Operating Income / Revenue
4. Interest Burden
	- Earnings Before Taxes / Operating Income (or EBIT)
5. Tax Burden
	- Net Income / EBT


### Functionality
	- users can type in the name of a publicly listed company into a search bar
	- a graph will appear showing the breakdown of ROE (to what extent each factor affects ROE)
	- there are options/buttons to toggle between different graphs/visualizations


### Wireframe
![wireframe1](https://raw.githubusercontent.com/maxbildner/roe-visualization/master/wireframe2.png "wireframe 1")


### Technologies Employed
- Vanila JavaScript
- D3 for data mapping
- Webpack
- HTML/CSS


### MVPS
- 1 Search Bar. User can type in the name of a company by ticker or by name
- 2 Main Graph- displays breakdown of each factor
- 3 Legend & Dynamic fixed tooltip component. On hover of any rectangle, the name/percentage of the tooltip changes.


### Development Timeline
Day 1:
- review D3 Tutorial
- complete skeleton setup and basic page
- complete wireframes for different graphs
- find correct data/API
- start search bar

Day 2:
- search bar

Day 3:
- Main graph

Day 4:
- Main graph

Day 5:
- Tooltips, legend, styling

BONUS
- find new way to visualize data
- implement leap motion controller
