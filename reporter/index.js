const sgMail = require('@sendgrid/mail');

if (process.env.ENV === 'development') {
  require('dotenv').config()
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const reportNotDownloadedUrl = async (url) => {
  const msg = {
    to: 'soanvig@gmail.com',
    from: 'noreply@mortmortis.pl',
    subject: 'getmusic - url not downloaded',
    text: `URL ${url} was not downloaded`,
    html: `URL <a href="${url}">${url}</a> was not downloaded`,
  }

  await sgMail.send(msg);
}

exports.reporter = async (req, res) => {
  const url = Buffer.from(req.data, 'base64').toString().trim();

  console.log(`Reporting ${url} not downloaded`);

  await reportNotDownloadedUrl(url);

  console.log(`Report for ${url} sent`);
};