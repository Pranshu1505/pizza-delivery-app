const cron = require("node-cron");
const Inventory = require("../models/Inventory");
const sendEmail = require("./sendEmail");

// Builds a simple HTML table of the low-stock items for the alert email
const buildLowStockEmail = (items) => {
  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 12px;border:1px solid #ddd;">${i.name}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;">${i.category}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;">${i.stock}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;">${i.lowStockThreshold}</td>
        </tr>`
    )
    .join("");

  return `
    <h2>Low Stock Alert – Pizza Palace</h2>
    <p>The following inventory items have fallen below their configured threshold:</p>
    <table style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:6px 12px;border:1px solid #ddd;">Item</th>
          <th style="padding:6px 12px;border:1px solid #ddd;">Category</th>
          <th style="padding:6px 12px;border:1px solid #ddd;">Current Stock</th>
          <th style="padding:6px 12px;border:1px solid #ddd;">Threshold</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Please restock these items soon.</p>
  `;
};

// Checks inventory for anything under its threshold and emails the admin.
// Runs every 30 minutes; also throttles repeat alerts to once every 6 hours per item
// so the admin inbox doesn't get spammed while stock is low.
const checkLowStock = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lt: ["$stock", "$lowStockThreshold"] },
    });

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const itemsToAlert = lowStockItems.filter(
      (i) => !i.lastAlertSentAt || i.lastAlertSentAt < sixHoursAgo
    );

    if (itemsToAlert.length === 0) return;

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `⚠️ Low Stock Alert: ${itemsToAlert.length} item(s) need restocking`,
      html: buildLowStockEmail(itemsToAlert),
    });

    await Inventory.updateMany(
      { _id: { $in: itemsToAlert.map((i) => i._id) } },
      { $set: { lastAlertSentAt: new Date() } }
    );

    console.log(`Low stock alert email sent for ${itemsToAlert.length} item(s).`);
  } catch (err) {
    console.error("Low stock cron job failed:", err.message);
  }
};

// Schedule: every 30 minutes. Adjust cron expression as needed.
const startCronJobs = () => {
  cron.schedule("*/30 * * * *", checkLowStock);
  console.log("Cron job scheduled: low-stock check every 30 minutes");
};

module.exports = { startCronJobs, checkLowStock };