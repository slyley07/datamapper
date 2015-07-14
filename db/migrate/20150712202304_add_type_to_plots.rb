class AddTypeToPlots < ActiveRecord::Migration
  def change
    add_column :plots, :type, :string
  end
end
