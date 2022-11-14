/* get all the users */

const getAllUsers = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "All users",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* imports controller */
module.exports = { getAllUsers };
