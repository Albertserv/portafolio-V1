class ApplicationMailer < ActionMailer::Base
  # Resend solo envía desde dominios verificados en tu cuenta. Configurá MAIL_FROM con uno
  # (por ejemplo "Portafolio <contacto@tudominio.com>"). Mientras tanto, onboarding@resend.dev
  # sirve para pruebas, pero solo entrega al email con el que creaste la cuenta de Resend.
  default from: ENV.fetch("MAIL_FROM", "Portafolio <onboarding@resend.dev>")
  layout "mailer"
end
