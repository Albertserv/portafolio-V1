class CreateProyectos < ActiveRecord::Migration[7.1]
  def change
    create_table :proyectos do |t|
      t.string :titulo
      t.text :descripcion
      t.string :url

      t.timestamps
    end
  end
end
