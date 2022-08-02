import { ECBP1100_Penalty } from './utils';

const summaryTable = document.querySelector('#summary-table');

// GetBacon()
//   .then(res => {
//     const markup = res.reduce((acc, val) => (acc += `<p>${val}</p>`), '');
//     baconEl.innerHTML = markup;
//   })
//   .catch(err => (baconEl.innerHTML = err));

const blockReward = 2.56;
const blocksPerHour = 60.0 * 60 / 13.0;
const usdETC = 36.0;

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
const empiricalReward_Ethash_24h_ETH =  60 * 60 *24 / 13.5 * 2; // =12800
const marketHashrateRentalCost =
    empiricalCost_Ethash_930THs_24h_ETH /
    empiricalReward_Ethash_24h_ETH; // eg. 1.0085

function blockEmissionETC(hours) {
    return blocksPerHour * blockReward * hours;
}

const attackDurationVals = [5, 10, 15, 30, 60, 90, 120,
    60 *3, 60*4, 60*5, 60*6, 60*7, 60*8];

for (let v of attackDurationVals) {
    const row = document.createElement('tr');
    const duration = document.createElement('td');
    const blocks = document.createElement('td');
    const cost = document.createElement('td');
    const revenue = document.createElement('td');
    const net = document.createElement('td');
    const messPenalty = document.createElement('td');
    const penalizedCost = document.createElement('td');
    const penalizedNet = document.createElement('td');

    duration.innerHTML = `${v} minutes`;
    blocks.innerHTML = `${Math.round(v / 60 * blocksPerHour)}`;

    const basisV = blockEmissionETC(v / 60) * usdETC;
    const costV = (basisV * marketHashrateRentalCost);
    cost.innerHTML = costV.toFixed(0);

    const revenueV = basisV;
    revenue.innerHTML = revenueV.toFixed(0);

    net.innerHTML = (revenueV - costV).toFixed(0);

    messPenalty.innerHTML = ECBP1100_Penalty(v * 60).toFixed(2);

    penalizedCost.innerHTML = (costV * ECBP1100_Penalty(v * 60)).toFixed(0);

    penalizedNet.innerHTML = (revenueV - penalizedCost.innerHTML).toFixed(0);

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
