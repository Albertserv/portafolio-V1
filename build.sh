#!/bin/bash

# Instala Bundler
gem install bundler -v 2.3.26 --no-document

# Instala las dependencias de Bundler
bundle install --path vendor/bundle

# Precompila los activos de Rails
bundle exec rails assets:precompile

# Asegura que los activos estén en el directorio correcto para Vercel
mkdir -p public
cp -R public/* public/
