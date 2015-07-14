class DropDatamsTable < ActiveRecord::Migration
  def change
    drop_table :datams
  end
end
