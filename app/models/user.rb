class User < ActiveRecord::Base
	attr_accessor :password
	validates :password, confirmation: true
	before_save :encrypt_password

	has_many :plots
	has_many :posts

	validates_uniqueness_of :username, :email, :case_sensitive => false
	validates_presence_of :username, :email, :fname, :lname
	validates :password, presence: true, on: :create
	validates :password_confirmation, presence: true, on: :create
	validates :username, format: { with: /\A\w+\z/, message: "Only letters, numbers, and underscores allowed!"}

	def encrypt_password
		self.password_salt = BCrypt::Engine.generate_salt
		self.password_hash = BCrypt::Engine.hash_secret(password, password_salt)
	end

	def self.authenticate(email, password)
		user = User.where(email: email).first
		if user and user.password_hash == BCrypt::Engine.hash_secret(password, user.password_salt)
			user
		else
			nil
		end
	end
end
