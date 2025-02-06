const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Review = require('../models/Review');

router.get('/dashboard', protect, async (req, res) => {
  try {
    const { genre, year, rating } = req.query;

    // ساخت کوئری برای فیلتر کردن فیلم‌ها
    const query = {};
    if (genre) {
      query.genre = { $regex: new RegExp(genre, 'i') };
    }
    if (year) {
      query.releaseYear = parseInt(year);
    }
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // دریافت فیلم‌ها بر اساس فیلتر (محدود به 20 فیلم)
    const movies = await Movie.find(query).limit(20);

    // دریافت دوستان کاربر فعلی
    const user = await User.findById(req.user._id).populate('following');
    const friendsIds = user.following.map(friend => friend._id);

    // دریافت فعالیت‌های دوستان (فرض می‌کنیم فعالیت‌ها شامل نقدها است)
    const friendsActivities = await Review.find({ user: { $in: friendsIds } })
      .populate('user', 'name') // برای دریافت نام دوستان
      .populate('movie', 'title') // برای دریافت عنوان فیلم‌ها
      .sort({ createdAt: -1 }) // مرتب‌سازی بر اساس جدیدترین فعالیت‌ها
      .limit(10); // محدود کردن تعداد فعالیت‌ها

    // ارسال داده‌ها به EJS
    res.render('userDashboard', { 
      user: req.user, 
      movies, 
      friendsActivities // اضافه کردن فعالیت‌های دوستان
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/profile', protect, async (req, res) => {
  try {
    // دریافت اطلاعات کاربر فعلی
    const user = req.user;

    // دریافت نقدهای کاربر به همراه اطلاعات فیلم‌ها
    const reviews = await Review.find({ user: user._id })
      .populate('movie', 'title genre releaseYear poster') // دریافت اطلاعات فیلم
      .sort({ createdAt: -1 }); // مرتب‌سازی بر اساس جدیدترین نقدها

    res.render('userProfile', { user, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;