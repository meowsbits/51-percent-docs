/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/main.js":
/*!*****************************!*\
  !*** ./src/scripts/main.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./src/scripts/utils.js\");\nfunction _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === \"undefined\" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === \"number\") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError(\"Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\n\nvar summaryTable = document.querySelector('#summary-table'); // GetBacon()\n//   .then(res => {\n//     const markup = res.reduce((acc, val) => (acc += `<p>${val}</p>`), '');\n//     baconEl.innerHTML = markup;\n//   })\n//   .catch(err => (baconEl.innerHTML = err));\n\nvar blockReward = 2.56;\nvar input_blockReward = document.getElementById('block-reward');\ninput_blockReward.value = blockReward;\n\ninput_blockReward.onchange = function () {\n  blockReward = this.value;\n  document.querySelectorAll('.summary-row').forEach(function (row) {\n    row.remove();\n  });\n  fillTable();\n};\n\nvar blocksPerHour = 60.0 * 60 / 13.0;\nvar usdETC = 36.0;\nvar input_usdETC = document.getElementById('usd-etc');\ninput_usdETC.value = usdETC;\n\ninput_usdETC.onchange = function () {\n  usdETC = this.value;\n  document.querySelectorAll('.summary-row').forEach(function (row) {\n    row.remove();\n  });\n  fillTable();\n}; // marketPriceHashrate defines the profit of a renter of hashrate in ETC/hour.\n//\n// We assume that the rental price for hashrate is higher than\n// the profit of the miners using the hardware for mining (rather than renting).\n//\n// If this were not true, and the price were LOWER,\n// the market should discover an arbitrage\n// and move rental hashrate to miner hashrate.\n//\n//\n// This value is defined as HOW MUCH MORE ETC/HOUR THE RENTER PAYS\n// compared to how much they could EARN if they were mining.\n\n\nvar empiricalCost_Ethash_930THs_24h_ETH = 12910.1;\nvar empiricalReward_Ethash_24h_ETH = 60 * 60 * 24 / 13.5 * 2; // =12800\n\nvar marketHashrateRentalCost = empiricalCost_Ethash_930THs_24h_ETH / empiricalReward_Ethash_24h_ETH; // eg. 1.0085\n\nmarketHashrateRentalCost = marketHashrateRentalCost.toFixed(4);\nvar input_marketHashrateRentalCost = document.getElementById('hashrate-rental-cost');\ninput_marketHashrateRentalCost.value = marketHashrateRentalCost;\n\ninput_marketHashrateRentalCost.onchange = function () {\n  marketHashrateRentalCost = this.value;\n  document.querySelectorAll('.summary-row').forEach(function (row) {\n    row.remove();\n  });\n  fillTable();\n};\n\nfunction blockEmissionETC(hours) {\n  return blocksPerHour * blockReward * hours;\n}\n\nvar attackDurationVals = [5, 10, 15, 30, 60, 90, 120, 60 * 3, 60 * 4, 60 * 5, 60 * 6, 60 * 7, 60 * 8];\n\nfunction fillTable() {\n  var _iterator = _createForOfIteratorHelper(attackDurationVals),\n      _step;\n\n  try {\n    for (_iterator.s(); !(_step = _iterator.n()).done;) {\n      var v = _step.value;\n      var row = document.createElement('tr');\n      row.classList.add('summary-row');\n      var duration = document.createElement('td');\n      var blocks = document.createElement('td');\n      var cost = document.createElement('td');\n      var revenue = document.createElement('td');\n      var net = document.createElement('td');\n      var messPenalty = document.createElement('td');\n      var penalizedCost = document.createElement('td');\n      var penalizedNet = document.createElement('td');\n      duration.innerHTML = \"\".concat(v, \" minutes\");\n      blocks.innerHTML = \"\".concat(Math.round(v / 60 * blocksPerHour));\n      var basisV = blockEmissionETC(v / 60) * usdETC;\n      var costV = -1 * (basisV * marketHashrateRentalCost);\n      cost.innerHTML = costV.toFixed(0);\n      var revenueV = basisV;\n      revenue.innerHTML = revenueV.toFixed(0);\n      net.innerHTML = (revenueV + costV).toFixed(0);\n      messPenalty.innerHTML = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.ECBP1100_Penalty)(v * 60).toFixed(2);\n      var penalizedCostV = costV * (0,_utils__WEBPACK_IMPORTED_MODULE_0__.ECBP1100_Penalty)(v * 60);\n      penalizedCost.innerHTML = penalizedCostV.toFixed(0);\n      penalizedNet.innerHTML = (revenueV + penalizedCostV).toFixed(0);\n      row.appendChild(duration);\n      row.appendChild(blocks);\n      row.appendChild(cost);\n      row.appendChild(revenue);\n      row.appendChild(net);\n      row.appendChild(messPenalty);\n      row.appendChild(penalizedCost);\n      row.appendChild(penalizedNet);\n      summaryTable.appendChild(row);\n    }\n  } catch (err) {\n    _iterator.e(err);\n  } finally {\n    _iterator.f();\n  }\n}\n\nfillTable();\n\n//# sourceURL=webpack://live-reload-vanilla-website-template/./src/scripts/main.js?");

/***/ }),

/***/ "./src/scripts/utils.js":
/*!******************************!*\
  !*** ./src/scripts/utils.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ECBP1100_Polynomial\": () => /* binding */ ECBP1100_Polynomial,\n/* harmony export */   \"ECBP1100_Penalty\": () => /* binding */ ECBP1100_Penalty\n/* harmony export */ });\n// export const GetBacon = () => {\n//   const body = fetch('https://baconipsum.com/api/?type=all-meat&paras=3').then(\n//     res => res.json()\n//   );\n//\n//   return body;\n// };\nvar ecbp1100PolynomialVCurveFunctionDenominator = 128;\nvar ecbp1100PolynomialVXCap = 25132;\nvar ecbp1100PolynomialVHeight = ecbp1100PolynomialVCurveFunctionDenominator * 15 * 2;\nvar ECBP1100_Polynomial = function ECBP1100_Polynomial(x) {\n  if (x > ecbp1100PolynomialVXCap) x = ecbp1100PolynomialVXCap;\n  var xa = 3 * Math.pow(x, 2);\n  var xb = 2 * Math.pow(x, 3) / ecbp1100PolynomialVXCap;\n  var out = xa - xb;\n  out = out * ecbp1100PolynomialVHeight;\n  var xcap2 = Math.pow(ecbp1100PolynomialVXCap, 2);\n  out = out / xcap2;\n  out = out + ecbp1100PolynomialVCurveFunctionDenominator;\n  return out;\n};\nvar ECBP1100_Penalty = function ECBP1100_Penalty(x) {\n  return ECBP1100_Polynomial(x) / ecbp1100PolynomialVCurveFunctionDenominator;\n};\n\n//# sourceURL=webpack://live-reload-vanilla-website-template/./src/scripts/utils.js?");

/***/ }),

/***/ "./src/styles/main.scss":
/*!******************************!*\
  !*** ./src/styles/main.scss ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://live-reload-vanilla-website-template/./src/styles/main.scss?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/scripts/main.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ 	__webpack_require__("./src/styles/main.scss");
/******/ })()
;