class DataController < ApplicationController
	before_action :authenticate_user, except: [:index]

  def index

  end

  def create

  end

  def destroy
  end

end
