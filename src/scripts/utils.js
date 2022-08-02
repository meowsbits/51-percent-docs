// export const GetBacon = () => {
//   const body = fetch('https://baconipsum.com/api/?type=all-meat&paras=3').then(
//     res => res.json()
//   );
//
//   return body;
// };

const ecbp1100PolynomialVCurveFunctionDenominator = 128;
const ecbp1100PolynomialVXCap = 25132;
const ecbp1100PolynomialVHeight = ecbp1100PolynomialVCurveFunctionDenominator * 15 * 2;

export const ECBP1100_Polynomial = (x) => {
    if (x > ecbp1100PolynomialVXCap) x = ecbp1100PolynomialVXCap;

    let xa = 3 * (x ** 2);
    let xb = (2 * (x ** 3)) / ecbp1100PolynomialVXCap;
    let out = xa - xb;

    out = out * ecbp1100PolynomialVHeight;

    const xcap2 = ecbp1100PolynomialVXCap ** 2;
    out = out / xcap2;

    out = out + ecbp1100PolynomialVCurveFunctionDenominator;

    return out;
};

export const ECBP1100_Penalty = (x) => {
    return ECBP1100_Polynomial(x) / ecbp1100PolynomialVCurveFunctionDenominator;
}

console.log(ECBP1100_Penalty(60 * 60 * 2));
