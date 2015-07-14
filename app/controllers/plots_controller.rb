require 'json'

class PlotsController < ApplicationController
  def new
    @plots = Plot.all
  end

  def index
    @plots = Plot.all
    # @plat = Plot.find(48)
    @post = Post.new
    @plot = Plot.new
    # p @plots
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

    if @type == 'circle'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
      p @plot.json[0]["cords"]
    elsif @type == 'rectangle'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
      p @plot.json[0]
    elsif @type == 'polyline'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
      p @plot.json[0]["path"]
      # p @plot.json[0]["path"]
    elsif @type == 'polygon'
      @plot = Plot.new(shape_id: @id, user: current_user, json: @json)
      @plot.save
      p @plot.json[0]["paths"]
    end
  end

  def destroy
  end

  private

  def plot_params
    params.require(:plot).permit(:shape_id).merge(:current_user)
  end

end
