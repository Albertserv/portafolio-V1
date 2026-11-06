Rails.application.routes.draw do
  root "home#index"
  post "contact", to: "contact#create"
end
