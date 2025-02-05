import Order from '../models/Order.js';
import Analytics from '../models/Analytics.js';
import Menu from '../models/Menu.js';

export const generateDailySalesReport = async (req, res) => {
  try {
    const date = new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      }
    ]);

    // Create new Analytics document
    const analyticsData = new Analytics({
      date: startOfDay,
      totalSales: dailyStats[0]?.totalSales || 0,
      orderCount: dailyStats[0]?.orderCount || 0,
      itemsSold: popularItems.map(item => ({
        menuItem: item._id,
        quantity: item.quantity,
        revenue: item.revenue
      }))
    });

    await analyticsData.save();

    res.json({
      date: startOfDay,
      salesSummary: dailyStats[0],
      popularItems,
      analyticsId: analyticsData._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          dailySales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue trends calculation
    const revenueTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Store monthly report in Analytics collection
    const monthlyAnalytics = new Analytics({
      date: startDate,
      totalSales: monthlySales.reduce((acc, day) => acc + day.dailySales, 0),
      orderCount: monthlySales.reduce((acc, day) => acc + day.orderCount, 0),
      reportType: 'monthly',
      monthlyData: {
        dailyBreakdown: monthlySales,
        revenueTrends: revenueTrends
      }
    });

    await monthlyAnalytics.save();

    res.json({
      month,
      year,
      monthlySales,
      revenueTrends,
      analyticsId: monthlyAnalytics._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPeakHoursAnalysis = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = new Date(date);

    const peakHours = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
            $lte: new Date(queryDate.setHours(23, 59, 59, 999))
          }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 } }
    ]);

    // Store peak hours in Analytics
    const analyticsDoc = await Analytics.findOne({ date: queryDate });
    if (analyticsDoc) {
      analyticsDoc.peakHours = peakHours.map(hour => ({
        timeSlot: `${hour._id}:00`,
        orderCount: hour.orderCount
      }));
      await analyticsDoc.save();
    }

    res.json({
      date: queryDate,
      peakHours,
      analyticsId: analyticsDoc?._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMenuPerformanceMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const menuMetrics = await Analytics.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      { $unwind: '$itemsSold' },
      {
        $group: {
          _id: '$itemsSold.menuItem',
          totalQuantity: { $sum: '$itemsSold.quantity' },
          totalRevenue: { $sum: '$itemsSold.revenue' }
        }
      },
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: '_id',
          as: 'menuInfo'
        }
      }
    ]);

    res.json({
      menuMetrics,
      topPerformers: menuMetrics.slice(0, 5),
      needsAttention: menuMetrics.slice(-5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};