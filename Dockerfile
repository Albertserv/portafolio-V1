# syntax = docker/dockerfile:1

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version and Gemfile
ARG RUBY_VERSION=3.1.4
FROM ruby:$RUBY_VERSION-slim as base

# Rails app lives here
WORKDIR /rails

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development" \
    SECRET_KEY_BASE="0oT5v+Hg9G5dgb7e7mTNQz4whkSVUzklctCg1Htap1iIfKQTXvkLOtP+wultmYV8BxTZ3rENRv7ed3RLdFM9+L+KTwNzejGY1zC5qqSjm7hOFKG3jmzDDdILDZRr0wIdkMsM8o+Fmkq66ct1elrz+9HmsOoOPXsqobHCkq3JL+hcRtkEdHepE9un8mnhV6uMt2kIPwTldIWQ7M5igrV4CoVHVV8bSkrl61lzaC+2+5UeWLTYVmZyJPOLQLcG/vMnySapBcI3p0rufspqtCVaFl3eDCbFByH96v96ys7x1/nVmfvlFEOcTh/uhpjz81rOsKJn8XJ5ngma1/kHOj8jdDbW++4ZZI15gkgelqJBX3oe6jRJGzm6ww4CQbe+P6Aqgb8e4oSfjqYr3nBwBUnEtD/9cVQa--RZgkhhaywJQV1MH7--hxvYMLwnqQkm+4YKjqQs3Q=="


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libvips pkg-config

# Install application gems
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libsqlite3-0 libvips && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built artifacts: gems, application
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /rails /rails

# Run and own only the runtime files as a non-root user for security
RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp
USER rails:rails

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD ["./bin/rails", "server"]
