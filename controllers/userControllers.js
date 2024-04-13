const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
   try {
      const { Username, email, password } = req.body;
      const UsernameCheck = await User.findOne({ Username });
      if (UsernameCheck)
         return res.json({ msg: "Username already exists", status: false });

      const emailCheck = await User.findOne({ email });
      if (emailCheck) return res.json({ msg: "Email already used", status: false });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
         email,
         Username,
         password: hashedPassword,
      });

      delete user.password;
      return res.json({ status: true, user });
   }
   catch (err) {
      next(err);
   }
};

module.exports.login = async (req, res, next) => {
   try {
      const { Username, password } = req.body;
      const user = await User.findOne({ Username });

      if (!user)
         return res.json({ msg: "Incorrect Username or Password", status: false });

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid)
         return res.json({ msg: "Incorrect Username or Password", status: false });

      delete user.password;
      return res.json({ status: true, user });
   }
   catch (err) {
      next(err);
   }
};

module.exports.setAvatar = async (req, res, next) => {
   try {
      const userId = req.params.id;
      const avatarImage = req.body.image;
      const userData = await User.findByIdAndUpdate(userId, {
         isAvatarImageSet: true,
         avatarImage,
      },
         {
            new: true,
         }
      );
      return res.json({
         isSet: userData.isAvatarImageSet,
         image: userData.avatarImage,
      });
   } catch (err) {
      next(err);
   }
}

module.exports.getAllUsers = async (req, res, next) => {
   try {
      const users = await User.find({ _id: { $ne: req.params.id } }).select([
         "email",
         "Username",
         "avatarImage",
         "_id",
      ])
      return res.json(users);
   } catch (err) {
      next(err);
   }
}

module.exports.logOut = (req, res, next) => {
   try {
      if (!req.params.id)
         return res.json({ msg: "User id is Required" });
      onlineUsers.delete(req.params.id);
      return res.status(200).send();
   } catch (err) {
      next(err);
   }
}