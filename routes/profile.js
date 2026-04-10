const router = require('express').Router();
const { getProfile, updateProfile, getActivity } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.get('/:userId',          protect, getProfile);
router.patch('/:userId',        protect, updateProfile);
router.get('/:userId/activity', protect, getActivity);

module.exports = router;
