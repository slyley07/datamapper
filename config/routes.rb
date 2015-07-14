Rails.application.routes.draw do
  get '/login', to: 'sessions#new'

  post '/login', to: 'sessions#create'

  delete '/logout', to: 'sessions#destroy'

  resources :users
  resources :plots
  resources :posts

  root 'welcome#index'

end
