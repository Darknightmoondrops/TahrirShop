import Express from "express";
import data from "../data.js";
import product from "../models/Productsmodels.js";
import User from "../models/userModels.js";

const seedRouter = Express.Router();

seedRouter.get("/", async (req, res) => {
  await product.remove({});
  const createdProducts = await product.insertMany(data.Products);
  await User.remove({});
  const createdUser = await User.insertMany(data.Users);
  res.send({ createdProducts, createdUser });
});
export default seedRouter;
