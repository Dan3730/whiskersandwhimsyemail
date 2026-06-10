import nodemailer from 'nodemailer'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const smtpHost = Netlify.env.get('SMTP_HOST')
  const smtpPort = parseInt(Netlify.env.get('SMTP_PORT') || '587')
  const smtpUser = Netlify.env.get('SMTP_USER')
  const smtpPass = Netlify.env.get('SMTP_PASS')
  const toEmail = Netlify.env.get('TO_EMAIL')

  if (!smtpHost || !smtpUser || !smtpPass || !toEmail) {
    console.error('Missing required email environment variables')
    return Response.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `"Whiskers & Whimsy Contact" <${smtpUser}>`,
      replyTo: `"${name}" <${email}>`,
      to: toEmail,
      subject: `New message from ${name} – Whiskers & Whimsy`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#f30081">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border:1px solid #eee;margin:20px 0">
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap">${message}</p>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Failed to send email:', err)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

export const config = {
  path: '/api/send-email',
  method: 'POST',
}
