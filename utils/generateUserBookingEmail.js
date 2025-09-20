export default function generateUserBookingEmail(userName, court, hall, bookingDetails) {
    const { date, slot, price } = bookingDetails;

    return `
  <div style="max-width: 700px; margin: auto; font-family: 'Segoe UI', sans-serif; background-color: #1e1e1e; color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.4);">
    <!-- Header -->
    <div style="background-color: #FF6B00; padding: 20px 25px;">
      <h2 style="margin: 0; font-size: 22px;">✅ Booking Confirmed, ${userName}!</h2>
    </div>

    <!-- Body -->
    <div style="padding: 25px; background-color: #2a2a2a;">

      <p style="font-size: 16px; margin-top: 0;">
        Your court reservation is locked in! Here's a quick summary of your game session at <strong>${hall.name}</strong>.
      </p>

      <!-- Booking Summary -->
      <div style="margin-top: 20px; padding: 15px; background: #111; border-left: 5px solid #FF6B00; border-radius: 6px;">
        <p style="margin: 6px 0;"><strong>🏸 Hall:</strong> ${hall.name}, ${hall.address}</p>
        <p style="margin: 6px 0;"><strong>🎯 Court:</strong> ${court.number} (${hall.matType || 'Standard Mat'})</p>
        <p style="margin: 6px 0;"><strong>🗓️ Date:</strong> ${date}</p>
        <p style="margin: 6px 0;"><strong>⏰ Slot:</strong> ${slot}</p>
        <p style="margin: 6px 0;"><strong>💳 Price:</strong> ₹${price}</p>
        <p style="margin: 6px 0;"><strong>🧾 Payment:</strong> <span style="color: #4CAF50;">Completed</span></p>
      </div>

      <!-- Encouraging Message -->
      <div style="margin-top: 25px; font-size: 15px; line-height: 1.7; color: #f1f1f1;">
        <p>We're excited to see you on the court! 🏸</p>
        <p>Your court is now officially reserved. Don’t forget to bring your gear and arrive 10 minutes early to stretch and prep.</p>
        <p>Players who stay consistent and plan ahead are the ones who smash hardest — literally! 😉</p>
        <p>Keep the momentum going by scheduling your next session right now — most of our top slots fill fast!</p>
      </div>

      <!-- Book Again CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" 
           style="display: inline-block; background-color: #FF6B00; color: white; padding: 12px 25px; font-size: 16px; font-weight: bold; border-radius: 5px; text-decoration: none;">
          🎾 Book Another Slot
        </a>
      </div>

      <!-- Footer Note -->
      <p style="font-size: 13px; color: #aaa; margin-top: 30px; text-align: center;">
        Questions? Need to reschedule? Visit your bookings dashboard anytime.
      </p>
    </div>

    <!-- Footer -->
    <footer style="background-color: #111; padding: 18px; text-align: center; font-size: 13px; color: #777;">
      Badminton Booking Platform • Play. Repeat. Win.
    </footer>
  </div>
  `;
}
