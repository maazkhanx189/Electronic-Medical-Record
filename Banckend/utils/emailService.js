// import nodemailer from "nodemailer";

// // Create transporter using Gmail or your email service
// const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_SERVICE || "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export const sendApprovalEmail = async (doctorEmail, doctorName, approvalStatus) => {
//   try {
//     let subject, htmlContent;

//     if (approvalStatus === "approved") {
//       subject = "✅ Your Doctor Account Has Been Approved!";
//       htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f8ff; border-radius: 10px;">
//           <h2 style="color: #27ae60;">Welcome, ${doctorName}!</h2>
//           <p>We're pleased to inform you that your doctor account has been <strong>approved</strong> by our admin team.</p>
//           <p>You can now login to the platform and start managing your patients.</p>
//           <p><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color: #3498db;">Click here to login</a></p>
//           <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//           <p>If you have any questions, feel free to contact our support team.</p>
//           <p>Best regards,<br/><strong>Healthcare Management System Team</strong></p>
//         </div>
//       `;
//     } else if (approvalStatus === "rejected") {
//       subject = "❌ Doctor Account Registration - Not Approved";
//       htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffe6e6; border-radius: 10px;">
//           <h2 style="color: #e74c3c;">Registration Not Approved</h2>
//           <p>Dear ${doctorName},</p>
//           <p>Unfortunately, your doctor account registration has been <strong>rejected</strong> by our admin team.</p>
//           <p>Possible reasons could include:</p>
//           <ul>
//             <li>Incomplete or invalid documentation</li>
//             <li>License verification failed</li>
//             <li>Other compliance issues</li>
//           </ul>
//           <p>Please contact our support team for more details or to reapply.</p>
//           <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//           <p>Best regards,<br/><strong>Healthcare Management System Team</strong></p>
//         </div>
//       `;
//     } else {
//       subject = "📋 Doctor Account Registered - Pending Approval";
//       htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff9e6; border-radius: 10px;">
//           <h2 style="color: #f39c12;">Registration Received</h2>
//           <p>Dear ${doctorName},</p>
//           <p>Thank you for registering as a doctor on our platform!</p>
//           <p>Your account is currently <strong>pending approval</strong> from our admin team. We will review your information and send you a confirmation email shortly.</p>
//           <p><strong>What to expect:</strong></p>
//           <ul>
//             <li>Your profile will be verified</li>
//             <li>Your license will be validated</li>
//             <li>You will receive an approval/rejection email</li>
//           </ul>
//           <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//           <p>Thank you for your patience!</p>
//           <p>Best regards,<br/><strong>Healthcare Management System Team</strong></p>
//         </div>
//       `;
//     }

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: doctorEmail,
//       subject: subject,
//       html: htmlContent,
//     });

//     console.log(`Email sent to ${doctorEmail} for ${approvalStatus} status`);
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return false;
//   }
// };

// export default transporter;
