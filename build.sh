#!/bin/bash

# Configurar Bundler para usar un directorio local 'vendor/bundle'
bundle config set --local path 'vendor/bundle'

# Instalar Bundler usando la versión específica
gem install bundler -v 2.3.26 --no-document

# Instalar las dependencias de Bundler
bundle install

# Asegurar que los activos estén precompilados
bundle exec rails assets:precompile

# Asegurar que los activos estén en el directorio correcto para Vercel
mkdir -p public
cp -R public/* public/
