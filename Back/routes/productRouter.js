import Express, { query } from "express";
import product from "../models/Productsmodels.js";

import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
const productRouter = Express.Router();
const DIR = "./public/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});
productRouter.get("/", async (req, res) => {
  const products = await product.find();
  res.send(products);
});
productRouter.post("/upLoad", upload.array("src", 5), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const src = req.files[0].filename;
  const img1 = req.files[1].filename;
  const img2 = req.files[2].filename;
  const img3 = req.files[3].filename;
  const img4 = req.files[4].filename;
  const newProduct = new product.up({
    title: req.body.title,
    slug: req.body.title,
    price: req.body.price,
    offer: req.body.offer,
    discription: req.body.discription,
    category: req.body.category,
    number: req.body.number,
    src: url + "/public/" + src,
    img1: url + "/public/" + img1,
    img2: url + "/public/" + img2,
    img3: url + "/public/" + img3,
    img4: url + "/public/" + img4,
  });
  newProduct
    .save()
    .then((result) => {
      res.status(201).json({
        message: "product saved",
        productCreated: {
          _id: result._id,
          title: result.title,
          src: result.src,
          img1: result.img1,
          img2: result.img2,
          img3: result.img3,
          img4: result.img4,
        },
      });
    })
    .catch((err) => {
      console.log(err),
        [src, img1, img2, img3, img4].forEach((f) => {
          fs.unlink("public" + f, (err) => {
            console.log(err);
          });
        }),
        res.status(500).json({
          error: err,
        });
    });
});
productRouter.post(
  "/updateProduct/:id",
  upload.array("src", 5),
  async (req, res, next) => {
    const Product = await product.findOne({ _id: req.params.id });
    const url = req.protocol + "://" + req.get("host");
    const src = req.files[0].filename;
    const img1 = req.files[1].filename;
    const img2 = req.files[2].filename;
    const img3 = req.files[3].filename;
    const img4 = req.files[4].filename;
  }
);
productRouter.get(
  "/category",
  expressAsyncHandler(async (req, res) => {
    const category = await product.find().distinct("category");
    res.send(category);
  })
);
productRouter.get("/deleteProduct/:id", async (req, res) => {
  const Product = await product.deleteOne({ _id: req.params.id });
  if (Product) {
    res.send({ message: "delete shod" });
  } else {
    res.status(404).send({ message: "ya peyda nashod ya error" });
  }
});
productRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const category = req.query.category || "";
    const price = req.query.price || "";
    const order = req.query.order || "";
    const searchQuery = req.query.query || "";
    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            title: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter = category && category !== "all" ? { category } : {};
    const priceFilter =
      price && price !== "all"
        ? {
            price: {
              $gt: Number(price.split("-")[0]),
              $lt: Number(price.split("-")[1]),
            },
          }
        : {};
    const sortOrder =
      order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };
    const prodeucts = await product
      .find({
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
      })
      .sort(sortOrder);
    res.send(prodeucts);
  })
);
productRouter.get("/id/:id", async (req, res) => {
  const Product = await product.findOne({ _id: req.params.id });
  if (Product) {
    res.send(Product);
  } else {
    res.status(404).send({ message: "محصول مورد نطر یافت نشد !" });
  }
});
productRouter.get("/SliderOne", async (req, res) => {
  const products = await product.find();
  res.send(products);
});
productRouter.get("/SliderTwo", async (req, res) => {
  const products = await product.find();
  res.send(products);
});
productRouter.get("/slug/:slug", async (req, res) => {
  const Product = await product.findOne({ slug: req.params.slug });
  if (Product) {
    res.send(Product);
  } else {
    res.status(404).send({ message: "محصول مورد نطر یافت نشد !" });
  }
});

productRouter.get("/:id", async (req, res) => {
  const Product = await product.findById(req.params.id);
  if (Product) {
    res.send(Product);
  } else {
    res.status(404).send({ message: "محصول مورد نطر یافت نشد !" });
  }
});

export default productRouter;
