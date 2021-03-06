require 'json'

class PlotsController < ApplicationController
  def new
    @plots = Plot.all
  end

  def index
    @plots = Plot.all
    @post = Post.new
    @plot = Plot.new
    respond_to do |format|
      format.html
      format.js {}
      format.json {
        render json: {:json => @plots}
      }
    end
  end

  def create
    parsed = ActiveSupport::JSON.decode(params[:_json])
    @shape = parsed["shapes"][-1]
    @id = @shape.keys
    @json = @shape.values
    @type = @json[0]["type"]

    # Find the type of each shape object
    if @type == 'circle'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
    elsif @type == 'rectangle'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
    elsif @type == 'polyline'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
    elsif @type == 'polygon'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
    end
  end

  def destroy
    @plot = Plot.find(:id)
    if @plot.destroy
      p "Success"
    else
      p "Sorry bud"
    end
  end

  private

  def plot_params
    params.require(:plot).permit(:shape_id).merge(:current_user)
  end

end
