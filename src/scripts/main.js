import { ECBP1100_Penalty } from './ecip-1100';
import Chart from 'chart.js/auto';
import Prism from 'prismjs';
import * as tocbot from "tocbot";

const humanFormat = require("human-format");

// Weirdly global vars that will be filled with fetch responses.
let ETC_Latest_Block = {};
let ETH_Latest_Block = {};
let ExchangeData = {
    "time": "2022-10-04T16:53:22.0000000Z",
    "asset_id_base": "ETC",
    "asset_id_quote": "USD",
    "rate": 27.724502988404161925542335229
};

// Summary Table
// -------------------------------------------------------------------------------

const attackDurationVals = [5, 10, 15, 30, 45, 60, 75, 90, 105, 120,
    60 * 3, 60 * 4, 60 * 5, 60 * 6, 60 * 7, 60 * 8, 60 * 12,
    60 * 16, 60 * 24, 60 * 32];

const terahash = 1000000000000;

const summaryTable = document.querySelector('#summary-table');
// const minerTable = document.querySelector('#eth-miners');

let blockReward = 2.56;
const input_blockReward = document.getElementById('block-reward');
input_blockReward.value = blockReward;
input_blockReward.onchange = function () {
    blockReward = this.value;
    dataToUI();
}

const blocksPerHour = 60.0 * 60 / 13.0;

let usdETC = Math.round(+ExchangeData.rate * 100) / 100 || 36;
const input_usdETC = document.getElementById('usd-etc');
input_usdETC.value = usdETC;
input_usdETC.onchange = function () {
    usdETC = this.value;
    dataToUI();
}

// const empiricalHashrate_ETH = parseInt(ETH_Latest_Block.result.difficulty, 16) / 13.5 / terahash; // TH/s

// These estimates are constant assumptions taken empirically from Nicehash.com on 20220804.
// They yield a default value of 1.0099 efficiency, which seems reasonable.
// Being slightly higher than 1 indicates that it is more profitable to mine ETH than it is to rent hashrate out for
// someone else to mine ETH.
// Of course, this is sensible for the on-demand hashrate marketplace.
// A lower value, below 1, would be reasonable for the miner owning their hashing capital outright.
const empiricalHashrate_ETH = 930; // TH/s
const empiricalCost_Ethash_1Ths_24h = 13.9; // ETH
const empiricalCost_Ethash_930THs_24h_ETH = empiricalCost_Ethash_1Ths_24h * empiricalHashrate_ETH;
const empiricalReward_Ethash_24h_ETH = 60 * 60 * 24 / 13.5 * 2; // =12800

let marketHashrateRentalCost =
    empiricalCost_Ethash_930THs_24h_ETH /
    empiricalReward_Ethash_24h_ETH;
marketHashrateRentalCost = marketHashrateRentalCost.toFixed(4) // eg. 1.0099

// input_hashrateCostRevenueRatio defines the profit of a renter of hashrate in ETC/hour.
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
const input_hashrateCostRevenueRatio = document.getElementById('hashrate-efficiency-ratio');
input_hashrateCostRevenueRatio.value = marketHashrateRentalCost;
input_hashrateCostRevenueRatio.onchange = function () {
    marketHashrateRentalCost = this.value;
    dataToUI();
}

function blockEmissionETC(hours) {
    return blocksPerHour * blockReward * hours;
}

// MiningEstimate is a constructor.
function MiningEstimate(durationMinutes) {
    const basisV = blockEmissionETC(durationMinutes / 60) * usdETC;
    const costV = -1 * (basisV * marketHashrateRentalCost);
    const revenueV = basisV;
    const penalizedCostV = costV * ECBP1100_Penalty(durationMinutes * 60);

    this.duration = durationMinutes; // minutes
    this.blocks = durationMinutes / 60 * blocksPerHour;
    this.cost = costV;
    this.revenue = revenueV;
    this.penalty = ECBP1100_Penalty(durationMinutes * 60);
    this.penalizedCost = penalizedCostV;
}

