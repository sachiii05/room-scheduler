const nodemailer = require('nodemailer');

// Default admin email
const DEFAULT_ADMIN_EMAIL = 'isaacelomina05@gmail.com';

// Create reusable transporter with better debugging
let transporter;

// Initialize email transporter
function initializeTransporter() {
  // Check if required environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email configuration error: Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
    return false;
  }

  console.log('Initializing email transporter with credentials:');
  console.log('Email user:', process.env.EMAIL_USER);
  console.log('Email password length:', process.env.EMAIL_PASSWORD.length);

  // Create transporter with detailed debug options
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: process.env.NODE_ENV === 'development', // Only enable debug in development
    logger: process.env.NODE_ENV === 'development' // Only enable logger in development
  });

  // Verify connection configuration
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter verification failed:', error);
        reject(error);
      } else {
        console.log('Email server is ready to send messages');
        resolve(true);
      }
    });
  });
}

// Initialize the transporter when the module is loaded
let initialized = false;

async function ensureInitialized() {
  if (initialized) return true;
  try {
    await initializeTransporter();
    initialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return false;
  }
}

// Send email notification for room booking request
async function sendBookingRequestNotification(bookingDetails) {
  try {
    if (!await ensureInitialized()) {
      throw new Error('Email service failed to initialize');
    }

    console.log('Attempting to send booking request notification to admin:', DEFAULT_ADMIN_EMAIL);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: DEFAULT_ADMIN_EMAIL,
      subject: 'New Room Booking Request',
      html: `
        <h2>New Room Booking Request</h2>
        <p><strong>User:</strong> ${bookingDetails.user.name || 'Unknown'} (${bookingDetails.user.email || 'No email'})</p>
        <p><strong>Room:</strong> ${bookingDetails.room.name || 'Unknown room'}</p>
        <p><strong>Start Time:</strong> ${new Date(bookingDetails.startTime).toLocaleString()}</p>
        <p><strong>End Time:</strong> ${new Date(bookingDetails.endTime).toLocaleString()}</p>
        <p><strong>Reason:</strong> ${bookingDetails.reason || 'No reason provided'}</p>
        <p><strong>Status:</strong> Pending Approval</p>
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Send email notification for booking approval/rejection
async function sendBookingStatusNotification(bookingDetails, status) {
  try {
    if (!await ensureInitialized()) {
      throw new Error('Email service failed to initialize');
    }

    console.log(`Attempting to send booking ${status} notification to user:`, bookingDetails.user.email);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: bookingDetails.user.email,
      subject: `Room Booking ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      html: `
        <h2>Your Room Booking ${status === 'approved' ? 'has been Approved' : 'has been Rejected'}</h2>
        <p><strong>Room:</strong> ${bookingDetails.room.name}</p>
        <p><strong>Start Time:</strong> ${new Date(bookingDetails.startTime).toLocaleString()}</p>
        <p><strong>End Time:</strong> ${new Date(bookingDetails.endTime).toLocaleString()}</p>
        <p><strong>Status:</strong> ${status}</p>
        ${status === 'rejected' ? `<p><strong>Reason:</strong> ${bookingDetails.rejectionReason || 'No reason provided'}</p>` : ''}
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

module.exports = {
  sendBookingRequestNotification,
  sendBookingStatusNotification
};
