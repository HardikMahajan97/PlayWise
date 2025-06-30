
export default function generateCourtEmail(actionType, courtName, extraDetails = {}) {
    const { dayOfWeek, slots, updatedFields } = extraDetails;

    // Common variables
    let title = "";
    let message = "";
    let accentColor = "#FF6B00"; // Sporty orange
    let bgColor = "#1e1e1e";     // Black
    let shortNote = "";

    switch (actionType) {
        case "create":
            title = `🏸 Your Court "${courtName}" Has Been Successfully Created!`;
            message = `
        <p>You're now all set to start receiving bookings for <strong>${courtName}</strong>.</p>
        <p>Make sure to add slot availability so users can book your court right away!</p>
      `;
            shortNote = `Adding a new court is the first step toward building a vibrant sports ecosystem around your hall. 
      With players actively seeking quality courts, keeping details accurate and inviting will help you stand out. 
      Stay proactive — update amenities, respond to bookings quickly, and maintain high standards. 
      A great first impression drives loyalty and ratings. Your court is now visible to players near your city.`;
            break;

        case "update":
            title = `✏️ Your Court "${courtName}" Has Been Updated`;
            message = `
        <p>The following updates were made:</p>
        <ul>${Object.entries(updatedFields).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join("")}</ul>
      `;
            shortNote = `Keeping your court info up to date helps players make informed decisions. 
      Whether it's pricing, mat type, or timings, transparency improves trust and booking rates. 
      Always keep an eye on market trends and respond quickly to user feedback.`;
            break;

        case "delete":
            title = `🗑️ Your Court "${courtName}" Has Been Deleted`;
            message = `
        <p>This court has been permanently removed from your dashboard and is no longer visible to users.</p>
      `;
            shortNote = `If this was intentional due to maintenance, relocation, or strategy shift — we respect your call. 
      Just remember, consistent availability helps retain and attract users. You can always re-add it when you're ready!`;
            break;

        case "availability_set":
            title = `📅 Availability Set for "${courtName}" on ${dayOfWeek}`;
            message = `
        <p>You’ve defined the following slots:</p>
        <ul>${slots.map(slot => `<li>${slot}</li>`).join("")}</ul>
      `;
            shortNote = `Setting time slots ensures smooth scheduling and maximizes your court usage. 
      Try to open peak hours (6–9 AM & 5–9 PM) to attract maximum footfall. 
      Regularly reviewing demand patterns and adjusting slots accordingly can significantly improve engagement.`;
            break;

        case "availability_update":
            title = `🕓 Availability Updated for "${courtName}" on ${dayOfWeek}`;
            message = `
        <p>The new available slots are:</p>
        <ul>${slots.map(slot => `<li>${slot}</li>`).join("")}</ul>
      `;
            shortNote = `Updated slots help avoid overlaps, confusion, and missed opportunities. 
      Vendors with flexible, real-time availability often get higher ratings and repeat users. 
      Keep adjusting based on what works best for your space and your crowd.`;
            break;

        default:
            title = `Court Update Notification`;
            message = `<p>Some update was made to your court <strong>${courtName}</strong>.</p>`;
            shortNote = `Thank you for staying active on the platform. Smart management leads to smart profits.`;
    }

    return `
  <div style="max-width: 700px; margin: auto; padding: 20px; font-family: 'Segoe UI', sans-serif; background-color: ${bgColor}; color: white; border-radius: 8px;">
    <div style="background-color: ${accentColor}; padding: 15px 20px; border-radius: 6px 6px 0 0;">
      <h2 style="margin: 0; font-size: 22px;">${title}</h2>
    </div>

    <div style="padding: 20px; background-color: #2a2a2a;">
      ${message}
      
      <div style="margin-top: 20px; font-size: 15px; line-height: 1.6; color: #f0f0f0; background: #111; padding: 15px; border-radius: 6px; border-left: 4px solid ${accentColor};">
        ${shortNote}
      </div>

      <p style="font-size: 13px; color: #999; margin-top: 30px;">This email was triggered by an action on your vendor dashboard. For assistance, contact support or visit your dashboard anytime.</p>
    </div>

    <footer style="background-color: #111; padding: 15px; text-align: center; font-size: 13px; color: #777; border-radius: 0 0 6px 6px;">
      Badminton Booking Platform • Making sports accessible.
    </footer>
  </div>
  `;
}