const miningEstimatePrototype = {
    toSummaryRowEl() {
        const row = document.createElement('tr');
        row.classList.add('summary-table-row');

        const duration = document.createElement('td');
        const blocks = document.createElement('td');
        const cost = document.createElement('td');
        const revenue = document.createElement('td');
        const net = document.createElement('td');
        const messPenalty = document.createElement('td');
        const penalizedCost = document.createElement('td');
        const penalizedNet = document.createElement('td');


        duration.innerHTML = `${formatDuration(this.duration)}`;
        blocks.innerHTML = `${Math.round(this.blocks)}`;
        cost.innerHTML = formatRowNumber(this.cost.toFixed(0));
        revenue.innerHTML = formatRowNumber(this.revenue.toFixed(0));
        net.innerHTML = formatRowNumber((this.revenue + this.cost).toFixed(0));
        messPenalty.innerHTML = this.penalty.toFixed(2);
        penalizedCost.innerHTML = formatRowNumber(this.penalizedCost.toFixed(0));
        penalizedNet.innerHTML = formatRowNumber((this.revenue + this.penalizedCost).toFixed(0));

        row.appendChild(duration);
        row.appendChild(blocks);
        row.appendChild(cost);
        row.appendChild(revenue);
        row.appendChild(net);
        row.appendChild(messPenalty);
        row.appendChild(penalizedCost);
        row.appendChild(penalizedNet);

        return row;
    }
};

Object.assign(MiningEstimate.prototype, miningEstimatePrototype);


function formatDuration(durationMinutes) {
    const days = Math.floor(durationMinutes / 60 / 24);
    const f = new Date(durationMinutes * 60 * 1000).toISOString();
    let hh = +f.substring(11, 13);
    if (days > 0) hh = +hh + (days * 24);
    return `${hh}h ${+f.substring(14, 16)}m`;
}

function formatRowNumber(num) {
    let classList = "positive";
    if (+num < 0) {
        classList = "negative";
    }
    let content = Math.abs(num);
    content = humanFormat(content).replace(/\ /g, '');
    return `<span class='number ${classList}'>${content}</span>`;
}

// Summary Chart
// -------------------------------------------------------------------------------

const summaryChartContext = document.getElementById('summary-chart').getContext('2d');
let summaryChartInstance = new Chart(summaryChartContext, {});

