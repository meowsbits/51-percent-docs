import {ECBP1100_Penalty} from './utils';
import Chart from 'chart.js/auto';

var humanFormat = require("human-format");

const summaryTable = document.querySelector('#summary-table');

// GetBacon()
//   .then(res => {
//     const markup = res.reduce((acc, val) => (acc += `<p>${val}</p>`), '');
//     baconEl.innerHTML = markup;
//   })
//   .catch(err => (baconEl.innerHTML = err));

let blockReward = 2.56;
const input_blockReward = document.getElementById('block-reward');
input_blockReward.value = blockReward;
input_blockReward.onchange = function () {
    blockReward = this.value;
    dataToUI();
}

const blocksPerHour = 60.0 * 60 / 13.0;

let usdETC = 36.0;
const input_usdETC = document.getElementById('usd-etc');
input_usdETC.value = usdETC;
input_usdETC.onchange = function () {
    usdETC = this.value;
    dataToUI();
}

// marketPriceHashrate defines the profit of a renter of hashrate in ETC/hour.
//
// We assume that the rental price for hashrate is higher than
// the profit of the miners using the hardware for mining (rather than renting).
//
// If this were not true, and the price were LOWER,
// the market should discover an arbitrage
// and move rental hashrate to miner hashrate.
//
//
// This value is defined as HOW MUCH MORE ETC/HOUR THE RENTER PAYS
// compared to how much they could EARN if they were mining.
const empiricalCost_Ethash_930THs_24h_ETH = 12910.1;
const empiricalReward_Ethash_24h_ETH = 60 * 60 * 24 / 13.5 * 2; // =12800

let marketHashrateRentalCost =
    empiricalCost_Ethash_930THs_24h_ETH /
    empiricalReward_Ethash_24h_ETH; // eg. 1.0085
marketHashrateRentalCost = marketHashrateRentalCost.toFixed(4)

const input_marketHashrateRentalCost = document.getElementById('hashrate-rental-cost');
input_marketHashrateRentalCost.value = marketHashrateRentalCost;
input_marketHashrateRentalCost.onchange = function () {
    marketHashrateRentalCost = this.value;
    dataToUI();
}

function blockEmissionETC(hours) {
    return blocksPerHour * blockReward * hours;
}

const attackDurationVals = [5, 10, 15, 30, 60, 90, 120,
    60 * 3, 60 * 4, 60 * 5, 60 * 6, 60 * 7, 60 * 8,
    60 * 16, 60 * 24];

function buildData() {
    let data = {
        rows: [],
    };

    // Build Rows for table.
    for (let v of attackDurationVals) {
        const basisV = blockEmissionETC(v / 60) * usdETC;
        const costV = -1 * (basisV * marketHashrateRentalCost);
        const revenueV = basisV;
        const penalizedCostV = costV * ECBP1100_Penalty(v * 60);

        let obj = {
            duration: v, // minutes
            blocks: v / 60 * blocksPerHour,
            cost: costV,
            revenue: revenueV,
            penalty: ECBP1100_Penalty(v * 60),
            penalizedCost: penalizedCostV,
        }
        data.rows.push(obj);
    }

    return Promise.resolve(data);
}

function fillTable(data) {

    for (let r of data.rows) {
        const row = document.createElement('tr');
        row.classList.add('summary-row');

        const duration = document.createElement('td');
        const blocks = document.createElement('td');
        const cost = document.createElement('td');
        const revenue = document.createElement('td');
        const net = document.createElement('td');
        const messPenalty = document.createElement('td');
        const penalizedCost = document.createElement('td');
        const penalizedNet = document.createElement('td');

        duration.innerHTML = `${r.duration} minutes`;
        blocks.innerHTML = `${Math.round(r.blocks)}`;
        cost.innerHTML = r.cost.toFixed(0);
        revenue.innerHTML = r.revenue.toFixed(0);
        net.innerHTML = (r.revenue + r.cost).toFixed(0);
        messPenalty.innerHTML = r.penalty.toFixed(2);
        penalizedCost.innerHTML = r.penalizedCost.toFixed(0);
        penalizedNet.innerHTML = (r.revenue + r.penalizedCost).toFixed(0);

        row.appendChild(duration);
        row.appendChild(blocks);
        row.appendChild(cost);
        row.appendChild(revenue);
        row.appendChild(net);
        row.appendChild(messPenalty);
        row.appendChild(penalizedCost);
        row.appendChild(penalizedNet);

        summaryTable.appendChild(row);
    }
}

const ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {});

function chart(data) {
    console.log("chart data", data);

    let attackCostObjectData = data.rows.map(v => {
        return {x: v.duration, y: v.penalizedCost + v.revenue};
    });

    attackCostObjectData = attackCostObjectData.filter(v => v.x < 600);

    console.log("line data", attackCostObjectData);

    myChart.destroy();

    let chartData = {
        datasets: [
            {
                label: 'Attack Net under MESS',
                data: attackCostObjectData,
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
            }
        ]
    };

    myChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            plugins: {
                title: {
                    text: 'Attack Net under MESS',
                    display: true,
                },
                legend: {
                    display: false,
                }
            },
            layout: {
                padding: {
                    top: 23,
                    bototm: 23,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Attack Duration in Minutes',
                    },
                    min: 0,
                    max: Math.max(...attackCostObjectData.map(v => v.x)),
                    type: 'linear',
                },
                y: {
                    title: {
                        display: true,
                        text: 'Net Cost + Expected Revenue',
                    },
                    // min: -10000000,
                    max: 0,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function (value, index, ticks) {
                            return '$' + humanFormat(value, {
                                    maxDecimals: 'auto',
                                }
                            );
                        }
                    }
                },
            }
        }
    });
}

const dataToUI = () => {
    return buildData().then(data => {
        document.querySelectorAll('.summary-row').forEach(row => {
            row.remove();
        })
        fillTable(data);
        chart(data);
    });
}

dataToUI();

