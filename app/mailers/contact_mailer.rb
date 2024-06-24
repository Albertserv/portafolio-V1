class ContactMailer < ApplicationMailer
    def contact_email(name, email, message)
      @name = name
      @email = email
      @message = message
  
      mail(to: 'adservin50@gmail.com', subject: "Mensaje de #{name}", from: email)
    end
  end
  