class ApplicationMailer < ActionMailer::Base
  # Resend solo envía desde dominios verificados en la cuenta (fluxoweb.net lo está).
  # La dirección no necesita tener una casilla real. Se puede cambiar con la variable MAIL_FROM.
  default from: ENV.fetch("MAIL_FROM", "Alberto Servin · Portafolio <portafolio@fluxoweb.net>")
  layout "mailer"
end
