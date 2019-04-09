var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aviralmk@gmail.com',
    pass: '94162030'
  },
  tls: { rejectUnauthorized: false }
});

module.exports = transporter;