class AddJsonToPlots < ActiveRecord::Migration
  def change
    add_column :plots, :json, :text
  end
end
