const {
  userWithEmailExists,
  registerUser,
  loginUser,
  getAllUsers,
  createFriendRequest,
  getUserFriendRequests,
  getUserById,
  acceptFriendRequest,
  declineFriendRequest,
} = require('../../models/users.model');
const { getPagination } = require('../../services/query');

async function httpRegisterUser(req, res) {
  try {
    const newUser = req.body;

    if (!newUser.email || !newUser.password) {
      return res.status(400).json({
        error: 'Missing email or password!',
      });
    }

    const isUserExists = await userWithEmailExists(newUser.email);

    if (isUserExists) {
      return res.status(400).json({
        error: 'Email already exists!',
      });
    }

    const registeredUserWithToken = await registerUser(newUser);

    res.json(registeredUserWithToken);
  } catch(err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal Server Error!',
    });
  }
};

async function httpLoginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing email or password!',
      });
    }

    const isUserExists = await userWithEmailExists(email);

    if (!isUserExists) {
      return res.status(404).json({
        error: 'User not found!',
      });
    }

    const userWithToken = await loginUser(email, password);

    res.json(userWithToken);
  } catch(err) {
    console.error(err);

    if (err.message === 'Password is incorrect!') {
      return res.status(401).json({
        error: err.message,
      });
    }

    res.status(500).json({
      error: 'Internal Server Error!',
    })
  }
}

function getUsersFilter(query) {
  const filter = {};

  if (query.firstName) {
    filter.firstName = { $regex: `^${query.firstName}`, $options: 'i' };
  }

  if (query.lastName) {
    filter.lastName = { $regex: `^${query.lastName}`, $options: 'i' };
  }

  if (query.age) {
    filter.age = Number(query.age);
  }

  return filter;
}

async function httpGetAllUsers(req, res) {
  try {
    const { skip, limit } = getPagination(req.query);
    const filter = getUsersFilter(req.query);

    const users = await getAllUsers({
      filter,
      skip,
      limit,
    });

    res.json(users);
  } catch(err) {
    res.status(500).status({
      error: 'Internal Server Error!',
    });
  }
}

async function httpCreateFriendRequest(req, res) {
  try {
    const fromUser = req.user;
    const toUser = await getUserById(req.params.id);

    if (!toUser) {
      return res.status(404).json({
        error: 'User Not Found!',
      });
    }

    const createdRequest = await createFriendRequest(fromUser._id, toUser._id);    

    res.json(createdRequest);
  } catch(err) {
    res.status(500).status({
      error: 'Internal Server Error!',
    });
  }
}

async function httpGetUserFriendRequests(req, res) {
  try {
    const friendRequests = await getUserFriendRequests(req.user._id);

    res.json(friendRequests);
  } catch(err) {
    res.status(500).json({
      error: 'Internal Server Error!',
    })
  }
}

async function httpAcceptFriendRequest(req, res) {
  try {
    const fromUser = await getUserById(req.params.id);
    const toUser = req.user;

    if (!fromUser) {
      return res.status(404).json({
        error: 'User Not Found!',
      });
    }

    await acceptFriendRequest(fromUser._id, toUser._id);

    res.json({ success: true });
  } catch(err) {
    res.status(500).json({
      error: 'Internal Server Error!',
    })
  }
}

async function httpDeclineFriendRequest(req, res) {
  try {
    const fromUser = await getUserById(req.params.id);
    const toUser = req.user;

    if (!fromUser) {
      return res.status(404).json({
        error: 'User Not Found!',
      });
    }

    await declineFriendRequest(fromUser._id, toUser._id);

    res.json({ success: true });
  } catch(err) {
    res.status(500).json({
      error: 'Internal Server Error!',
    })
  }
}

module.exports = {
  httpRegisterUser,
  httpLoginUser,
  httpGetAllUsers,
  httpCreateFriendRequest,
  httpGetUserFriendRequests,
  httpAcceptFriendRequest,
  httpDeclineFriendRequest,
};
