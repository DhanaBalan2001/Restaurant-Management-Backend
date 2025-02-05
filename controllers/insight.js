import { DishRecommendationSystem } from '../services/mlService.js';
import Order from '../models/Order.js';

const recommendationSystem = new DishRecommendationSystem();

export const generateDishInsights = async (req, res) => {
  try {
    const historicalOrders = await Order.find({})
      .populate('items.menuItem')
      .sort('-createdAt')
      .limit(1000);

    // Train model with historical data
    await recommendationSystem.trainModel(historicalOrders);

    const currentContext = {
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      season: getCurrentSeason(),
      orderFrequency: await getOrderFrequency()
    };

    const recommendations = await recommendationSystem.predictPopularDishes(currentContext);

    // Get customer preferences
    const customerPreferences = await analyzeCustomerPreferences(historicalOrders);

    res.json({
      recommendations,
      customerPreferences,
      trendingCombinations: await analyzeTrendingCombinations(historicalOrders)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function analyzeTrendingCombinations(orders) {
  const combinations = orders.reduce((acc, order) => {
    const items = order.items.map(item => item.menuItem.name);
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const combo = [items[i], items[j]].sort().join('_');
        acc[combo] = (acc[combo] || 0) + 1;
      }
    }
    return acc;
  }, {});

  return Object.entries(combinations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
}