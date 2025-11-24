const nodemailer = require('nodemailer');
const pug = require('pug');
const htmltotext = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `mohamed ashref <${process.env.EMAIL_FORM}>`;

    if (!process.env.EMAIL_FORM) {
      console.error(
        'ERROR: EMAIL_FORM is not defined in environment variables!'
      );
      process.exit(1);
    }

    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.SENDGRID_API_KEY
    ) {
      console.error(
        'ERROR: SENDGRID_API_KEY is not defined in production environment!'
      );
      process.exit(1);
    }
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //Send actual email
  async send(template, subject) {
    //1)render html based pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //2)Define email options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmltotext.fromString(html),
    };
    //3) create transprot and send email
    await this.newTransport().sendMail(emailOptions);
  }

  async sendwelcome() {
    await this.send('welcome', 'Welcome to Natours Family');
  }

  async sendpasswordResent() {
    await this.send(
      'passwordreset',
      'your password reset token (vaild only 10m)'
    );
  }

  async sendemailconfirm() {
    await this.send(
      'confirmemail',
      'confirm your account. Vaild for 30 minute only'
    );
  }
};

// const sendEmail = async options => {
//   //1)create Transport
//   const transport = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   //2)Define options email
//   const emailOptions = {
//     from: 'mohamed ashref <hello@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html: `<b>Hello world?</b>`,
//   };

//   //3)Send email
//   await transport.sendMail(emailOptions);
// };
// module.exports = sendEmail;
