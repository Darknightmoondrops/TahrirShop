import Express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModels.js";
import User from "../models/userModels.js";
import { isAuth } from "../utils.js";

const orderRouter = Express.Router();

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItem: req.body.orderItem.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: "New Order Created", order });
  })
);
orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);
orderRouter.get("/order/orderlist", async (req, res) => {
  const Orders = await Order.find();
  res.send(Orders);
});
orderRouter.get("/order/orderlist/:accName", async (req, res) => {
  console.log(req.params.accName);
  const curUser = await User.find({ accName: req.params.accName });
  if (curUser) {
    const curUserId = curUser._id
    const curOrder = await Order.find({ user: curUser._id });
    console.log(curOrder);
  }
});
orderRouter.get("/orderPage/:id", async (req, res) => {
  const Orders = await Order.findOne({ _id: req.params.id });
  if (Orders) {
    res.send(Orders);
  } else {
    res.status(404).send({ message: "صفحه سفارش مورد نظر در دسترس نیست !" });
  }
});
orderRouter.get("/DeliveredMsg/:id", async (req, res) => {
  const Orders = await Order.findOneAndUpdate(
    { _id: req.params.id },
    { isDelivered: true }
  );
  if (Orders) {
    res.send({ message: "ersal shod" });
  } else {
    res.status(404).send({ message: "ersal nashod" });
  }
});
export default orderRouter;
