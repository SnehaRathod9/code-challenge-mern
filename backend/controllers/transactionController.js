const axios = require('axios');
const Transaction = require('../models/Transaction');

exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.insertMany(transactions);

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing database', error });
  }
};

exports.listTransactions = async (req, res) => {
  try {
    const { month, search, page = 1, perPage = 10 } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth() + 1;
    const query = {
      dateOfSale: {
        $gte: new Date(`2020-${monthIndex}-01`),
        $lte: new Date(`2020-${monthIndex}-31`)
      }
    };

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { price: new RegExp(search, 'i') },
      ];
    }

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth() + 1;

    const totalSaleAmount = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(`2020-${monthIndex}-01`),
            $lte: new Date(`2020-${monthIndex}-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' },
        },
      },
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: {
        $gte: new Date(`2020-${monthIndex}-01`),
        $lte: new Date(`2020-${monthIndex}-31`),
      },
      isSold: true,
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      dateOfSale: {
        $gte: new Date(`2020-${monthIndex}-01`),
        $lte: new Date(`2020-${monthIndex}-31`),
      },
      isSold: false,
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
};

exports.getBarChart = async (req, res) => {
  try {
    const { month } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth() + 1;

    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity },
    ];

    const result = await Promise.all(priceRanges.map(async (range) => {
      const count = await Transaction.countDocuments({
        dateOfSale: {
          $gte: new Date(`2020-${monthIndex}-01`),
          $lte: new Date(`2020-${monthIndex}-31`),
        },
        price: {
          $gte: range.min,
          $lte: range.max,
        },
      });
      return { range: range.range, count };
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bar chart data', error });
  }
};

exports.getPieChart = async (req, res) => {
  try {
    const { month } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth() + 1;

    const categories = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(`2020-${monthIndex}-01`),
            $lte: new Date(`2020-${monthIndex}-31`),
          },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pie chart data', error });
  }
};

exports.getAllData = async (req, res) => {
  try {
    const { month } = req.query;

    const transactions = await Transaction.find({
      dateOfSale: {
        $gte: new Date(`2020-${month}-01`),
        $lte: new Date(`2020-${month}-31`),
      },
    });

    const statistics = await exports.getStatistics(req, res);
    const barChart = await exports.getBarChart(req, res);
    const pieChart = await exports.getPieChart(req, res);

    res.status(200).json({ transactions, statistics, barChart, pieChart });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all data', error });
  }
};
