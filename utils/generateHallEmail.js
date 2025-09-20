export default function generateHallEmail(actionType, hall, vendorName, updatedFields = {}) {
    const { name, address, city, state, numberOfCourts, image, amenities, matType, pricePerHour } = hall;

    let title = "";
    let message = "";
    let businessNote = "";

    switch (actionType) {
        case "create":
            title = `🎉 New Hall Listed: "${name}"`;
            message = `
        <p>You've successfully listed <strong>${name}</strong> in <strong>${city}, ${state}</strong> with ${numberOfCourts} courts.</p>
        <p>Hall is now live for users to explore and book!</p>
      `;
            businessNote = `You're expanding your sports presence, and every listing adds value to your business portfolio. 
        Make sure you keep high-quality images and a detailed amenities list to attract more bookings. 
        Remember, halls with more transparency and updated info consistently perform better on user ratings.`;
            break;

        case "update":
            title = `✏️ Hall Updated: "${name}"`;
            message = `
        <p>The following updates were made to your listing:</p>
        <ul>
          ${Object.entries(updatedFields).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join("")}
        </ul>
      `;
            businessNote = `Regular updates keep your hall attractive and relevant. Vendors who actively manage their listings 
        receive better conversion rates and repeat customers. Maintain accuracy and keep adding new features or offers.`;
            break;

        case "delete":
            title = `🗑️ Hall Deleted: "${name}"`;
            message = `<p>The hall <strong>${name}</strong> has been removed from your listings.</p>`;
            businessNote = `Whether you're consolidating operations or pausing temporarily, you can always add back listings later. 
        Stay visible and active to keep your user base loyal. If you're upgrading, let us know and we’ll help boost your visibility.`;
            break;

        default:
            title = `📢 Hall Activity Notification`;
            message = `<p>Some activity occurred on your hall "${name}".</p>`;
            businessNote = `Thanks for actively managing your business through our platform. Smart listings = smart growth.`;
    }

    return `
  <div style="max-width: 700px; margin: auto; font-family: 'Segoe UI', sans-serif; background-color: #1e1e1e; color: white; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #FF6B00; padding: 20px;">
      <h2 style="margin: 0; font-size: 22px;">${title}</h2>
    </div>

    <div style="padding: 20px; background-color: #2a2a2a;">
      ${message}

      <div style="margin-top: 20px; background: #111; padding: 15px; border-left: 4px solid #FF6B00; border-radius: 6px;">
        <p><strong>📍 Location:</strong> ${address}, ${city}, ${state}</p>
        <p><strong>🏸 Courts:</strong> ${numberOfCourts}</p>
        <p><strong>🛠️ Amenities:</strong> ${amenities.join(', ')}</p>
        <p><strong>🖼️ Image:</strong> ${image}</p>
      </div>

      <div style="margin-top: 25px; font-size: 15px; color: #f1f1f1; line-height: 1.7;">
        ${businessNote}
      </div>

      <p style="font-size: 13px; color: #999; margin-top: 25px;">For help or visibility improvement tips, visit your vendor dashboard.</p>
    </div>

    <footer style="background-color: #111; padding: 15px; text-align: center; font-size: 13px; color: #777;">
      Badminton Booking Platform • Connect. Play. Grow.
    </footer>
  </div>
  `;
}
