class Proyecto < ApplicationRecord
    validates :titulo, :descripcion, :url, presence: true
    # Validaciones adicionales pueden ser agregadas aquí
  end
  