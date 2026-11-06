source "https://rubygems.org"

ruby "4.0.9"

gem "rails", "~> 8.1.4"

# Asset pipeline (CSS e imágenes) y JS con import maps, sin build de Node
gem "sprockets-rails"
gem "importmap-rails"

gem "sqlite3", ">= 2.1"
gem "puma", ">= 6.0"

# Arranque más rápido; requerido en config/boot.rb
gem "bootsnap", require: false

# Windows no trae los archivos de zonas horarias
gem "tzinfo-data", platforms: %i[ windows jruby ]

group :development, :test do
  gem "dotenv-rails"
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
end

group :development do
  gem "web-console"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end
