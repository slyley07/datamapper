class UsersController < ApplicationController
  before_action :authenticate_user, only: [:update, :destroy]
  before_action :current_u, only: [:edit, :update, :destroy]
  
  def new
  	@user = User.new
  end

  def show
  	@user = User.find(params[:id])
  end

  def edit
  end

  def create
  	@user = User.new(user_params)
  	if @user.save
      session[:user_id] = @user.id
  		redirect_to @user, notice: 'Your account has been created'
  	else
  		render :new
  	end
  end

  def update
  	if @user.update(user_params)
  		redirect_to @user, notice: 'User was successfully updated.'
  	else
  		render :edit
  	end
  end

  def destroy
  	@user.destroy
  	redirect_to root_path, notice: 'Your account has been closed.'
  end

  private

  def user_params
		params.require(:user).permit(:username, :email, :password, :password_confirmation, :fname, :lname, :website, :affiliation)
  end

  def current_u
    @user = current_user
  end

end
