 import transporter from "../configs/emailConfig.js";

 const sendEmail = async ({to, subject, html})=>{
   console.log("recepientEmail", to, subject, html )
    try{
    let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      });
    }catch(err){
        throw err;
    }
 }

 export default sendEmail;