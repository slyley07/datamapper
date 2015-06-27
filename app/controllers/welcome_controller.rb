class WelcomeController < ApplicationController
  def index
  	@user = User.new
  end

  def create
  	@user = User.new(user_params)
  	if @user.save
  		redirect_to plots_path, notice: 'Your account has been created'
  	else
  		render :new
  	end
  end
end
