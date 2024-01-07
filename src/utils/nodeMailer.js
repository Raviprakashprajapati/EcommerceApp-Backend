import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        auth: {
            user: process.env.MYEMAIL,
            pass: process.env.MYEMAILPASS
        }
    }
)


const sendOrderConfirmationEmail = async (customerEmail, orderId) => {
    try {

        const mailOptions = {
            from: process.env.MYEMAIL,
            to: customerEmail,
            subject: "Order Confirmation Email",
            text: `Thank you for your order, ORDERID -> ${orderId}`,
            html: `ORDERID -> ${orderId}<br> <strong>NOTE: This is my Personal Project so if you received this mail then this means Email features successfully working. Thanks you For used my App☺.  You can try more on my PORTFOLIO: https://raviprakashprajapati.netlify.app/</strong>`,
        };

        const info = await transporter.sendMail(mailOptions);
        if(!info){

            return false;
        } 
        return true;
       
    } catch (error) {
        return false;
    }
};

const sendOrderCancelEmail = async (customerEmail,orderId)=>{

    try {
        
    const mailOptions={
        from:process.env.MYEMAIL,
        to:customerEmail,
        subject:"Order Cancelation Email",
        text:`Sorry For any Problems with our Order! ORDER HAS BEEN CANCELLED ID ${orderId} `,
        html:`ORDER HAS BEEN CANCELLED ID ${orderId}<br> <strong>NOTE: This is my Personal Project so if you received this mail then this means Email features successfully working. Thanks you For used my App .  You can try more project on my PORTFOLIO: https://raviprakashprajapati.netlify.app/</strong>`
    }

    const info = await transporter.sendMail(mailOptions)
    if(!info){
        return false
    }
    return true
        
    } catch (error) {
        return false        
    }

}


const sendRegisterUserEmail = async(user,password)=>{

    try {
        
    const mailOptions = {
        from:process.env.MYEMAIL,
        to:user.email,
        subject:"New Customer Registration",
        text:"New Customer Registration successfully",
        html:` You have successfully registered <br> 
               name: ${user.name}, email: ${user.email}, username: ${user.username}, password: ${password}
               <br>
               Please don't delete this mail and save the password
               <br>
               <strong>NOTE: This is my Personal Project so if you received this mail then this means Email features successfully working. Thanks you For used my App .  You can try more project on my PORTFOLIO: https://raviprakashprajapati.netlify.app/</strong>
               `
    }

    const info = await transporter.sendMail(mailOptions)
    if(!info){
        return false
    }
    return true

        
    } catch (error) {
        return false        
    }

}


export  {
    sendOrderConfirmationEmail,
    sendOrderCancelEmail,
    sendRegisterUserEmail,
}

