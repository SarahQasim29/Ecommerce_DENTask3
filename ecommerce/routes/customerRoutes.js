const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Customer } = require("../models/Customer");
const { Token } = require("../models/Token");
const { auth } = require("../middlewares/auth");
const { resetPassword } = require("../utils/emailTemplates");
const { sendEmail } = require("../utils/sendEmail");

router.post("/register", async (req, res) => {
  try {
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (existingCustomer) {
      return res.status(400).json({
        status: false,
        message: "Email exists",
        data: undefined,
      });
    }

    const hash = await bcrypt.hash(req.body.password, 10);
    const customer = new Customer({ ...req.body, password: hash });
    const doc = await customer.save();
    return res.status(201).json({
      status: true,
      message: "Registered successfully!",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error during registration",
      data: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.body.email });
    if (!customer) {
      return res.status(401).json({
        message: "User not found",
        status: false,
        data: undefined,
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Wrong password, login failed",
        data: undefined,
      });
    }

    const token = jwt.sign(
      {
        email: customer.email,
        customerId: customer._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "2h",
      }
    );

    await Token.findOneAndUpdate(
      { _customerId: customer._id, tokenType: "login" },
      { token: token },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      status: true,
      message: "Login successfully!",
      data: {
        token,
        customer,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error, authentication failed",
      data: error.message,
    });
  }
});

router.get("/logout", auth, async (req, res) => {
  try {
    await Token.findOneAndDelete({
      _customerId: req.customerId,
      tokenType: "login",
    });
    return res.status(200).json({
      status: true,
      message: "Logout successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error, logout failed",
      data: err.message,
    });
  }
});

router.get("/authUser", auth, async (req, res) => {
  try {
    const customerId = req.customerId;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found",
        data: undefined,
      });
    }
    return res.status(200).json({
      data: customer,
      message: "Authentication successfully!",
      status: true,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Authentication failed",
      data: err.message,
    });
  }
});

router.put("/resetPassword/:token", async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_PW_KEY);
    const doc = await Token.findOne({
      _customerId: decoded.customerId,
      token,
      tokenType: "resetPassword",
    });
    if (!doc) {
      return res.status(400).json({
        status: false,
        message: "Invalid token",
        data: undefined,
      });
    }

    const customer = await Customer.findOne({ email: decoded.email });
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found",
        data: undefined,
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    customer.password = hash;
    const result = await customer.save();
    await Token.findOneAndDelete({
      _customerId: customer.id,
      tokenType: "resetPassword",
    });

    return res.status(200).json({
      status: true,
      message: "Password reset successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: error.message,
    });
  }
});

router.put("/forgotPassword", async (req, res) => {
  const { email } = req.body;

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({
        status: false,
        message: "Email does not exist",
        data: undefined,
      });
    }

    const token = jwt.sign(
      {
        email: customer.email,
        customerId: customer._id,
      },
      process.env.JWT_RESET_PW_KEY,
      {
        expiresIn: "20m",
      }
    );

    const doc = await Token.findOneAndUpdate(
      { _customerId: customer._id, tokenType: "resetPassword" },
      { token: token },
      { new: true, upsert: true }
    );

    if (doc) {
      const emailTemplate = resetPassword(email, token);
      sendEmail(emailTemplate);
      return res.status(200).json({
        status: true,
        message: "Email for reset password has been sent",
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Server error",
        data: undefined,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: error.message,
    });
  }
});

router.put("/changePassword", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const customerId = req.customerId;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found",
        data: undefined,
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Old password incorrect",
        data: undefined,
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    customer.password = hash;
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      status: true,
      message: "Password has been changed successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error changing password",
      data: error.message,
    });
  }
});

module.exports = router;
