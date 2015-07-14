class PostsController < ApplicationController
  def index
    @post = Post.new
  end

  def new
    @post = Post.new
  end

  def create
    @user = current_user
    @plot = Plot.all
    @post = Post.new(user: @user.id)
    respond_to do |format|
      if @post.save
        format.html { redirect_to plots_path }
        format.js
      else
        format.html { redirect_to plots_path }
      end
    end
  end

  def edit
    @user = current_user
    @post = Post.update(params[:id])
    respond_to do |format|
      if @post.update(params.require(:post).permit(:title, :description))
        format.html { redirect_to plots_path }
        format.json { respond_with_bip plots_path }
      else
        format.html { render action: "index" }
        format.json { respond_with_bip root_path }
      end
    end
  end

  def show
  end
end
