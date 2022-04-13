const express = require('express');

const {
  httpRegisterUser,
  httpLoginUser,
  httpGetAllUsers,
  httpCreateFriendRequest,
  httpGetUserFriendRequests,
  httpAcceptFriendRequest,
  httpDeclineFriendRequest,
} = require('./users.controller');
const passport = require('../../config/passport');

const usersRouter = express.Router();

usersRouter.post('/api/users', httpRegisterUser);
usersRouter.get('/api/users', passport.authenticate('jwt', { session: false }), httpGetAllUsers);
usersRouter.post('/api/users/login', httpLoginUser);
usersRouter.get('/api/users/friend-requests', passport.authenticate('jwt', { session: false }), httpGetUserFriendRequests);
usersRouter.post('/api/users/:id/friend-requests', passport.authenticate('jwt', { session: false }), httpCreateFriendRequest);
usersRouter.get('/api/users/:id/friend-requests/accept', passport.authenticate('jwt', { session: false }), httpAcceptFriendRequest);
usersRouter.get('/api/users/:id/friend-requests/decline', passport.authenticate('jwt', { session: false }), httpDeclineFriendRequest);


module.exports = usersRouter;
