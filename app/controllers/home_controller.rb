class HomeController < ApplicationController
  def index
    @proyectos   = Portafolio::PROYECTOS
    @experiencia = Portafolio::EXPERIENCIA
    @capas       = Portafolio::CAPAS
  end
end
