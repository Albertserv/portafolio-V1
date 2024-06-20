class AddImagenToProyectos < ActiveRecord::Migration[7.1]
  def change
    add_column :proyectos, :imagen, :string
  end
end
