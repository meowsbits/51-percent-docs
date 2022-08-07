// This module provides the code for ECIP-1100.
// It is port of the original code from core-geth.

const ecbp1100PolynomialVCurveFunctionDenominator = 128;
const ecbp1100PolynomialVXCap = 25132;
const ecbp1100PolynomialVHeight = ecbp1100PolynomialVCurveFunctionDenominator * 15 * 2;

/**
 * @param {number} x - Timestamp difference between local head and common ancestor (fork block)
 * @return {number} - The polynomial value at x
 */
export const ECBP1100_Penalty = (x) => {
    if (x > ecbp1100PolynomialVXCap) x = ecbp1100PolynomialVXCap;
    let xa = 3 * (x ** 2);
    let xb = (2 * (x ** 3)) / ecbp1100PolynomialVXCap;
    let y = xa - xb;
    y = y * ecbp1100PolynomialVHeight;
    y = y / ecbp1100PolynomialVXCap ** 2;
    y = y + ecbp1100PolynomialVCurveFunctionDenominator;
    y = y / ecbp1100PolynomialVCurveFunctionDenominator;
    return y;
};
