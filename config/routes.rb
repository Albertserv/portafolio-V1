Rails.application.routes.draw do
  resources :proyectos, only: [:index]
  post 'contact', to: 'contact#create'
  root 'proyectos#index'
end

