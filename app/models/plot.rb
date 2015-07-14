class Plot < ActiveRecord::Base
  belongs_to :user
  has_one :post
  serialize :json
end
