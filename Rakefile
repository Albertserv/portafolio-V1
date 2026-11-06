# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

# Compilar assets no necesita la clave real. Railpack (Dokploy) corre `rake assets:precompile`
# en producción sin pasarle SECRET_KEY_BASE, así que usamos la clave dummy de Rails solo para ese paso.
ENV["SECRET_KEY_BASE_DUMMY"] ||= "1" if ARGV.any? { |t| t.start_with?("assets:") }

require_relative "config/application"

Rails.application.load_tasks
