class SessionsController < ApplicationController
  def new
  end

  def create
  	@user = User.find_by_email(params[:email])
  	if @user and @user.password == params[:password]
  		session[:user_id] = @user.id
  		redirect_to plots_path, notice: "Welcome back, #{@user.username}"
  	else
  		flash[:alert] = "There was a problem. Please try again!"
  		redirect_to root_path
  	end
  end

  def destroy
  	session[:user_id] = nil
  	redirect_to root_path, notice: "You have been successfully signed out!"
  end
end
