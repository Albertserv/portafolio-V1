class ContactController < ApplicationController
  def create
    name    = params[:name]
    email   = params[:email]
    message = params[:message]

    ContactMailer.contact_email(name, email, message).deliver_now
    redirect_to root_path(anchor: 'contact'), notice: 'Mensaje enviado. Te respondo pronto.'
  rescue => e
    Rails.logger.error "ContactMailer error: #{e.message}"
    redirect_to root_path(anchor: 'contact'), alert: 'Hubo un problema al enviar. Escribime directo por WhatsApp.'
  end
end

