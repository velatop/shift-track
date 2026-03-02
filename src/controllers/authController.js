// src/controllers/authController.js
const jwt  = require('jsonwebtoken');
const { User } = require('../models');

const TIMEOUT_MS     = parseInt(process.env.SESSION_TIMEOUT) || 28800000; // 8h
const LOCK_DURATION  = 15 * 60 * 1000; // 15 Minutes
const MAX_ATTEMPTS   = 3;

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Incorrect credentials' });
    }

    // Verificar si la cuenta está bloqueada
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res.status(423).json({ error: 'Account temporarily blocked' });
    }

    const valid = await user.validatePassword(password);

    if (!valid) {
      const attempts = user.failed_attempts + 1;
      const update = { failed_attempts: attempts };

      if (attempts >= MAX_ATTEMPTS) {
        update.locked_until = new Date(Date.now() + LOCK_DURATION);
      }

      await user.update(update);
      return res.status(401).json({ error: 'Incorrect credentials' });
    }

    await user.update({ failed_attempts: 0, locked_until: null });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { login };