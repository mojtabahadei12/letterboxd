// routes/followRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// دنبال کردن یک کاربر
router.post('/:id', protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد.' });
    }

    const currentUser = await User.findById(req.user._id);

    // بررسی اینکه آیا کاربر از قبل دنبال شده است
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'شما این کاربر را قبلاً دنبال کرده‌اید.' });
    }

    // اضافه کردن کاربر به لیست following
    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    res.status(200).json({ message: 'کاربر با موفقیت دنبال شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور.' });
  }
});

module.exports = router;