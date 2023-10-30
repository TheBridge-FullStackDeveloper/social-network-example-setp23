const { Post, User, Sequelize } = require("../models/index.js");
const { Op } = Sequelize;
const PostController = {
  create(req, res) {
    Post.create(req.body)
      .then((post) =>
        res.status(201).send({ message: "Publicación creada con éxito", post })
      )
      .catch((err) => {
        console.error(err);
        res.status(500).send({ msg: "Ha habido un error", err });
      });
  },
  getAll(req, res) {
    Post.findAll({
      include: [{ model: User, attributes: ["email", "name"] }],
    })
      .then((posts) => res.send(posts))
      .catch((err) => {
        console.error(err);
        res.status(500).send({
          message: "Ha habido un problema al cargar las publicaciones",
        });
      });
  },
  getById(req, res) {
    Post.findByPk(req.params.id, {
      include: [User],
    })
      .then((post) => res.send(post))
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
  },
  getOneByName(req, res) {
    Post.findOne({
      where: {
        title: {
          [Op.like]: `%${req.params.title}%`,
        },
      },
      include: [User],
    })
      .then((post) => res.send(post))
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
  },
  async delete(req, res) {
    try {
      await Post.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.send("La publicación ha sido eliminada con éxito");
    } catch (error) {
        console.error(error);
    }
  },
};

module.exports = PostController;
