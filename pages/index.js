import React, { useState } from 'react';
import Head from 'next/head';
import fetch from 'node-fetch';
import Chart from 'react-google-charts';

const toppingsCounter = (p, n) => {
	n.toppings.forEach((item) => {
		if (p[item]) {
			p[item] = p[item] + 1;
		} else {
			p[item] = 1;
		}
	});

	return p;
};
// reducer
const combineToppingsCounter = (p, n) => {
	const key = n.toppings.sort().map((item) => item.split(' ').join('-')).join('_');
	if (p[key]) {
		p[key] = p[key] + 1;
	} else {
		p[key] = 1;
	}
	return p;
};

// sorter function
const sortToppings = (a, b) => {
	return parseInt(a[1]) < parseInt(b[1]) ? 1 : parseInt(a[1]) > parseInt(b[1]) ? -1 : 0;
};

const renderRow = (item, index) => {
	return (
		<div className="row" key={index + item[0]}>
			<div className="left">{item[0].split('_').join(' ')}:</div>
			<div className="right">{item[1]}</div>
		</div>
	);
};

const renderData = (data) => {
	return data.map(renderRow);
};

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatKey = (item) => {
	item[0] = item[0].split('_').map((item) => capitalizeFirstLetter(item)).join(' ');
	return item;
};

const formatDataToChart = (data) => {
	var result = [ [ 'Topping Combinations', 'Qty' ], ...data.map(formatKey) ];
	return result;
};

const GoogleGraph = ({ chartType, handleChartTypeChange, data, options }) => (
	<section>
		<select value={chartType} onChange={handleChartTypeChange}>
			<option value="PieChart">PieChart</option>
			<option value="BarChart">BarChart</option>
		</select>
		<Chart
			key={chartType}
			chartType={chartType}
			width={'80vw'}
			height={'100vh'}
			loader={<div>Loading Chart</div>}
			data={data}
			options={options}
			graphID={chartType}
		/>
	</section>
);

const Home = ({ data }) => {
	const [ chart, setChart ] = useState('BarChart');

	const handleChartTypeChange = (e) => {
		setChart(e.target.value);
	};
	return (
		<div className="container">
			<Head>
				<title>Create Next App</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<GoogleGraph
					data={formatDataToChart(data)}
					handleChartTypeChange={handleChartTypeChange}
					chartType={chart}
					options={{
						title: 'Top 20 Topping combinations',
						colors: [ '#0019E6', '#FFE800', '#FF6600', '#002C43', '#C32525' ]
					}}
				/>

				<h3> Top 20 Most frequently ordered pizza topping combinations</h3>
				<div className="grid">{data && Array.isArray(data) ? renderData(data) : null}</div>
			</main>

			<style jsx>{`
				.container {
					min-height: 100vh;
					padding: 0 0.5rem;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}

				main {
					padding: 5rem 0;
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}

				h3 {
					color: aquamarine;
				}

				.grid {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					flex-wrap: wrap;

					max-width: 800px;
					margin-top: 3px;
				}

				@media (max-width: 600px) {
					.grid {
						width: 100%;
						flex-direction: column;
					}
				}
			`}</style>

			<style jsx global>{`
				html,
				body {
					padding: 0;
					margin: 0;
					background-color: #333;
					color: #e8e8e8;
					font-family: "Courier New", Courier, monospace;
				}

				* {
					box-sizing: border-box;
				}
				.row {
					display: flex;
					justify-content: space-between;
					width: 40vw;
					border: 1px solid #e8e8e8;
					border-top: none;
				}

				.row:first-child {
					border-top: 1px solid #e8e8e8;
				}

				.row:nth-child(odd) {
					background-color: #464646;
				}

				.left {
					display: flex;
					justify-content: flex-start;
					text-transform: capitalize;
				}

				.right {
					display: flex;
					justify-content: flex-end;
				}
			`}</style>
		</div>
	);
};

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getStaticProps() {
	// Call an external API endpoint to get the info.
	const res = await fetch('https://www.olo.com/pizzas.json');
	const result = await res.json();
	const data = Object.entries(result.reduce(combineToppingsCounter, [])).sort(sortToppings).slice(0, 20);

	return {
		props: {
			data
		}
	};
}

export default Home;
