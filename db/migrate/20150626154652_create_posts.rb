class CreatePosts < ActiveRecord::Migration
  def change
    create_table :posts do |t|
      t.integer :user_id
      t.datetime :date
      t.string :website
      t.string :title
      t.string :address
      t.text :description

      t.timestamps null: false
    end
  end
end
