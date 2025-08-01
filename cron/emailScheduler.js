const cron = require("node-cron");
const Payment = require("../models/Payment");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Helper function to find payments due in 2 days
const findUpcomingPayments = async () => {
  const today = new Date();
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(today.getDate() + 2);
  twoDaysFromNow.setHours(23, 59, 59, 999);

  const payments = await Payment.find({
    status: "pending",
    deadline: {
      $gte: twoDaysFromNow,
      $lte: twoDaysFromNow,
    },
  });

  return payments;
};

// Helper function to find payments due today
const findTodayPayments = async () => {
  const today = new Date();
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);
  
  startOfDay.setHours(0, 0, 0, 0);
  endOfDay.setHours(23, 59, 59, 999);

  const payments = await Payment.find({
    status: "pending",
    deadline: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  return payments;
};

// Helper function to find overdue payments for notifications
const findOverduePayments = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  const payments = await Payment.find({
    status: "overdue",
    deadline: { $lt: yesterday },
  });

  return payments;
};

// Helper function to update overdue payments
const updateOverduePayments = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await Payment.updateMany(
    {
      status: "pending",
      deadline: { $lt: today },
    },
    {
      $set: { status: "overdue" },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`Updated ${result.modifiedCount} payments to overdue status.`);
  }

  return result.modifiedCount;
};

// Main function to run the scheduler
const startEmailScheduler = () => {
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("Running daily email reminder job at 9 AM...");

      try {
        // First, update overdue payments
        await updateOverduePayments();
        
        // 1. Send 2-day advance reminders
        const upcomingPayments = await findUpcomingPayments();
        
        for (const payment of upcomingPayments) {
          const user = await User.findById(payment.userId);
          if (user) {
            const message = createReminderEmail(user.name, payment, "2 days");
            await sendEmail({
              email: user.email,
              subject: `⏰ Payment Reminder: ${payment.paymentName} due in 2 days`,
              message,
            });
          }
        }
        
        // 2. Send deadline day reminders
        const todayPayments = await findTodayPayments();
        
        for (const payment of todayPayments) {
          const user = await User.findById(payment.userId);
          if (user) {
            const message = createReminderEmail(user.name, payment, "today");
            await sendEmail({
              email: user.email,
              subject: `🚨 URGENT: ${payment.paymentName} is due TODAY!`,
              message,
            });
          }
        }
        
        // 3. Send overdue notifications
        const overduePayments = await findOverduePayments();
        
        for (const payment of overduePayments) {
          const user = await User.findById(payment.userId);
          if (user) {
            const message = createOverdueEmail(user.name, payment);
            await sendEmail({
              email: user.email,
              subject: `OVERDUE: ${payment.paymentName} payment is past due`,
              message,
            });
          }
        }

        console.log(
          `Successfully sent ${upcomingPayments.length} upcoming, ${todayPayments.length} today, and ${overduePayments.length} overdue payment notifications.`
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

  // Helper function to create reminder email
  const createReminderEmail = (name, payment, dueIn) => {
    return `
      Hello ${name},
      
      This is a friendly reminder that your payment for "<strong>${payment.paymentName}</strong>" of amount <strong>$${payment.amount.toFixed(2)}</strong> is due ${dueIn}. Please ensure you complete the payment on or before the due date, <strong>${payment.deadline.toDateString()}</strong>.
      
      Thank you for using our Payment Reminder System.
      
      Sincerely,
      Payment Reminder Team
      [Manage Your Payments Here](http://localhost:3000)
    `;
  };

  // Helper function to create overdue email
  const createOverdueEmail = (name, payment) => {
    return `
      Hi ${name},
      
      Your payment for "<strong>${payment.paymentName}</strong>" of amount <strong>$${payment.amount.toFixed(2)}</strong> was due on <strong>${payment.deadline.toDateString()}</strong> and is now overdue. Please make the payment at the earliest to avoid any penalties.
      
      Thank you for using our Payment Reminder System.
      
      Sincerely,
      Payment Reminder Team 
      [Manage Your Payments Here](http://localhost:3000)
    `;
  };
};

module.exports = startEmailScheduler;
