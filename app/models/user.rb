class User < ActiveRecord::Base
	has_many :data

	validates :password, confirmation: true
	validates_uniqueness_of :username, :email, :case_sensitive => false
	validates_presence_of :username, :email, :fname, :lname
	validates :password, presence: true, on: :create
	validates :password_confirmation, presence: true, on: :create
	validates :username, format: { with: /\A\w+\z/, message: "Only letters, numbers, and underscores allowed!"}
end
