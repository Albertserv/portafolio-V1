class HomeController < ApplicationController
  def index
    @proyectos   = Portafolio::PROYECTOS
    @experiencia = Portafolio::EXPERIENCIA
    @stack       = Portafolio::STACK
  end
end
