const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");

const Media = require("../models/Media.model");

// POST /api/medias Create a post
router.post("/medias", (req, res, next) => {
  const { medias, legend } = req.body;
  const creator = req.payload._id;
  User.findById(creator)
    .then((userFromDB) => {
      const group = userFromDB.group;
      if (!group) {
        return res.status(500).json({ message: "there is no group yet" });
      }
      Media.create({ group, medias, legend, creator }).then((newMedia) => {
        res.status(201).json(newMedia);
      });
    })

    .catch((err) => res.json(err));
});

// GET /api/medias List the last 10 posts
router.get("/medias", (req, res, next) => {
  const page = req.query.page;
  const skip = (page - 1) * 10;

  User.findById(req.payload._id)
    .then((foundUser) => {
      const groupId = foundUser.group;
      console.log("groupId=", groupId);
      Media.find({ group: groupId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(10)
        .populate("creator")
        .then((medias) => {
          console.log("medias =", medias);
          res.status(200).json(medias);
        });
    })
    .catch((err) => {
      console.log("here is the error", err);
      //res.json(err);
      next(err);
    });
});

// GET /api/medias/:mediaId Display a post
router.get("/medias/:mediaId", (req, res, next) => {
  const { mediaId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Media.findById(mediaId)
    .then((foundedMedia) => {
      res.status(200).json(foundedMedia);
    })
    .catch((err) => res.json(err));
});

// PUT /api/medias/:mediaId/comments Ajouter des commentaires
router.post("/medias/:mediaId/comments", (req, res, next) => {
  const { mediaId } = req.params;
  const content = req.body.content;

  console.log("req.body ===", req.body);
  console.log("mediaId ===", mediaId);

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    return res.status(400).json({ message: "Specified id is not valid" });
  }

  // Trouver le media par son ID
  Media.findByIdAndUpdate(
    mediaId,
    {
      $push: {
        comments: {
          userId: req.payload._id,
          content,
        },
      },
    },
    { new: true }
  )
    .then((updatedMedia) => {
      if (!updatedMedia) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.status(200).json(updatedMedia);
    })

    .catch((err) => next(err));
});

// GeET /api/medias/:mediaId/comments Affichage des commentaires
router.get("/medias/:mediaId/comments", (req, res, next) => {
  const { mediaId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    return res.status(400).json({ message: "Specified id is not valid" });
  }

  // Trouver le media par son ID
  Media.findById(mediaId)
    .populate("comments.userId")
    .then((foundedMedia) => {
      res.status(200).json(foundedMedia.comments);
    })
    .catch((err) => next(err));
});

module.exports = router;
