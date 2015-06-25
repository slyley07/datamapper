class Comment < ActiveRecord::Base
	belongs_to :user
	belongs_to :datam
	validates :comment, presence: true, length:{ maximum: 80 }
end
