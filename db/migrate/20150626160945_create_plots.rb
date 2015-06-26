class CreatePlots < ActiveRecord::Migration
  def change
    create_table :plots do |t|
      t.integer :post_id
      t.integer :user_id
      t.integer :shape_id

      t.timestamps null: false
    end
  end
end
