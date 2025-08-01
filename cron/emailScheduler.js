const cron = require("node-cron");
const Payment = require("../models/Payment");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Helper function to find payments due in 2 days
const findUpcomingPayments = async () => {
  const today = new Date();
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(today.getDate() + 2);

  // Set the time for both dates to midnight for accurate comparison
  today.setHours(0, 0, 0, 0);
  twoDaysFromNow.setHours(0, 0, 0, 0);

  const payments = await Payment.find({
    status: "pending",
    deadline: {
      $gte: today,
      $lte: twoDaysFromNow,
    },
  });

  return payments;
};

// Main function to run the scheduler
const startEmailScheduler = () => {
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("Running daily email reminder job at 9 AM...");

      try {
        const upcomingPayments = await findUpcomingPayments();

        if (upcomingPayments.length === 0) {
          console.log("No upcoming payments found for reminders.");
          return;
        }

        // Iterate through each payment and send a reminder email
        for (const payment of upcomingPayments) {
          const user = await User.findById(payment.userId);

          if (user) {
            const message = `Hello ${
              user.name
            }, this is a friendly reminder that your payment for <b>${
              payment.paymentName
            }</b> of amount <b>$${
              payment.amount
            }</b> is due in two days on ${payment.deadline.toDateString()}.`;

            await sendEmail({
              email: user.email,
              subject: `Reminder: Upcoming Payment for ${payment.paymentName}`,
              message,
            });
          } else {
            console.error(`User not found for payment ID: ${payment._id}`);
          }
        }

        console.log(
          `Successfully sent reminders for ${upcomingPayments.length} payments.`
        );
      } catch (error) {
        console.error("Error in email scheduler:", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Email scheduler started. Next job scheduled for 9:00 AM daily.");
};

module.exports = startEmailScheduler;
