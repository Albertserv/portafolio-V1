class ProyectosController < ApplicationController
  def index
    @proyectos = Proyecto.all
  end
end
