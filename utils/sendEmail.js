 import transporter from "../configs/emailConfig.js";

 const sendEmail = async (recepientEmail, subject, description)=>{
    try{
    let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recepientEmail,
        subject: subject ,
        html: description,
      });
    }catch(err){
        throw err;
    }
 }

 export default sendEmail;