function summaryChart(data) {
    let attackCostObjectData = data.map(v => {
        return { x: v.duration, y: v.revenue + v.penalizedCost };
    });

    // Filter to show only first 8 hours. The rest is too much.
    // attackCostObjectData = attackCostObjectData.filter(v => v.x < 60*8);

    console.log("Summary Chart data", data);

    // We have to destroy the chart if we want to repaint it,
    // which we always do, since the chart variable is initialized globally.
    summaryChartInstance.destroy();

    let chartData = {
        datasets: [
            {
                label: 'Attack Cost under MESS',
                data: attackCostObjectData,
                backgroundColor: '#8B0000FF',
                clip: 5,
            }
        ]
    };

    summaryChartInstance = new Chart(summaryChartContext, {
        type: 'line',
        data: chartData,
        options: {
            plugins: {
                title: {
                    text: 'Attack Cost Accounting under MESS',
                    display: true,
                },
                legend: {
                    display: false,
                }
            },
            layout: {
                autoPadding: true,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Attack Duration',
                    },
                    min: 0,
                    max: Math.max(...attackCostObjectData.map(v => v.x)),
                    type: 'linear',
                    ticks: {
                        callback: function (value, index, values) {
                            return formatDuration(value);
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Net = Revenue - Expense',
                    },
                    position: 'right',
                    max: Math.max(...attackCostObjectData.map(v => v.y)),
                    min: Math.min(...attackCostObjectData.map(v => v.y)),
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

// MESS Penalty Chart
// -------------------------------------------------------------------------------
const messPenaltyChartContext = document.getElementById('mess-penalty-chart').getContext('2d');
let messPenaltyChartInstance = new Chart(messPenaltyChartContext, {});

function messPenaltyChart() {

    const data = [1, 2, 3, 4].concat(...attackDurationVals)
        .filter(el => el < 10 * 60)
        .map(v => {
            return { x: v, y: ECBP1100_Penalty(v * 60) };
        });

    messPenaltyChartInstance.destroy()
    const chartData = {
        datasets: [
            {
                label: 'MESS Penalty',
                data: data,
                backgroundColor: '#8B0000FF',
                clip: 5,
            }
        ]
    };

    messPenaltyChartInstance = new Chart(messPenaltyChartContext, {
        type: 'line',
        data: chartData,
        options: {
            plugins: {
                title: {
                    text: 'MESS Penalty Curve',
                    display: true,
                },
                legend: {
                    display: false,
                }
            },
            layout: {
                autoPadding: true,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Attack Duration',
                    },
                    min: 0,
                    max: Math.max(...data.map(v => v.x)),
                    type: 'linear',
                    ticks: {
                        callback: function (value, index, values) {
                            return formatDuration(value);
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Penalty TD Multiple',
                    },
                    max: Math.max(...data.map(v => v.y)),
                    min: Math.min(...data.map(v => v.y)),
                    ticks: {
                        // Include a dollar sign in the ticks
                        // callback: function (value, index, ticks) {
                        //     return '$' + humanFormat(value, {
                        //             maxDecimals: 'auto',
                        //         }
                        //     );
                        // }
                    }
                },
            }
        }
    });
}

// Confirmation Delay Estimator Tool
// -------------------------------------------------------------------------------

// getDurationForPenalizedCost returns the duration in minutes that are equivalent
// to the given penalized cost.
// This is: How long to wait for a transaction of X ETC value.
// It does something like a binary search on the duration.
// FIXME(hard):
// The logic is trial-and-error.
// It is not guaranteed to work.
// It is not guaranteed to be correct.
// It is not guaranteed to be fast.
// PS. Copilot wrote this comment for me.
/*
 returns: duration in minutes
 */
function getDurationForPenalizedCost(penalizedCost_USD) {
    penalizedCost_USD = Math.abs(penalizedCost_USD);

    const domainMin = 1; // 1 minute
    const domainMax = 60 * 24 * 30 * 6; // 6 months
    let seek = domainMax / 2; // middle of range

    // Define upper and lower bounds for the acceptable return value,
    // since we're just guesstimating here.
    // Note that the UPPER BOUND ONLY gets the margin of error.
    // We want the error to err long, because erring short would
    // err on the side risking a too-short confirmation delay.
    const boundLower = penalizedCost_USD;
    const boundUpper = penalizedCost_USD * 1.01; // 1% margin of error

    let count = 0; // Escape hatch.

    // delta is the amount of change in the domain (guesstimate) that we're making each iteration.
    // That is: how much to adjust our guess if we're not yet within the bounds.
    let delta = domainMax / 2 / 2;

    for (; true;) {

        // Exit if we've exceeded the escape hatch.
        count++;
        if (count > 1000) break;

        if (seek + delta > domainMax) {
            break;
        }
        if (seek - delta < domainMin) {
            break;
        }

        const obj = new MiningEstimate(seek);
        const net = Math.abs(obj.penalizedCost + obj.revenue);

        if (boundLower <= net && net <= boundUpper) {
            break;
        }

        if (net > boundUpper) {
            seek -= delta;
        } else {
            seek += delta;
        }
        delta /= 2;
    }
    // console.log(`Cost estimator finished in ${count} iterations.`);

    return seek;
}

const input_confirmationTool_USD = document.getElementById('confirmation-tool-usd');
const input_confirmationTool_ETC = document.getElementById('confirmation-tool-etc');

const output_confirmationToolTime = document.getElementById('confirmation-tool-output-time');
const output_confirmationToolBlocks = document.getElementById('confirmation-tool-output-blocks');
const output_confirmationToolTable = document.getElementById('confirmation-tool-output-table');

input_confirmationTool_USD.onchange = function () {
    input_confirmationTool_ETC.value = (input_confirmationTool_USD.value / usdETC).toFixed(3);

    const out = getDurationForPenalizedCost(this.value);

    output_confirmationToolTime.innerText = formatDuration(out);
    output_confirmationToolBlocks.innerText = (out / 60 * blocksPerHour).toFixed(0);

    output_confirmationToolTable.innerHTML = "";

    const row = new MiningEstimate(out).toSummaryRowEl();

    row.style.width = "100%";
    row.classList.remove('summary-table-row');
    output_confirmationToolTable.appendChild(row);
};

input_confirmationTool_ETC.onchange = function () {
    input_confirmationTool_USD.value = (this.value * usdETC).toFixed(2);
    input_confirmationTool_USD.onchange();
};


// ETH vs. ETC Potential Attackers Table
// -------------------------------------------------------------------------------

// https://etherscan.io/stat/miner?range=7&blocktype=blocks
// Tue Aug  2 09:42:24 PDT 2022
const empiricalMinerHashrateShares_ETH = [
    { address: "0xea674fdde714fd979de3edf0f56aa9716b898ec8", name: "Ethermine", percentage: 28.2545 },
    { address: "0x829bd824b016326a401d083b33d092293333a830", name: "F2Pool Old", percentage: 13.9257 },
    { address: "0x1ad91ee08f21be3de0ba2ba6918e714da6b45836", name: "Hiveon Pool", percentage: 10.1252 },
    { address: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8", name: "2Miners: PPLNS", percentage: 6.7623 },
    { address: "0x7f101fe45e6649a6fb8f3f8b43ed03d353f2b90c", name: "Flexpool.io", percentage: 5.5144 },
    { address: "0x2daa35962a6d43eb54c48367b33d0b379c930e5e", name: "Poolin 2", percentage: 3.7195 },
    { address: "0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5", name: "Nanopool", percentage: 2.8200 },
    { address: "0xab3b229eb4bcff881275e7ea2f0fd24eeac8c83a", name: "Miner: 0xab3...83a", percentage: 2.6984 },
    { address: "0xc730b028da66ebb14f20e67c68dd809fbc49890d", name: "Ezil.me : Ezil Pool 4", percentage: 2.5080 },
    { address: "0xcd458d7f11023556cc9058f729831a038cb8df9c", name: "Poolin 4", percentage: 2.4371 },
    { address: "0x3ecef08d0e2dad803847e052249bb4f8bff2d5bb", name: "MiningPoolHub", percentage: 2.2568 },
    { address: "0x646db8ffc21e7ddc2b6327448dd9fa560df41087", name: "Miner: 0x646...087", percentage: 1.9084 },
    { address: "0xc365c3315cf926351ccaf13fa7d19c8c4058c8e1", name: "Binance Pool", percentage: 1.8212 },
    { address: "0xb7e390864a90b7b923c9f9310c6f98aafe43f707", name: "Miner: 0xb7e...707", percentage: 1.7990 },
    { address: "0x2a20380dca5bc24d052acfbf79ba23e988ad0050", name: "Poolin 3", percentage: 1.5153 },
    { address: "0x5b310960a7922092fdcb9295ece336012f9cf87e", name: "BTC.com Pool 2", percentage: 1.3978 },
    { address: "0x8f03f1a3f10c05e7cccf75c1fd10168e06659be7", name: "Miner: 0x8f0...be7", percentage: 1.3553 },
    { address: "0x03e75d7dd38cce2e20ffee35ec914c57780a8e29", name: "GPUMINE Pool 1", percentage: 1.3026 },
    { address: "0x8b4de256180cfec54c436a470af50f9ee2813dbb", name: "SBI Crypto Pool", percentage: 1.2540 },
    { address: "0x28846f1ec065eea239152213373bb58b1c9fc93b", name: "Miner: 0x288...93B", percentage: 0.8995 },
];

function currentHashrate_TH(block) {
    return parseInt(block.difficulty, 16) / 13 / terahash;
}


function hashrateEstimatesDataToUI() {
    const hr_ETH = currentHashrate_TH(ETH_Latest_Block.result);
    const hr_ETC = currentHashrate_TH(ETC_Latest_Block.result);
    const hr_ETC_GlobalShare = (hr_ETC / (hr_ETH + hr_ETC) * 100);

    document.getElementById('eth-hashrate-current').innerHTML = hr_ETH.toFixed(1) + 'TH/s';
    document.getElementById('etc-hashrate-current').innerHTML = hr_ETC.toFixed(1) + 'TH/s';
    document.getElementById('global-hashrate').innerHTML = (hr_ETH + hr_ETC).toFixed(1) + 'TH/s';
    document.getElementById('etc-global-hashrate-share').innerHTML = hr_ETC_GlobalShare.toFixed(2) + '%';

    function formatAttackPotentialColumn(miner_hr) {
        let classname = "positive";
        if (miner_hr > hr_ETC) classname = "negative";

        return `<span class="number ${classname}">${miner_hr.toFixed(1)}TH/s (${(miner_hr / hr_ETC).toFixed(2)}x)</span>`;
    }

    for (let miner of empiricalMinerHashrateShares_ETH) {
        const row = document.createElement('tr');
        row.classList.add('miner-hashrate-estimate-row');

        const minerAddressCell = document.createElement('td');
        minerAddressCell.style.maxWidth = '5rem';
        minerAddressCell.style.overflow = 'hidden';
        const minerCell = document.createElement('td');
        const minerPercentageCell = document.createElement('td');
        const minerHashrateCell = document.createElement('td');

        minerAddressCell.innerHTML = miner.address;
        minerCell.innerHTML = miner.name;
        minerPercentageCell.innerHTML = miner.percentage.toFixed(2) + '%';

        const minerTH = (miner.percentage / 100 * (hr_ETH));
        minerHashrateCell.innerHTML = formatAttackPotentialColumn(minerTH);

        row.appendChild(minerAddressCell);
        row.appendChild(minerCell);
        row.appendChild(minerPercentageCell);
        row.appendChild(minerHashrateCell);

        minerTable.appendChild(row);
    }
}

// WhatToMine
// -------------------------------------------------------------------------------

// ======================================================================
// formats a given hashrate (H/s) to humand readable hashrate
// like xxx.yyy GH/s
// ======================================================================

var formatHashrate = function (rate, precision) {
    let unit = 'h/s';
    if (rate >= 1000) {
        rate /= 1000;
        unit = 'Kh/s';
    }
    if (rate >= 1000) {
        rate /= 1000;
        unit = 'Mh/s';
    }
    if (rate >= 1000) {
        rate /= 1000;
        unit = 'Gh/s';
    }
    if (rate >= 1000) {
        rate /= 1000;
        unit = 'Th/s';
    }
    if (rate >= 1000) {
        rate /= 1000;
        unit = 'Ph/s';
    }
    return (rate.toFixed(precision) + ' ' + unit);
}

const whatToMineTable = document.getElementById('applied-hashrate-shares');

function buildWhatToMineTable(whatToMineData) {
    let data = [];
    for (let coin of Object.keys(whatToMineData.coins)) {
        data.push({ name: coin, ...whatToMineData.coins[coin] });
    }
    data.sort((a, b) => b.nethash - a.nethash);
    for (let coin of data) {
        const row = document.createElement('tr');
        row.classList.add('whattomine-row');

        const coinname = document.createElement('td');
        coinname.innerHTML = `${coin.name} <sup>${coin.tag}</sup>`;
        const algorithm = document.createElement('td');
        algorithm.innerHTML = coin.algorithm;
        const nethash = document.createElement('td');
        nethash.innerHTML = formatHashrate(coin.nethash, 2);
        const nethashVsETC = document.createElement('td');
        nethashVsETC.innerHTML = `${(coin.nethash / whatToMineData.coins.EthereumClassic.nethash).toFixed(3)}`;
        if (coin.nethash < whatToMineData.coins.EthereumClassic.nethash) {
            nethashVsETC.innerHTML += ` = 1/${(1 / (coin.nethash / whatToMineData.coins.EthereumClassic.nethash)).toFixed(0)}`;
        }
        const marketcap = document.createElement('td');
        marketcap.innerHTML = coin.market_cap;


        row.appendChild(coinname);
        row.appendChild(algorithm);
        row.appendChild(nethash);
        row.appendChild(nethashVsETC);
        row.appendChild(marketcap);
        whatToMineTable.appendChild(row);
    }

}

// WhatToMine chart
// -------------------------------------------------------------------------------

const whatToMineChartCtx = document.getElementById('whattomine-chart').getContext('2d');
let whatToMineChartInstance = new Chart(whatToMineChartCtx, {});

function whatToMineChart(whatToMineData) {
    whatToMineChartInstance.destroy()
    let data = [];
    for (let coin of Object.keys(whatToMineData.coins)) {
        data.push({ name: coin, ...whatToMineData.coins[coin] });
    }
    data.sort((a, b) => b.nethash - a.nethash);
    const labels = data.map(coin => coin.name);
    const datasets = [{
        data: data.map(coin => coin.nethash),
    }];
    console.log("labels", labels);
    console.log("datasets", datasets);
    whatToMineChartInstance = new Chart(whatToMineChartCtx, {
        type: 'bar',
        data: {
            datasets: datasets,
            labels: labels,
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: "Hashrate",
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            return formatHashrate(value, 0);
                        }
                    }
                }
            }
        }
    })
}

// UI, Initializations
// -------------------------------------------------------------------------------

const dataToUI = () => {
    document.querySelectorAll('.summary-table-row').forEach(row => row.remove());
    const data = attackDurationVals.map(duration => new MiningEstimate(duration));
    data.forEach(el => summaryTable.appendChild(el.toSummaryRowEl()));
    summaryChart(data);
}

function init() {


    Promise.all([
        fetch('./assets/data/exchange_rates.json')
            .then(response => response.json())
            .then(data => {
                ExchangeData = data;
            }),
        fetch('./assets/data/rivet_etc_latest_block.json')
            .then(response => response.json())
            .then(data => {
                ETC_Latest_Block = data;
            }),
        fetch('./assets/data/rivet_eth_latest_block.json')
            .then(response => response.json())
            .then(data => {
                ETH_Latest_Block = data;
            }),
        fetch('./assets/data/whattomine_gpu.json')
            .then(response => response.json())
            .then(data => {
                console.log("whattomine_gpu", data);
                buildWhatToMineTable(data);
                whatToMineChart(data);
            }),
    ]).then(() => {

        console.log("ETC_latestBlock", ETC_Latest_Block);
        console.log("ETH_latestBlock", ETH_Latest_Block);


        // ETC
        const blockNumber = parseInt(ETC_Latest_Block.result.number, 16);

        const monetaryPolicyStart = 5000000, monetaryPolicyEpoch = 5000000;

        const currentMonetaryPolicyEpoch = Math.ceil((blockNumber - monetaryPolicyStart) / monetaryPolicyEpoch);
        const originalReward = 5;
        blockReward = originalReward * Math.pow(0.8, currentMonetaryPolicyEpoch);
        blockReward = Math.round(blockReward * 100) / 100;
        input_blockReward.value = blockReward;

        usdETC = Math.round(+ExchangeData.rate * 100) / 100 || 36;
        input_usdETC.value = usdETC;


        input_confirmationTool_USD.onchange(undefined); // Initialize.

        // hashrateEstimatesDataToUI();

        messPenaltyChart();

        // Syntax highlighting
        // Prism.highlightAll();
        const codeBlocks = document.querySelectorAll('pre code.prism');
        for (let i = 0; i < codeBlocks.length; i++) {
            Prism.highlightElement(codeBlocks[i]);
        }

        tocbot.init({
            // Where to render the table of contents.
            tocSelector: '.js-toc',
            // Where to grab the headings to build the table of contents.
            contentSelector: '.wrapper',
            // Which headings to grab inside of the contentSelector element.
            headingSelector: 'h2, h3, h4',
            // For headings inside relative or absolute positioned containers within content.
            hasInnerContainers: true,
            collapseDepth: 4,
            orderedList: false,
            // positionFixedSelector: '.my-position-fixed',
            // scrollSmoothOffset: 50,
            // headingsOffset: 10,
        });
        return dataToUI();
    });
}

init();


