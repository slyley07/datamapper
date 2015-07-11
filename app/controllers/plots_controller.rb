require 'json'

class PlotsController < ApplicationController
  def new
    # redirect_to
  end

  def index
    @plots = Plot.all
    @user = current_user
    @post = Post.new
  end

  def create
    @parsed = JSON.parse(params)

    puts @parsed.class
    # @parsed = JSON.parse(params)
    # puts @parsed["shapes"]
		# @plot = Plot.new(params.require(:plot).permit(shapes: :id).merge(user: current_user))
    # if @plot.save
    #   redirect_to plots_path
    # else
      # puts "TEST"
      render :index
    # end
  end

  def destroy
  end
end
