<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body text-center">
          <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h3 class="card-title">{{ $t('errors.title') }}</h3>
          <p class="card-text">{{ $t('errors.notFound') }}</p>
          <router-link to="/" class="btn btn-primary">
            <i class="fas fa-home"></i> {{ $t('errors.backHome') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
