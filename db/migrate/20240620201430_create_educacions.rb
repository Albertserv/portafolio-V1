class CreateEducacions < ActiveRecord::Migration[7.1]
  def change
    create_table :educacions do |t|
      t.string :institucion
      t.string :titulo
      t.date :fecha_inicio
      t.date :fecha_fin
      t.text :descripcion

      t.timestamps
    end
  end
end
