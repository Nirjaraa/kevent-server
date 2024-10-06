declare namespace Express {
  interface Request {
    user: import("../interface/User.interface").IUser;
  }
}
