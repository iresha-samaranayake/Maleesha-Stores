const Bill = require('../models/Bill');
const twilio = require('twilio');

// Initialize Twilio client (will use env vars)
// Add these to your .env file: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, OWNER_WHATSAPP_NUMBERS
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.error("Twilio initialization error:", error);
}

// @desc    Upload a new bill
// @route   POST /api/bills/upload
// @access  Public
const uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const { customerName, customerPhone } = req.body;

    if (!customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Please provide customer name and phone' });
    }

    // Construct image URL (Cloudinary provides the full URL in req.file.path)
    const imageUrl = req.file.path;

    const bill = await Bill.create({
      customerName,
      customerPhone,
      imageUrl
    });

    // Notify Admin via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new-bill', bill);
    }

    // Send WhatsApp notification
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER && process.env.OWNER_WHATSAPP_NUMBERS) {
      const ownerNumbers = process.env.OWNER_WHATSAPP_NUMBERS.split(',').map(n => n.trim());

      for (const number of ownerNumbers) {
        // Twilio requires numbers in E.164 format or prefixed with 'whatsapp:' for WhatsApp messages
        // We'll assume the env var contains numbers like "whatsapp:+1234567890" or just "+1234567890"
        let formattedNumber = number;
        if (!formattedNumber.startsWith('whatsapp:')) {
          formattedNumber = `whatsapp:${formattedNumber}`;
        }

        let fromNumber = process.env.TWILIO_PHONE_NUMBER;
        if (!fromNumber.startsWith('whatsapp:')) {
          fromNumber = `whatsapp:${fromNumber}`;
        }

        try {
          await twilioClient.messages.create({
            body: `New Grocery Bill Order!\n\nCustomer: ${customerName}\nPhone: ${customerPhone}\n\nPlease check the admin dashboard to view the bill image.`,
            from: fromNumber,
            to: formattedNumber,
            mediaUrl: [imageUrl]
          });
          console.log(`WhatsApp notification sent to ${formattedNumber}`);
        } catch (twError) {
          console.error(`Failed to send WhatsApp to ${formattedNumber}:`, twError.message);
        }
      }
    } else {
      console.log('WhatsApp notification skipped: Twilio not configured in .env');
    }

    res.status(201).json({
      success: true,
      data: bill,
      message: 'Bill uploaded successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Public (Should be protected in prod)
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update bill status
// @route   PUT /api/bills/:id
// @access  Public (Should be protected in prod)
const updateBillStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await Bill.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  uploadBill,
  getBills,
  updateBillStatus
};
