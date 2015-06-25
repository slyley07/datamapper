class Datam < ActiveRecord::Base
	belongs_to :user
	has_many :comments

	geocoded_by :address
	after_validation :geocode
end
