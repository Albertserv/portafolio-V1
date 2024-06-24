Rails.application.routes.draw do
  get 'contact/create'
  resources :proyectos, only: [:index]
  resources :habilidades
  resources :experiencias
  resources :educaciones
  post 'contact', to: 'contact#create'  # Corregido el nombre del controlador
  root 'proyectos#index'
end

