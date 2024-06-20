class CreateHabilidads < ActiveRecord::Migration[7.1]
  def change
    create_table :habilidads do |t|
      t.string :nombre
      t.string :nivel

      t.timestamps
    end
  end
end
