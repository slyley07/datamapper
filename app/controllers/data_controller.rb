class DataController < ApplicationController
	before_action :authenticate_user, except: [:index]

  def new
  end

  def index
    # @shape = Datam.new(shape: cookies[:shapes])
    # @current_shapes = cookies[:shapes]
    # unless current_location.nil?
    #   latitude = current_location.split('&')[0]
    #   longitude = current_location.split('&')[1] 
    # end
  end

  def create
  end

  def destroy
  end

end
