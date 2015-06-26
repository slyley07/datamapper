class DataController < ApplicationController
	before_action :authenticate_user, except: [:index]

  def new
  end

  def index
		@user = current_user
		@post = Post.new
    # @shape = Datam.new(shape: cookies[:shapes])
    # @current_shapes = cookies[:shapes]
    # unless current_location.nil?
    #   latitude = current_location.split('&')[0]
    #   longitude = current_location.split('&')[1]
    # end
  end

  def create
		@post = Post.new(params.require(:post).permit(:date, :website, :title, :address, :description).merge(user: current_user))
  end

  def destroy
  end

end
