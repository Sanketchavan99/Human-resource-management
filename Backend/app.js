const express = require("express");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");

const { sequelize } = require("./config/database");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(cookieParser());

//Handle content disposition, uploads folder available
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

const companyRoutes = require("./routes/companyRoutes");
app.use("/companies", companyRoutes);

const centerRoutes = require("./routes/centerRoutes");
app.use("/centers", centerRoutes);

const addressRoutes = require("./routes/addressRoutes");
app.use("/addresses", addressRoutes);

const bankDetailRoutes = require("./routes/bankDetailRoutes");
app.use("/bank-details", bankDetailRoutes);

const emergencyContactRoutes = require("./routes/emergencyContactRoutes");
app.use("/emergency-contacts", emergencyContactRoutes);

const familyMemberRoutes = require("./routes/familyMemberRoutes");
app.use("/family-members", familyMemberRoutes);

const nomineeRoutes = require("./routes/nomineeRoutes");
app.use("/nominees", nomineeRoutes);

const payslipRoutes = require("./routes/payslipRoutes");
app.use("/payslips", payslipRoutes);

const payslipDocumentRoutes = require("./routes/payslipDocumentRoutes");
app.use("/payslip-documents", payslipDocumentRoutes);

const offerLetterRoutes = require("./routes/offerLetterRoutes");
app.use("/offer-letters", offerLetterRoutes);


// const adminRoutes = require("./routes/admin"); // Deprecated or keep if needed
// app.use("/admin", adminRoutes);

// const employeeRoutes = require("./routes/employee"); // Deprecated or keep if needed
// app.use("/employee", employeeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = 5000;

if (require.main === module) {
  app.listen(PORT, async () => {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
    console.log("Server Running on localhost 5000");
  });
}

module.exports = app;
