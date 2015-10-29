class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :email
      t.string :password
      t.string :fname
      t.string :lname
      t.string :website
      t.string :affiliation
      t.string :password_confirmation
      t.string :password_hash
      t.string :password_salt
    end
  end
end
