class AddShapeToPlots < ActiveRecord::Migration
  def change
    add_column :plots, :shape, :string
    remove_column :plots, :type, :string
  end
end
