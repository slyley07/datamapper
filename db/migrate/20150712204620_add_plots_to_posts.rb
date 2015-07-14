class AddPlotsToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :plot_id, :integer
  end
end
