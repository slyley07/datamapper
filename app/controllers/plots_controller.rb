class PlotsController < ApplicationController
  def new
    @plot = Plot.new
  end

  def index
    @plots = Plot.all
    @user = current_user
    @post = Post.new
    @plot = Plot.new
    # @shape = Plot.new(title: cookies[:shapes["type"]])
  end

  def create
    @plot = Plot.new(json: cookies[:shapes])
    if @plot.save
      redirect_to plots_path
    else
      render :index
    end
		# @post = Post.new(params.require(:post).permit(:date, :website, :title, :address, :description).merge(user: current_user))
  end

  def destroy
  end
end
