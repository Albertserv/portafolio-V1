class ContactMailer < ApplicationMailer
    def contact_email(name, email, message)
      @name = name
      @email = email
      @message = message
  
      mail(
        to:       'adservin50@gmail.com',
        reply_to: email,
        subject:  "Portafolio — Mensaje de #{name}"
      )
    end
  end
  