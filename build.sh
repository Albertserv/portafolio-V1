#!/bin/bash

# Instalar dependencias
bundle install

# Precompilar los activos
bundle exec rails assets:precompile

# Asegurarse de que los activos estén en el directorio correcto para Vercel
mkdir -p public
cp -R public/* public/
