class ContactController < ApplicationController
  def create
    name    = params[:name].to_s.strip
    email   = params[:email].to_s.strip
    message = params[:message].to_s.strip

    if name.blank? || email.blank? || message.blank?
      return redirect_to root_path(anchor: "contacto"), alert: "Completá tu nombre, email y mensaje."
    end

    ContactMailer.contact_email(name, email, message).deliver_now
    redirect_to root_path(anchor: "contacto"), notice: "¡Mensaje enviado! Te respondo pronto."
  rescue => e
    Rails.logger.error "ContactMailer error: #{e.message}"
    redirect_to root_path(anchor: "contacto"), alert: "Hubo un problema al enviar. Escribime directo por WhatsApp."
  end
end
