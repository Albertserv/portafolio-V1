class ContactController < ApplicationController
  def create
    # Recupera los parámetros del formulario
    name = params[:name]
    email = params[:email]
    message = params[:message]

    # Aquí puedes llamar al mailer para enviar el correo
    ContactMailer.contact_email(name, email, message).deliver_now

    # Redirige a la página de index.html.erb en la carpeta views/proyectos
    redirect_to root_path, notice: 'Mensaje enviado correctamente.'
  end
end

