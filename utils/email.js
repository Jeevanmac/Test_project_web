const nodemailer = require("nodemailer");

async function sendOrderEmail(user, items) {
    try {
        // Generate test SMTP service account from ethereal.email
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user, 
                pass: testAccount.pass, 
            },
        });

        let itemsHtml = items.map(item => `<li><strong>${item.name}</strong> - ₹${item.price}</li>`).join("");
        let downloadLink = `http://localhost:5000/api/download?token=valid_token&projectId=${items[0].id}`;

        let info = await transporter.sendMail({
            from: '"ProjectMarket Support" <support@projectmarket.com>',
            to: user.email,
            subject: "Your ProjectMarket Purchase is Complete! 🚀",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #200df2;">Hi ${user.name},</h2>
                    <p style="color: #333; font-size: 16px;">Thank you for your purchase. Your payment was 100% successful!</p>
                    
                    <div style="background: #f6f5f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #111;">Order Summary:</h3>
                        <ul style="color: #555;">${itemsHtml}</ul>
                    </div>

                    <p style="color: #333; font-size: 16px;">Your ZIP file is ready for download. Click the secure link below to access your assets immediately:</p>
                    
                    <a href="${downloadLink}" style="display:inline-block; padding: 12px 24px; background:#200df2; color:white; text-decoration:none; border-radius:8px; font-weight:bold; margin-top: 10px;">Download Your ZIP File</a>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px dashed #ccc;">
                        <h3 style="color: #111;">Always Available in Your Dashboard</h3>
                        <p style="color: #555; line-height: 1.5;">Did you know? You can re-download your purchases at any time directly through your ProjectMarket Dashboard! Just log in and navigate to the <strong>My Purchases</strong> section.</p>
                        <a href="http://localhost:5000/pages/dashboard.html" style="color: #200df2; font-weight: bold;">Access Your Dashboard &rarr;</a>
                    </div>
                </div>
            `,
        });

        console.log("-----------------------------------------");
        console.log("Mock Email Sent Successfully!");
        console.log("Message ID: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        console.log("-----------------------------------------");
        
        return nodemailer.getTestMessageUrl(info);
    } catch(err) {
        console.error("Nodemailer Mail Error:", err);
    }
}

module.exports = { sendOrderEmail };
