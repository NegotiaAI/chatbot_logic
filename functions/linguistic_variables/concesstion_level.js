/**
 * We coonsider that if the user is positive irrespective of their prices, they could still end up buying
 * If the concession level remains constant twice it is considered to have decreased,decreased is set to true
 */



// Function to calculate percentage discounts relative to p1
 function calculatePercentageDiscounts(prices, p1) {
    console.log('Received prices:', prices);
    if (!Array.isArray(prices)) {
        throw new Error('prices must be an array.');
    }
    return prices.map(price => ((p1 - price) / p1) * 100);
}

// Function to determine if the percentage discount is increasing, decreasing, or constant
 function getDiscountTrend(percentageDiscounts) {
    if (percentageDiscounts.length < 2) {
        throw new Error('At least two percentage discounts are required to determine the trend.');
    }

    const changes = [];
    for (let i = 1; i < percentageDiscounts.length; i++) {
        const change = percentageDiscounts[i] - percentageDiscounts[i - 1];
        changes.push(change);
    }

    const totalChange = changes.reduce((sum, change) => sum + change, 0);
    const averageChange = totalChange / changes.length;

    if (averageChange > 1) {
        return 'decreasing'; // Discount is increasing
    } else if (averageChange < -1) {
        return 'increasing'; // Discount is decreasing
    } else {
        return 'constant'; // Discount is constant or not fluctuating much
    }
}

// Membership function for percentage discount trend
 function getDiscountTrendMembership(trend) {
    const increasing = trend === 'increasing' ? 1 : 0;
    const decreasing = trend === 'decreasing' ? 1 : 0;
    const constant = trend === 'constant' ? 1 : 0;

    return { increasing, decreasing, constant };
}

// Membership function for sentiment confidence
 function getConfidenceMembership(confidence) {
    const low = Math.max(0, 1 - (confidence / 0.3)); // Low confidence
    const medium = Math.max(0, 1 - Math.abs((confidence - 0.5) / 0.2)); // Medium confidence
    const high = Math.max(0, (confidence - 0.7) / 0.3); // High confidence
    return { low, medium, high };
}

// Function to determine Concession Level (CL) using fuzzy logic
async function determineCL(prices, p1, sentiment, confidence) {
    const percentageDiscounts = calculatePercentageDiscounts(prices, p1);
    const discountTrend = getDiscountTrend(percentageDiscounts);
    const discountTrendMembership = getDiscountTrendMembership(discountTrend);
    const confidenceMembership = getConfidenceMembership(confidence);

    // Fuzzy rules
    let CL = { low: 0, moderate: 0, high: 0 };
    console.log(discountTrendMembership)
    console.log(confidenceMembership)
    if (sentiment === 'positive') {
        CL.moderate = Math.max(discountTrendMembership.decreasing,discountTrendMembership.constant,confidenceMembership.medium);
        CL.high = Math.max(discountTrendMembership.increasing, confidenceMembership.high);
    } else if (sentiment === 'negative') {
        CL.low = Math.max(discountTrendMembership.constant,discountTrendMembership.decreasing, confidenceMembership.high);
        CL.moderate = Math.max(discountTrendMembership.increasing, confidenceMembership.medium);
    }

    // Defuzzify (e.g., centroid method)
    const total = CL.low + CL.moderate + CL.high;
    console.log("Total: "+total)
    if (total === 0) return 'moderate'; // Default

    const centroid = (CL.low * 0 + CL.moderate * 50 + CL.high * 100) / total;
    console.log("Centroid: "+centroid)
    if (centroid < 33) return 'low';
    else if (centroid < 73) return 'moderate';
    else return 'high';
}

// Export functions
export { determineCL, calculatePercentageDiscounts };