import UserModel from "../models/UserModel.js";

class TestingController {
  static deleteAllStaff = async (req, res) => {
    try {
      const deltedStaff = await UserModel.deleteMany({ role: "staff" });
      return res.send({
        status: "success",
        message: "all staff deleted success fully",
        data: deltedStaff,
      });
    } catch (err) {
      console.log("tesing ! deleting all staff err : ", err);
      return res.send({
        status: "failed",
        message: `${err.message}`
      });
    }
  };
}

export default TestingController;
