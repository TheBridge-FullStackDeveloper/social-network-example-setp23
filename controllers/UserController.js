const { User, Post, Token, Sequelize } = require("../models/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer.js");
const { jwt_secret } = require("../config/config.json")["development"];
const { Op } = Sequelize;

const UserController = {
  create(req, res, next) {
    const emailToken = jwt.sign({ email: req.body.email }, jwt_secret, {
      expiresIn: "48h",
    });
    const url = `http://localhost:8080/users/confirm/${emailToken}`;
    req.body.role = "user"; //para asignar el rol automaticamente
    const password = bcrypt.hashSync(req.body.password, 10);
    User.create({ ...req.body, password, confirmed: false })
      .then((user) =>
        transporter
          .sendMail({
            to: req.body.email,
            subject: "Confirme su registro",
            html: `<h3> Bienvenido, estás a un paso de registrarte </h3>
        <a href="${url}"> Clica para confirmar tu registro</a>
        `,
          })
          .then(() => {
            res.status(201).send({
              message: "Te hemos enviado un correo para confirmar el registro",
              user,
            });
          })
      )
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },
  getAll(req, res) {
    User.findAll({
      include: [Post],
    })
      .then((users) => res.send(users))
      .catch((err) => {
        console.log(err);
        res.status(500).send({
          message: "Ha habido un problema al cargar las publicaciones",
        });
      });
  },
  async delete(req, res) {
    await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    await Post.destroy({
      where: {
        UserId: req.params.id,
      },
    });
    res.send("El usuario ha sido eliminado con éxito");
  },
  async update(req, res) {
    await User.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.send("Usuario actualizado con éxito");
  },
  login(req, res) {
    User.findOne({
      where: {
        email: req.body.email,
      },
    }).then((user) => {
      if (!user) {
        return res
          .status(400)
          .send({ message: "Usuario o contraseña incorrectos" });
      }
      if (!user.confirmed) {
        return res.status(400).send({ message: "Debes confirmar tu correo" });
      }
      const isMatch = bcrypt.compareSync(req.body.password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .send({ message: "Usuario o contraseña incorrectos" });
      }
      const token = jwt.sign({ id: user.id }, jwt_secret);
      Token.create({ token, UserId: user.id });
      res.send({ msg: `Bienvenid@ ${user.name}`, token, user });
    });
  },
  async logout(req, res) {
    try {
      await Token.destroy({
        where: {
          [Op.and]: [
            { UserId: req.user.id },
            { token: req.headers.authorization },
          ],
        },
      });
      res.send({ message: "Desconectado con éxito" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: "hubo un problema al tratar de desconectarte" });
    }
  },
  async confirm(req, res) {
    try {
      const payload = jwt.verify(req.params.email,jwt_secret)
      await User.update(
        { confirmed: true },
        {
          where: {
            email: payload.email,
          },
        }
      );
      res.status(201).send("Usuario confirmado con éxito");
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = UserController;
