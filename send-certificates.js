require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cliProgress = require('cli-progress');
const chalk = require('chalk');
const readline = require('readline');

// Konfigurasi
const config = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  email: {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    subject: `Sertifikat Anda - ${process.env.EVENT_NAME}`
  },
  rateLimit: parseInt(process.env.RATE_LIMIT_DELAY) || 500,
  eventName: process.env.EVENT_NAME,
  organizerName: process.env.ORGANIZER_NAME
};

// Buat transporter
const transporter = nodemailer.createTransport(config.smtp);

// Helper: Baca CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Helper: Validasi file JPG
function validateFiles(recipients) {
  const errors = [];
  recipients.forEach((recipient, index) => {
    const filePath = path.join(__dirname, 'certificates', recipient.sertifikat_jpg);
    if (!fs.existsSync(filePath)) {
      errors.push(`Baris ${index + 2}: File tidak ditemukan - ${recipient.sertifikat_jpg}`);
    }
  });
  return errors;
}

// Helper: Generate email HTML
function generateEmailHTML(nama, kampus) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .certificate { text-align: center; margin: 30px 0; }
    .certificate img { max-width: 100%; height: auto; border: 2px solid #ddd; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.eventName}</h1>
    </div>
    <div class="content">
      <p>Halo <strong>${nama}</strong>,</p>
      <p>Selamat! Terlampir adalah sertifikat Anda untuk <strong>${config.eventName}</strong>.</p>
      <p>Kami sangat mengapresiasi partisipasi dari <strong>${kampus}</strong>.</p>
      <div class="certificate">
        <p><strong>Sertifikat Anda:</strong></p>
        <img src="cid:certificate" alt="Sertifikat ${nama}" />
      </div>
      <p>Sertifikat juga tersedia sebagai attachment yang dapat Anda download dan print.</p>
      <p>Terima kasih atas partisipasi Anda!</p>
      <p>Salam,<br><strong>${config.organizerName}</strong></p>
    </div>
    <div class="footer">
      <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Helper: Kirim email
async function sendEmail(recipient) {
  const filePath = path.join(__dirname, 'certificates', recipient.sertifikat_jpg);
  
  const mailOptions = {
    from: config.email.from,
    to: recipient.email,
    subject: config.email.subject,
    html: generateEmailHTML(recipient.nama, recipient.kampus),
    attachments: [
      {
        filename: recipient.sertifikat_jpg,
        path: filePath,
        cid: 'certificate' // Content ID untuk embed di HTML
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

// Helper: Delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Konfirmasi user
function askConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

// Main function
async function main() {
  console.log(chalk.blue.bold('\n📧 UPSTREAM FORCE - CERTIFICATE EMAIL SENDER\n'));
  console.log(chalk.gray('━'.repeat(50)));

  try {
    // 1. Baca CSV
    console.log(chalk.cyan('\n🔍 Membaca data penerima...'));
    const recipients = await readCSV('recipients.csv');
    console.log(chalk.green(`✅ ${recipients.length} penerima ditemukan`));

    // 2. Validasi files
    console.log(chalk.cyan('\n📄 Memvalidasi file sertifikat...'));
    const errors = validateFiles(recipients);
    
    if (errors.length > 0) {
      console.log(chalk.red('\n❌ Error ditemukan:'));
      errors.forEach(err => console.log(chalk.red(`   - ${err}`)));
      process.exit(1);
    }
    console.log(chalk.green('✅ Semua file sertifikat valid'));

    // 3. Test koneksi SMTP
    console.log(chalk.cyan('\n🔌 Testing koneksi SMTP...'));
    await transporter.verify();
    console.log(chalk.green('✅ Koneksi SMTP berhasil'));

    // 4. Preview
    console.log(chalk.cyan('\n📋 Preview Pengiriman:'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(`📧 Dari: ${config.email.from}`);
    console.log(`📧 Subject: ${config.email.subject}`);
    console.log(`📊 Total penerima: ${recipients.length}`);
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.yellow('\nContoh 3 penerima pertama:'));
    recipients.slice(0, 3).forEach((r, i) => {
      console.log(`${i + 1}. ${r.nama} (${r.email}) → ${r.sertifikat_jpg}`);
    });
    console.log(chalk.gray('━'.repeat(50)));

    // 5. Konfirmasi
    const confirmed = await askConfirmation(
      chalk.yellow.bold(`\n⚠️  Kirim ${recipients.length} email sekarang? (ketik 'yes' untuk lanjut): `)
    );

    if (!confirmed) {
      console.log(chalk.red('\n❌ Pengiriman dibatalkan'));
      process.exit(0);
    }

    // 6. Kirim email
    console.log(chalk.cyan('\n📤 Mengirim email...\n'));
    
    const progressBar = new cliProgress.SingleBar({
      format: 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total} | Gagal: {failed}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    progressBar.start(recipients.length, 0, { failed: 0 });

    const results = {
      success: [],
      failed: []
    };

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      try {
        await sendEmail(recipient);
        results.success.push(recipient);
        progressBar.update(i + 1, { failed: results.failed.length });
      } catch (error) {
        results.failed.push({
          recipient,
          error: error.message
        });
        progressBar.update(i + 1, { failed: results.failed.length });
      }
      
      // Rate limiting
      if (i < recipients.length - 1) {
        await delay(config.rateLimit);
      }
    }

    progressBar.stop();

    // 7. Summary
    console.log(chalk.gray('\n' + '━'.repeat(50)));
    console.log(chalk.green.bold('\n✅ SELESAI!\n'));
    console.log(`${chalk.green('✅ Berhasil:')} ${results.success.length} email`);
    console.log(`${chalk.red('❌ Gagal:')} ${results.failed.length} email`);

    // 8. Save logs
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    if (results.failed.length > 0) {
      const failedLogPath = path.join(logsDir, `failed-${timestamp}.json`);
      fs.writeFileSync(failedLogPath, JSON.stringify(results.failed, null, 2));
      console.log(chalk.yellow(`\n📝 Log email gagal: ${failedLogPath}`));
    }

    const successLogPath = path.join(logsDir, `success-${timestamp}.json`);
    fs.writeFileSync(successLogPath, JSON.stringify(results.success, null, 2));
    console.log(chalk.cyan(`📝 Log email berhasil: ${successLogPath}`));

    console.log(chalk.gray('\n' + '━'.repeat(50)));

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

// Run
main();
