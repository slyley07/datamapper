class PlotsController < ApplicationController
  def new
    @plot = Plot.new
  end

  def index
    @plots = Plot.all
    @user = current_user
    @post = Post.new
  end

  def create
    # @plot = Plot.new(json: params[:id])
		# @plot = Plot.new(params.require(:plot).permit(shapes: :id).merge(user: current_user))
    # if @plot.save
    #   redirect_to plots_path
    # else
    #   render :index
    # end
  end

  def destroy
  end
end
