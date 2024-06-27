#!/bin/bash

# Usa la versión correcta de Ruby
rbenv install -s 3.1.4
rbenv local 3.1.4

# Instalar Bundler
gem install bundler -v 2.3.26

# Instalar dependencias
bundle install

# Precompilar los activos
bundle exec rails assets:precompile

# Asegurarse de que los activos estén en el directorio correcto para Vercel
mkdir -p public
cp -R public/* public/
