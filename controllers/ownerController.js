
class OwnerController{
    static createOwner = async (req, res) => {
        const { name, phone, email, password, password_confirmation, gender } =
          req.body;
        const role = "owner";
        if (!(password == password_confirmation))
          return res.status(400).send({
            status: "failed",
            message: "Both passowrd doesnot mathch",
          });
        if (
          !(
            name &&
            phone &&
            email &&
            password &&
            password_confirmation &&
            gender &&
            role
          )
        )
          return res.status(400).send({
            status: "failed",
            message: "All fields are required!",
          });
    
        try {
          const user = await UserModel.findOne({ email: email });
          if (user)
            return res
              .status(409)
              .send({ status: "failed", message: "User Already exists!" });
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          await UserModel.create({
            name,
            phone,
            email,
            gender,
            role,
            password: hashedPassword,
          });
          const newUser = await UserModel.findOne({ email: email }).select(
            "-password"
          );
    
          await sendEmail(
            email,
            `Congratulations ${name}! here is your libSteering password`,
            `Don't share with any one. password : ${password}`
          );
          res
            .status(201)
            .send({ status: "success", message: "owner created successfully!" });
        } catch (err) {
          console.log("create owner err : ", err);
          return res.status(500).send({
            status: "failed",
            message: "user not created",
            err: err,
          });
        }
      };

    static updateOwnerById = async (req, res)=>{
        console.log("update-owner-by-ID-req_body", req.body);
        const { name, phone, email, gender } = req.body;
        const {ownerId} = req.params;
        if (!ownerId)
          return res.status(400).send({
            status: "failed",
            message: "To update  ownerId is required",
          });
    
        try {
          const owner = await UserModel.findById(ownerId);
          if (!owner) throw new Error("No owner found  with this id");
           
          //Authorization check
          // authorizeActionInOrganization(
          //   req.user,
          //   owner.organization,
          //   "You are not authorized to Update this owner"
          // );
    
          let avatar = owner.avatar ? owner.avatar : defaultAvatarUrl;
    
          if (req.file) {
            try {
               const path = req.file.path
               const folder = owner.organization
               const filename = owner._id + owner.name
               const avatarFromCloudinary = await uploadToCloudinary(path, folder, filename);
               avatar = avatarFromCloudinary;
               fs.unlinkSync(req.file.path);
            } catch (err) {
              fs.unlinkSync(req.file.path);
              console.log("unable to upload profile pic on cloudinary");  
            }
          }
          console.log("update details -----------", req.body);
          const updatedOwner = await UserModel.findByIdAndUpdate(
            ownerId,
            { name, email, phone, avatar, gender},
            { new: true }
          );
          console.log("updated owner------------",updatedOwner)
          res.status(200).send({
            status: "success",
            message: `owner (${owner.name}) updated successfully`,
            data: updatedOwner,
          });
        } catch (err) {
          console.log("69 updateMemberById err : ", err);
          res.status(500).send({ status: "failed", message: `${err.message}` });
        }
      }
}

export default OwnerController