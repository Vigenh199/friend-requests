const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('./users.mongo');
const FriendRequests = require('./friendRequests.mongo');

async function hashPassword(plainTextPassword) {
  return await bcrypt.hash(plainTextPassword, 8);
};

async function isPasswordCorrect(plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}

function generateJwtToken(id) {
  const payload = {
    sub: id,
    iat: Date.now(),
  };

  const expiresIn = '1d';
  const secret = process.env.JWT_SECRET;

  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    token,
    expiresIn,
  };
}

async function findUser(filter) {
  return await Users.findOne(filter);
}

async function userWithEmailExists(email) {
  return await findUser({
    email,
  });
};

async function registerUser(user) {
  user.password = await bcrypt.hash(user.password, 8);

  const createdUser = await Users.create(user);

  const { token, expiresIn } = generateJwtToken(createdUser._id);

  return {
    createdUser,
    token,
    expiresIn,
  };
}

async function loginUser(email, password) {
  const user = await findUser({
    email,
  });

  const isPasswordMatch = await isPasswordCorrect(password, user.password);

  if (!isPasswordMatch) {
    throw new Error('Password is incorrect!');
  }

  const { token, expiresIn } = generateJwtToken(user._id);

  return {
    user,
    token,
    expiresIn,
  };
};

async function getAllUsers({ filter, skip, limit }) {
  return await Users
    .find(filter)
    .skip(skip)
    .limit(limit);
}

async function createFriendRequest(fromId, toId) {
  return await FriendRequests.create({
    from: fromId,
    to: toId,
  });
}

async function getUserFriendRequests(id) {
  const aggregationStages = [
    {
      '$match': {
        'to': id
      }
    },
    {
      '$lookup': {
        'from': 'users', 
        'localField': 'from', 
        'foreignField': '_id', 
        'as': 'from'
      }
    }, {
      '$unwind': {
        'path': '$from'
      }
    }, {
      '$replaceRoot': {
        'newRoot': '$from'
      }
    }, {
      '$project': {
        'friends': 0, 
        '__v': 0,
        'password': 0,
      }
    }
  ];

  return await FriendRequests.aggregate(aggregationStages).exec();
}

async function acceptFriendRequest(fromId, toId) {
  await FriendRequests.deleteOne({
    from: fromId,
    to: toId,
  });

  await Users.updateOne({
    _id: fromId,
  }, {
    $push: { friends: toId }
  });

  await Users.updateOne({
    _id: toId,
  }, {
    $push: { friends: fromId }
  });

  return { ok: true };
}

async function declineFriendRequest(fromId, toId) {
  await FriendRequests.deleteOne({
    from: fromId,
    to: toId,
  });

  return { ok: true };
}

async function getUserById(id) {
  return await Users.findById(id);
}

module.exports = {
  userWithEmailExists,
  registerUser,
  loginUser,
  getAllUsers,
  createFriendRequest,
  getUserFriendRequests,
  getUserById,
  acceptFriendRequest,
  declineFriendRequest,
};
