#!/bin/bash

# Define la ruta de rbenv en el sistema
export RBENV_ROOT="/ruta/a/tu/directorio/rbenv"

# Añade rbenv al PATH y carga el entorno rbenv
export PATH="$RBENV_ROOT/bin:$PATH"
eval "$(rbenv init -)"

# Usa la versión correcta de Ruby
rbenv install -s 3.1.4
rbenv local 3.1.4

# Instala Bundler usando la versión específica
gem install bundler -v 2.3.26 --no-document

# Instala las dependencias de Bundler
bundle install --path vendor/bundle

# Precompila los activos de Rails
bundle exec rails assets:precompile

# Asegura que los activos estén en el directorio correcto para Vercel
mkdir -p public
cp -R public/* public/
