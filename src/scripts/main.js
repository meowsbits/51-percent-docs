import {ECBP1100_Penalty} from './utils';
import {ExchangeData} from "./data";
import Chart from 'chart.js/auto';
import {ETC_Latest_Block, ETH_Latest_Block} from "./chaindata";
import Prism from 'prismjs';

var humanFormat = require("human-format");

const summaryTable = document.querySelector('#summary-table');
const minerTable = document.querySelector('#eth-miners');

let blockReward = 2.56;
const input_blockReward = document.getElementById('block-reward');
input_blockReward.value = blockReward;
input_blockReward.onchange = function () {
    blockReward = this.value;
    dataToUI();
}

const blocksPerHour = 60.0 * 60 / 13.0;

let usdETC = Math.round(+ExchangeData[0].price * 100) / 100 || 36;
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
const empiricalHashrate_ETH = 930; // TH/s
const empiricalCost_Ethash_1Ths_24h = 13.9; // ETH
const empiricalCost_Ethash_930THs_24h_ETH = empiricalCost_Ethash_1Ths_24h * empiricalHashrate_ETH;
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
    60 * 16, 60 * 24 - 1];

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

function formatDuration(durationMinutes) {
    return `${new Date(durationMinutes * 60 * 1000).toISOString().substring(11, 16)}`;
}

function fillTable(data) {
    console.log("Summary Table data", data);
    function formatNumber(num) {
        let classList = "positive";
        if (+num < 0) {
            classList = "negative";
        }
        let content = Math.abs(num);
        content = humanFormat(content).replace(/\ /g, '');
        return `<span class='number ${classList}'>${content}</span>`;
    }

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


        duration.innerHTML = `${formatDuration(r.duration)}`;
        blocks.innerHTML = `${Math.round(r.blocks)}`;
        cost.innerHTML = formatNumber(r.cost.toFixed(0));
        revenue.innerHTML = formatNumber(r.revenue.toFixed(0));
        net.innerHTML = formatNumber((r.revenue + r.cost).toFixed(0));
        messPenalty.innerHTML = r.penalty.toFixed(2);
        penalizedCost.innerHTML = formatNumber(r.penalizedCost.toFixed(0));
        penalizedNet.innerHTML = formatNumber((r.revenue + r.penalizedCost).toFixed(0));

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
    let attackCostObjectData = data.rows.map(v => {
        return {x: v.duration, y: v.revenue + v.penalizedCost};
    });

    // Filter to show only first 8 hours. The rest is too much.
    attackCostObjectData = attackCostObjectData.filter(v => v.x < 60*8);

    console.log("Summary Chart data", data);

    // We have to destroy the chart if we want to repaint it,
    // which we always do, since the chart variable is initialized globally.
    myChart.destroy();

    let chartData = {
        datasets: [
            {
                label: 'Attack Net under MESS',
                data: attackCostObjectData,
                backgroundColor: '#8B0000FF',
            }
        ]
    };

    myChart = new Chart(ctx, {
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
                padding: {
                    top: 23,
                    bototm: 23,
                },
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
                        callback: function(value, index, values) {
                            return formatDuration(value);
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Net: Revenue - Expense',
                    },
                    // min: -10000000,
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


// https://etherscan.io/stat/miner?range=7&blocktype=blocks
// Tue Aug  2 09:42:24 PDT 2022
const empiricalMinerHashrateShares_ETH = [
    {address: "0xea674fdde714fd979de3edf0f56aa9716b898ec8", name: "Ethermine", percentage: 28.2545},
    {address: "0x829bd824b016326a401d083b33d092293333a830", name: "F2Pool Old", percentage: 13.9257},
    {address: "0x1ad91ee08f21be3de0ba2ba6918e714da6b45836", name: "Hiveon Pool", percentage: 10.1252},
    {address: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8", name: "2Miners: PPLNS", percentage: 6.7623},
    {address: "0x7f101fe45e6649a6fb8f3f8b43ed03d353f2b90c", name: "Flexpool.io", percentage: 5.5144},
    {address: "0x2daa35962a6d43eb54c48367b33d0b379c930e5e", name: "Poolin 2", percentage: 3.7195},
    {address: "0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5", name: "Nanopool", percentage: 2.8200},
    {address: "0xab3b229eb4bcff881275e7ea2f0fd24eeac8c83a", name: "Miner: 0xab3...83a", percentage: 2.6984},
    {address: "0xc730b028da66ebb14f20e67c68dd809fbc49890d", name: "Ezil.me : Ezil Pool 4", percentage: 2.5080},
    {address: "0xcd458d7f11023556cc9058f729831a038cb8df9c", name: "Poolin 4", percentage: 2.4371},
    {address: "0x3ecef08d0e2dad803847e052249bb4f8bff2d5bb", name: "MiningPoolHub", percentage: 2.2568},
    {address: "0x646db8ffc21e7ddc2b6327448dd9fa560df41087", name: "Miner: 0x646...087", percentage: 1.9084},
    {address: "0xc365c3315cf926351ccaf13fa7d19c8c4058c8e1", name: "Binance Pool", percentage: 1.8212},
    {address: "0xb7e390864a90b7b923c9f9310c6f98aafe43f707", name: "Miner: 0xb7e...707", percentage: 1.7990},
    {address: "0x2a20380dca5bc24d052acfbf79ba23e988ad0050", name: "Poolin 3", percentage: 1.5153},
    {address: "0x5b310960a7922092fdcb9295ece336012f9cf87e", name: "BTC.com Pool 2", percentage: 1.3978},
    {address: "0x8f03f1a3f10c05e7cccf75c1fd10168e06659be7", name: "Miner: 0x8f0...be7", percentage: 1.3553},
    {address: "0x03e75d7dd38cce2e20ffee35ec914c57780a8e29", name: "GPUMINE Pool 1", percentage: 1.3026},
    {address: "0x8b4de256180cfec54c436a470af50f9ee2813dbb", name: "SBI Crypto Pool", percentage: 1.2540},
    {address: "0x28846f1ec065eea239152213373bb58b1c9fc93b", name: "Miner: 0x288...93B", percentage: 0.8995},
];

const terahash = 1000000000000;
function currentHashrate_TH(chain) {
    let block = ETC_Latest_Block.result;
    if (chain === 'eth') block = ETH_Latest_Block.result;

    return parseInt(block.difficulty, 16) / 13 / terahash;
}


function hashrateEstimatesDataToUI() {
    const hr_ETH = currentHashrate_TH('eth');
    const hr_ETC = currentHashrate_TH('etc');
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
        row.classList.add('miner-row');

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

const dataToUI = () => {
    hashrateEstimatesDataToUI();

    buildData().then(data => {
        document.querySelectorAll('.summary-row').forEach(row => {
            row.remove();
        })
        fillTable(data);
        chart(data);
    });
}

function init() {

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

    // Syntax highlighting
    // Prism.highlightAll();
    const codeBlocks = document.querySelectorAll('pre code.prism');
    for (let i = 0; i < codeBlocks.length; i++) {
        Prism.highlightElement(codeBlocks[i]);
    }

    return dataToUI();
}

init();


