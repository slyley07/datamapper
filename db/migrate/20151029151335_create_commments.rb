class CreateCommments < ActiveRecord::Migration
  def change
    create_table :commments do |t|
      t.integer :user_id
      t.integer :plot_id
      t.string :comment
    end
  end
end
